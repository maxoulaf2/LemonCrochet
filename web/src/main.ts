import './style.css';
import { createEditor } from './editor';
import { SAMPLE_PATTERN } from './sample-pattern';
import { createScene } from './scene';

const editorPanel = document.querySelector<HTMLElement>('#editor-panel');
if (editorPanel) {
  createEditor(editorPanel, SAMPLE_PATTERN);
}

const scenePanel = document.querySelector<HTMLElement>('#scene-panel');
if (scenePanel) {
  createScene(scenePanel);
}
