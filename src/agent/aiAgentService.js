/**
 * FlowCare AI — Modular AI Agent Service
 * 
 * PRODUCT & ARCHITECTURAL PRINCIPLES:
 * ============================================================================
 * 1. Operational Scope Only:
 *    FlowCare AI investigates workflow and operational bottlenecks (queues,
 *    resource allocation, logistics delays). It NEVER diagnoses, prescribes,
 *    or makes clinical treatment decisions.
 * 
 * 2. Strict JSON Schema Validation:
 *    The AI agent returns a validated structured payload.
 * 
 * 3. Provider Decoupling & Graceful Fallback:
 *    If VITE_AI_API_KEY is not configured or an API error occurs,
 *    the service automatically and gracefully falls back to deterministic
 *    operational reasoning rules without crashing the UI.
 * 
 * 4. Human Approval Mandatory:
 *    All outputs strictly flag `requiresHumanApproval: true`. No automated
 *    execution is allowed at this stage.
 * 
 * 5. Request Serialization:
 *    All Gemini API calls are serialized through a mutex-based queue.
 *    Only one HTTP request is in-flight at any time, with a mandatory
 *    cooldown between requests to stay within free-tier RPM limits.
 * 
 * 6. Deduplication:
 *    A bottleneck that has already been submitted for investigation
 *    will not be submitted again (until the dedup state is reset).
 * 
 * 7. Retry with Backoff:
 *    429 (rate limit) and 5xx responses are retried with exponential
 *    backoff (up to MAX_RETRIES). Other errors fall through to the
 *    deterministic fallback immediately.
 * ============================================================================
 */

import { getDeterministicInvestigation } from './investigationEngine';

/**
 * System prompt instructing the LLM to act strictly as a Hospital Workflow Operations Agent
 */
const SYSTEM_INSTRUCTION = `You are FlowCare AI, an agentic hospital workflow orchestration system.
Your role is exclusively OPERATIONAL: you analyze diagnostic workflow bottlenecks (such as lab queue congestion, transport delays, analyzer capacity, or review backlog).

STRICT BOUNDARIES:
- You DO NOT provide medical diagnosis, medical treatment advice, or clinical decisions.
- You DO NOT prescribe medications or alter patient care plans.
- You ONLY reason about operational queue delays, logistics, staffing allocations, and process velocity.
- You MUST return valid JSON matching the exact schema requested.
- All actions require human hospital coordinator authorization.`;

// ---------------------------------------------------------------------------
// Serial Request Queue — guarantees exactly one in-flight Gemini API call
// ---------------------------------------------------------------------------

/** @type {Array<{id: string, fn: () => Promise<any>, resolve: Function, reject: Function}>} */
const _pendingQueue = [];

/** true while the drain loop is active (a request is in-flight or cooling down) */
let _isProcessing = false;

/** Dedup: bottleneck IDs that have already been submitted for investigation */
const _investigatedIds = new Set();

/**
 * Minimum milliseconds between consecutive Gemini API requests.
 * At 4 500 ms the theoretical max throughput is ~13.3 RPM, safely under
 * the free-tier limit of 15 RPM.
 */
const MIN_DELAY_MS = 4500;

/** Maximum number of retries for retriable (429 / 5xx) errors */
const MAX_RETRIES = 2;

/** Base delay for exponential backoff on retries (ms) */
const RETRY_BASE_MS = 6000;

/**
 * Monotonically increasing request counter — used only for logging so the
 * developer can visually confirm sequential execution in the console.
 */
let _requestSeq = 0;

// ---------------------------------------------------------------------------
// Queue machinery
// ---------------------------------------------------------------------------

/**
 * Drains the queue one item at a time, with a mandatory cooldown between items.
 * Guarantees: at most 1 in-flight fetch + MIN_DELAY_MS gap before the next.
 */
