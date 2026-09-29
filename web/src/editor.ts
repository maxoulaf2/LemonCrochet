import { EditorView, basicSetup } from 'codemirror';

// Mounts a CodeMirror 6 editor inside `parent`.
// `basicSetup` bundles line numbers, undo/redo history, bracket matching,
// search, etc. No DSL-specific highlighting yet (E4.1).
export function createEditor(parent: HTMLElement, doc: string): EditorView {
  return new EditorView({
    doc,
    extensions: [basicSetup],
    parent,
  });
}
