import { EditorView, basicSetup } from 'codemirror';

// Mounts a CodeMirror 6 editor inside `parent`.
// `basicSetup` bundles line numbers, undo/redo history, bracket matching,
// search, etc. No DSL-specific highlighting yet (E4.1).
// `onChange` receives the full text after every edit (no debounce yet: E4.3).
export function createEditor(
  parent: HTMLElement,
  doc: string,
  onChange: (text: string) => void,
): EditorView {
  return new EditorView({
    doc,
    extensions: [
      basicSetup,
      // Called on every editor update (selection, focus…): only react to text changes.
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    ],
    parent,
  });
}
