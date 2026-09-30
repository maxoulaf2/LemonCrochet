// Web Worker: the only place where the WASM module is instantiated.
// Parsing (E1) and the solver (E7) will run here, never on the main thread.
import init, { count_lines, version } from './wasm/crochet_wasm';
import type { AnalyseRequest, AnalyseResponse } from './worker-protocol';

// tsconfig loads both the DOM and WebWorker libs, so `self` is typed as a Window
// by default: narrow it to the worker's own global scope.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

// Started once, when the worker boots. Every request awaits this same promise:
// the module is fetched and compiled a single time, and a load failure is
// reported to each request instead of being lost.
const ready = init();

ctx.onmessage = async (event: MessageEvent<AnalyseRequest>) => {
  const { id, text } = event.data;
  let response: AnalyseResponse;
  try {
    await ready;
    response = { id, ok: true, result: { version: version(), lineCount: count_lines(text) } };
  } catch (error) {
    response = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  ctx.postMessage(response);
};
