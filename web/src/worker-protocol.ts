// Messages exchanged between the page (main thread) and the WASM worker.
// Imported by both sides so they cannot drift apart.

// Page → worker: analyse this text. `id` increases with every request, so the page
// can tell a stale response (older id) from the one it is waiting for.
export interface AnalyseRequest {
  id: number;
  text: string;
}

// Worker → page: the result for request `id`, or an error.
// Discriminated union on `ok`: TypeScript narrows the type after `if (response.ok)`,
// much like pattern matching on a Rust `Result<T, E>`.
export type AnalyseResponse =
  | { id: number; ok: true; result: AnalyseResult }
  | { id: number; ok: false; error: string };

export interface AnalyseResult {
  version: string;
  lineCount: number;
}
