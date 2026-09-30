import { describe, expect, it } from 'vitest';
import { createAnalysisClient, type WorkerLike } from './analysis-client';
import { formatStatus } from './status';
import type { AnalyseRequest, AnalyseResponse } from './worker-protocol';

// Fake worker: records requests and lets the test deliver responses in any order.
class FakeWorker implements WorkerLike {
  requests: AnalyseRequest[] = [];
  terminated = false;
  onmessage: ((event: MessageEvent<AnalyseResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  postMessage(message: AnalyseRequest): void {
    this.requests.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  reply(response: AnalyseResponse): void {
    this.onmessage?.({ data: response } as MessageEvent<AnalyseResponse>);
  }

  fail(message: string): void {
    this.onerror?.({ message } as ErrorEvent);
  }
}

const success = (id: number, lineCount: number): AnalyseResponse => ({
  id,
  ok: true,
  result: { version: '0.1.0', lineCount },
});

describe('createAnalysisClient', () => {
  it('sends each text with an increasing id', () => {
    const worker = new FakeWorker();
    const client = createAnalysisClient(worker, () => {});

    client.analyse('a');
    client.analyse('a\nb');

    expect(worker.requests).toEqual([
      { id: 1, text: 'a' },
      { id: 2, text: 'a\nb' },
    ]);
  });

  it('ignores a late response to an older request', () => {
    const worker = new FakeWorker();
    const received: AnalyseResponse[] = [];
    const client = createAnalysisClient(worker, (response) => received.push(response));

    client.analyse('a');
    client.analyse('a\nb');
    worker.reply(success(2, 2));
    worker.reply(success(1, 1)); // arrives late

    expect(received).toEqual([success(2, 2)]);
  });

  it('reports a worker failure as an error response', () => {
    const worker = new FakeWorker();
    const received: AnalyseResponse[] = [];
    const client = createAnalysisClient(worker, (response) => received.push(response));

    client.analyse('a');
    worker.fail('boom');

    expect(received).toEqual([{ id: 1, ok: false, error: 'boom' }]);
  });

  it('terminates the worker on dispose', () => {
    const worker = new FakeWorker();
    createAnalysisClient(worker, () => {}).dispose();
    expect(worker.terminated).toBe(true);
  });
});

describe('formatStatus', () => {
  it('shows the module version and the line count', () => {
    expect(formatStatus(success(1, 12))).toBe('crochet-wasm 0.1.0 · 12 lignes');
  });

  it('uses the singular for zero or one line', () => {
    expect(formatStatus(success(1, 1))).toBe('crochet-wasm 0.1.0 · 1 ligne');
    expect(formatStatus(success(1, 0))).toBe('crochet-wasm 0.1.0 · 0 ligne');
  });

  it('shows a French error message instead of staying empty', () => {
    expect(formatStatus({ id: 1, ok: false, error: 'boom' })).toBe(
      'Erreur : le module d’analyse n’a pas pu répondre (boom)',
    );
  });
});
