import type { AnalyseRequest, AnalyseResponse } from './worker-protocol';

// The subset of the Worker API the client relies on. Depending on this small
// interface (rather than on `Worker`) lets tests pass a fake worker in Node.
export interface WorkerLike {
  postMessage(message: AnalyseRequest): void;
  terminate(): void;
  onmessage: ((event: MessageEvent<AnalyseResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
}

export interface AnalysisClient {
  analyse(text: string): void;
  dispose(): void;
}

// Sends texts to the worker and reports only the response to the latest request.
export function createAnalysisClient(
  worker: WorkerLike,
  onResponse: (response: AnalyseResponse) => void,
): AnalysisClient {
  let latestId = 0;

  worker.onmessage = (event) => {
    // A response with an older id answers a text that has since been replaced: drop it.
    if (event.data.id === latestId) {
      onResponse(event.data);
    }
  };

  // Fired when the worker script itself fails (e.g. it could not be loaded):
  // no response will ever come, so report the failure for the pending request.
  worker.onerror = (event) => {
    onResponse({ id: latestId, ok: false, error: event.message });
  };

  return {
    analyse(text) {
      latestId += 1;
      worker.postMessage({ id: latestId, text });
    },
    dispose() {
      worker.terminate();
    },
  };
}
