import type { AnalyseResponse } from './worker-protocol';

export const STATUS_LOADING = 'Chargement du module d’analyse…';

// Text of the status bar for a worker response. User-facing, hence in French.
export function formatStatus(response: AnalyseResponse): string {
  if (!response.ok) {
    return `Erreur : le module d’analyse n’a pas pu répondre (${response.error})`;
  }
  const { version, lineCount } = response.result;
  const lines = lineCount > 1 ? 'lignes' : 'ligne';
  return `crochet-wasm ${version} · ${lineCount} ${lines}`;
}
