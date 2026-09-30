import './style.css';
// `?worker` is a Vite import: it bundles the file as a module worker and
// exports a constructor for it.
import AnalysisWorker from './analysis.worker?worker';
import { createAnalysisClient } from './analysis-client';
import { createEditor } from './editor';
import { SAMPLE_PATTERN } from './sample-pattern';
import { createScene } from './scene';
import { STATUS_LOADING, formatStatus } from './status';

const statusBar = document.querySelector<HTMLElement>('#status-bar');
const setStatus = (text: string) => {
  if (statusBar) {
    statusBar.textContent = text;
  }
};
setStatus(STATUS_LOADING);

// Note: the line count comes from Rust's `str::lines`, which ignores the empty
// line after a final "\n", whereas the editor gutter numbers it.
const analysis = createAnalysisClient(new AnalysisWorker(), (response) => {
  setStatus(formatStatus(response));
});

const editorPanel = document.querySelector<HTMLElement>('#editor-panel');
if (editorPanel) {
  createEditor(editorPanel, SAMPLE_PATTERN, (text) => analysis.analyse(text));
  // Analyse the initial content too, not only later edits.
  analysis.analyse(SAMPLE_PATTERN);
}

const scenePanel = document.querySelector<HTMLElement>('#scene-panel');
if (scenePanel) {
  createScene(scenePanel);
}
