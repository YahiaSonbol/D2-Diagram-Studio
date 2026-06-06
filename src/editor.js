// CodeMirror 6 Editor Setup for D2

import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, foldGutter, foldKeymap, syntaxHighlighting, HighlightStyle, StreamLanguage } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { tags } from '@lezer/highlight';

/**
 * Simple D2 language mode using StreamLanguage
 */
const d2Language = StreamLanguage.define({
  token(stream, state) {
    // Comments
    if (stream.match('#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // Strings
    if (stream.match('"')) {
      while (!stream.eol()) {
        if (stream.next() === '"') break;
      }
      return 'string';
    }

    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'") break;
      }
      return 'string';
    }

    // Arrows
    if (stream.match(/->|<-|<->|--|<--|-->/) ) {
      return 'operator';
    }

    // Keywords
    if (stream.match(/\b(shape|style|direction|label|icon|tooltip|link|near|width|height|grid-rows|grid-columns|grid-row|grid-column|constraint|vars|d2-config|layout-engine)\b/)) {
      return 'keyword';
    }

    // Shape types
    if (stream.match(/\b(rectangle|square|page|parallelogram|document|cylinder|queue|package|step|callout|stored_data|person|diamond|oval|circle|hexagon|cloud|text|code|class|sql_table|image|sequence_diagram)\b/)) {
      return 'typeName';
    }

    // Style properties
    if (stream.match(/\b(fill|stroke|stroke-width|stroke-dash|font-color|font-size|font|bold|italic|underline|shadow|opacity|border-radius|animated|3d|multiple|double-border)\b/)) {
      return 'propertyName';
    }

    // Direction values
    if (stream.match(/\b(up|down|left|right)\b/)) {
      return 'atom';
    }

    // Boolean / special values
    if (stream.match(/\b(true|false|null)\b/)) {
      return 'bool';
    }

    // Numbers
    if (stream.match(/\b\d+(\.\d+)?\b/)) {
      return 'number';
    }

    // Hex colors
    if (stream.match(/#[0-9a-fA-F]{3,8}\b/)) {
      return 'color';
    }

    // Colons
    if (stream.match(':')) {
      return 'punctuation';
    }

    // Braces
    if (stream.match(/[{}]/)) {
      return 'brace';
    }

    // Pipes (block strings)
    if (stream.match('|')) {
      return 'meta';
    }

    // Semicolons
    if (stream.match(';')) {
      return 'punctuation';
    }

    // Anything else
    stream.next();
    return null;
  }
});

/**
 * Custom highlight style for D2
 */
const d2HighlightStyleDark = HighlightStyle.define([
  { tag: tags.comment, color: '#6a7085', fontStyle: 'italic' },
  { tag: tags.string, color: '#a5d6ff' },
  { tag: tags.keyword, color: '#c084fc', fontWeight: '500' },
  { tag: tags.typeName, color: '#67e8f9' },
  { tag: tags.propertyName, color: '#86efac' },
  { tag: tags.operator, color: '#f472b6', fontWeight: '600' },
  { tag: tags.atom, color: '#fbbf24' },
  { tag: tags.bool, color: '#fb923c' },
  { tag: tags.number, color: '#fb923c' },
  { tag: tags.color, color: '#f472b6' },
  { tag: tags.punctuation, color: '#94a3b8' },
  { tag: tags.brace, color: '#e2e8f0' },
  { tag: tags.meta, color: '#818cf8' },
]);

const d2HighlightStyleLight = HighlightStyle.define([
  { tag: tags.comment, color: '#8899aa', fontStyle: 'italic' },
  { tag: tags.string, color: '#0550ae' },
  { tag: tags.keyword, color: '#7c3aed', fontWeight: '500' },
  { tag: tags.typeName, color: '#0891b2' },
  { tag: tags.propertyName, color: '#059669' },
  { tag: tags.operator, color: '#db2777', fontWeight: '600' },
  { tag: tags.atom, color: '#d97706' },
  { tag: tags.bool, color: '#ea580c' },
  { tag: tags.number, color: '#ea580c' },
  { tag: tags.color, color: '#db2777' },
  { tag: tags.punctuation, color: '#64748b' },
  { tag: tags.brace, color: '#334155' },
  { tag: tags.meta, color: '#4f46e5' },
]);

/**
 * Create a CodeMirror editor instance
 * @param {HTMLElement} parent - Container element
 * @param {string} initialCode - Starting code
 * @param {function} onChange - Callback when code changes
 * @param {string} theme - 'dark' or 'light'
 * @returns {EditorView}
 */
export function createEditor(parent, initialCode, onChange, theme = 'dark') {
  const highlightStyle = theme === 'dark' ? d2HighlightStyleDark : d2HighlightStyleLight;

  const state = EditorState.create({
    doc: initialCode,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      d2Language,
      syntaxHighlighting(highlightStyle),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
        },
        '.cm-content': {
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: '10px 0',
        },
        '.cm-line': {
          padding: '0 10px',
        },
      }),
    ],
  });

  const view = new EditorView({
    state,
    parent,
  });

  return view;
}

/**
 * Recreate editor with a different theme
 */
export function recreateEditor(parent, code, onChange, theme) {
  // Clear existing editor
  parent.innerHTML = '';
  return createEditor(parent, code, onChange, theme);
}

/**
 * Set the editor content
 */
export function setEditorContent(view, content) {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: content,
    },
  });
}

/**
 * Get the editor content
 */
export function getEditorContent(view) {
  return view.state.doc.toString();
}