async function _drainQueue() {
  if (_isProcessing) return;        // another drain loop is already active
  _isProcessing = true;

  while (_pendingQueue.length > 0) {
    const { id, fn, resolve } = _pendingQueue.shift();
    console.info(
      `[FlowCare AI Queue] ▶ Processing ${id}  ` +
      `(remaining in queue: ${_pendingQueue.length})`
    );

    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      // Should never happen — _executeGeminiRequest has its own try/catch.
      // But resolve with fallback rather than rejecting, to keep the UI stable.
      console.warn(`[FlowCare AI Queue] Unexpected queue-level error for ${id}:`, err.message);
      resolve({
        source: 'DEMO_FALLBACK',
        sourceNotice: 'Queue error — using fallback.',
        errorDetails: err.message
      });
    }

    // Mandatory cooldown before next request
    if (_pendingQueue.length > 0) {
      console.info(
        `[FlowCare AI Queue] ⏳ Cooling down ${MIN_DELAY_MS}ms before next request...`
      );
      await new Promise((r) => setTimeout(r, MIN_DELAY_MS));
    }
  }

  _isProcessing = false;
  console.info('[FlowCare AI Queue] ■ Queue drained — idle.');
}

/**
 * Enqueues a function to be executed serially.  Returns a promise that
 * resolves when that specific function completes.
 *
 * @param {string} id   Human-readable label for logging
 * @param {() => Promise<any>} fn  The async work to perform
 * @returns {Promise<any>}
 */
function enqueueRequest(id, fn) {
  return new Promise((resolve, reject) => {
    _pendingQueue.push({ id, fn, resolve, reject });
    console.info(
      `[FlowCare AI Queue] ＋ Enqueued ${id}  ` +
      `(queue depth: ${_pendingQueue.length}, processing: ${_isProcessing})`
    );
    _drainQueue();       // kick off processing if not already running
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates the raw JSON structure returned by the LLM
 */
export function validateAgentResponse(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.likelyCause !== 'string' || !data.likelyCause.trim()) return false;
  if (!Array.isArray(data.evidence) || data.evidence.length === 0) return false;
  if (!Array.isArray(data.possibleActions) || data.possibleActions.length === 0) return false;
  if (!data.recommendedAction || typeof data.recommendedAction.description !== 'string') return false;
  
  const validConfidence = ['LOW', 'MEDIUM', 'HIGH'];
  const confidence = (data.confidence || '').toUpperCase();
  if (!validConfidence.includes(confidence)) {
    data.confidence = 'HIGH';
  } else {
    data.confidence = confidence;
  }

  data.requiresHumanApproval = true;
  return true;
}

/**
 * Resets the deduplication state.  Call this when the simulation is reset
 * so that previously-investigated bottleneck IDs can be investigated again.
 */
export function resetDeduplicationState() {
  _investigatedIds.clear();
  // Also drain any pending items — they belong to the previous simulation run
  _pendingQueue.length = 0;
  _requestSeq = 0;
  console.info('[FlowCare AI] Deduplication state and pending queue cleared (simulation reset).');
}

/**
 * Calls the AI Agent with structured operational context.
 * Requests are serialized through a mutex queue to avoid RPM exhaustion.
 * Duplicate bottleneck IDs are rejected immediately with a fallback result.
 * 
 * @param {Object} bottleneckContext Structured operational telemetry
 * @returns {Promise<Object>} Validated structured investigation result
 */
export async function queryAIAgent(bottleneckContext) {
  // Read API key ONLY from VITE_AI_API_KEY (set in .env.local)
  const apiKey = (import.meta.env?.VITE_AI_API_KEY || '').trim();

  // If no API key is configured, immediately use deterministic fallback
  if (!apiKey) {
    console.info('[FlowCare AI] No API key configured. Using deterministic investigation fallback.');
    const fallbackResult = getDeterministicInvestigation(bottleneckContext);
    return {
      ...fallbackResult,
      source: 'DEMO_FALLBACK',
      sourceNotice: 'AI agent unavailable — using demo investigation fallback.'
    };
  }

  // Deduplication: skip if this bottleneck was already submitted
  const dedupKey = bottleneckContext.bottleneckId || bottleneckContext.patientId;
  if (_investigatedIds.has(dedupKey)) {
    console.info(`[FlowCare AI] ✗ Duplicate skipped for ${dedupKey} — already investigated.`);
    const fallbackResult = getDeterministicInvestigation(bottleneckContext);
    return {
      ...fallbackResult,
      source: 'DEMO_FALLBACK',
      sourceNotice: 'Duplicate investigation skipped — using cached fallback.'
    };
  }
  _investigatedIds.add(dedupKey);

  // Serialize the actual API call through the queue
  return enqueueRequest(
    dedupKey,
    () => _executeGeminiRequest(apiKey, bottleneckContext)
  );
}

/**
 * Executes a single Gemini API request with retry support for retriable errors.
 * Called only from the serialized queue — never concurrently.
 * @private
 */
async function _executeGeminiRequest(apiKey, bottleneckContext, attempt = 0) {
  _requestSeq += 1;
  const seq = _requestSeq;

  const prompt = `Analyze this hospital diagnostic workflow bottleneck and return a STRICT JSON response.

Operational Context:
- Patient ID (Synthetic): ${bottleneckContext.patientId}
- Workflow Type: ${bottleneckContext.workflowType}
- Department: ${bottleneckContext.department}
- Current Stage: ${bottleneckContext.currentStage}
- Expected Next Event: ${bottleneckContext.expectedNextEvent}
- Elapsed Time in Stage: ${bottleneckContext.elapsedMinutes} minutes
- Configured Target SLA: ${bottleneckContext.configuredTargetMinutes} minutes
- Warning Threshold: ${bottleneckContext.warningThresholdMinutes} minutes
- Pending Work Count in Queue: ${bottleneckContext.pendingWorkCount}
- Available Operational Resources: ${bottleneckContext.availableOperationalResources}
- Priority: ${bottleneckContext.priority}
- Recent Telemetry History: ${JSON.stringify(bottleneckContext.eventHistory || [])}

Required JSON Output Schema:
{
  "likelyCause": "Brief 1-sentence description of the operational cause",
  "evidence": [
    "Specific operational evidence point 1",
    "Specific operational evidence point 2"
  ],
  "possibleActions": [
    {
      "id": "ACTION_KEY_1",
      "description": "Clear operational action description",
      "impact": "LOW | MEDIUM | HIGH"
    },
    {
      "id": "ACTION_KEY_2",
      "description": "Alternative operational action description",
      "impact": "LOW | MEDIUM | HIGH"
    }
  ],
  "recommendedAction": {
    "id": "ACTION_KEY_1",
    "description": "Clear description of the safest recommended operational action",
    "reason": "Clear explanation of why this operational action addresses the bottleneck safely"
  },
  "confidence": "LOW | MEDIUM | HIGH",
  "requiresHumanApproval": true
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    console.info(
      `[FlowCare AI] >>> [#${seq}] Sending Gemini request for ` +
      `${bottleneckContext.patientId} (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`
    );

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    // -----------------------------------------------------------------------
    // Retriable errors: 429 (rate limit) and 5xx (server errors)
    // -----------------------------------------------------------------------
    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      const backoffMs = RETRY_BASE_MS * Math.pow(2, attempt);
      console.warn(
        `[FlowCare AI] ⚠ [#${seq}] Received ${response.status} for ` +
        `${bottleneckContext.patientId}. Retrying in ${backoffMs}ms ` +
        `(attempt ${attempt + 1}/${MAX_RETRIES})...`
      );
      await new Promise((r) => setTimeout(r, backoffMs));
      return _executeGeminiRequest(apiKey, bottleneckContext, attempt + 1);
    }

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status} ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response received from LLM provider.');
    }

    const parsedData = JSON.parse(rawText);

    if (validateAgentResponse(parsedData)) {
      console.info(
        `[FlowCare AI] ✓ [#${seq}] AI investigation SUCCESS for ` +
        `${bottleneckContext.patientId} (source: AI_AGENT).`
      );
      return {
        bottleneckId: bottleneckContext.bottleneckId,
        patientId: bottleneckContext.patientId,
        workflowType: bottleneckContext.workflowType,
        department: bottleneckContext.department,
        stage: bottleneckContext.currentStage,
        expectedNextEvent: bottleneckContext.expectedNextEvent,
        timestamp: bottleneckContext.timestamp || 'just now',
        ...parsedData,
        source: 'AI_AGENT',
        sourceNotice: 'AI Investigation (Gemini Flash Model)'
      };
    } else {
      throw new Error('LLM response failed schema validation.');
    }
  } catch (error) {
    console.warn(
      `[FlowCare AI] ✗ [#${seq}] Falling back to deterministic reasoning for ` +
      `${bottleneckContext.patientId}:`,
      error.message
    );
    const fallbackResult = getDeterministicInvestigation(bottleneckContext);
    return {
      ...fallbackResult,
      source: 'DEMO_FALLBACK',
      sourceNotice: 'AI agent unavailable — using demo investigation fallback.',
      errorDetails: error.message
    };
  }
}
