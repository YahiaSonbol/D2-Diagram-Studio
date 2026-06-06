// Main entry point - D2 Diagram Studio

import './style.css';
import { createEditor, recreateEditor, setEditorContent, getEditorContent } from './editor.js';
import { initD2, createDebouncedRenderer } from './d2-engine.js';
import { examples } from './examples.js';
import { downloadSVG, downloadPNG, downloadD2, copySVGToClipboard } from './export.js';
import panzoom from 'panzoom';

// ===== State =====
let editorView = null;
let currentSVG = '';
let currentTheme = localStorage.getItem('d2-theme') || 'dark';
let panzoomInstance = null;

const layoutOptions = {
  direction: 'down',
  layoutEngine: 'dagre',
  sketch: false,
};

// ===== DOM References =====
const editorContainer = document.getElementById('editor-container');
const diagramOutput = document.getElementById('diagram-output');
const statusBadge = document.getElementById('status-badge');
const errorOverlay = document.getElementById('error-overlay');
const errorMessage = document.getElementById('error-message');
const loadingOverlay = document.getElementById('loading-overlay');
const emptyState = document.getElementById('empty-state');
const exampleSelect = document.getElementById('example-select');
const directionButtons = document.getElementById('direction-buttons');
const layoutEngineSelect = document.getElementById('layout-engine');
const sketchToggle = document.getElementById('sketch-toggle');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-btn');
const exportDropdown = document.getElementById('export-dropdown');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomResetBtn = document.getElementById('zoom-reset');

// ===== Default D2 Code =====
const defaultCode = `# Welcome to D2 Studio!
# Edit this code to see your diagram update in real-time.

User: {
  shape: person
  style.fill: "#6366f1"
  style.font-color: "#ffffff"
}

Web App: {
  style.fill: "#1e1e32"
  style.font-color: "#e8e8f0"
  style.border-radius: 8
  style.shadow: true

  Frontend: {
    style.fill: "#06b6d4"
    style.font-color: "#fff"
  }
  Backend: {
    style.fill: "#8b5cf6"
    style.font-color: "#fff"
  }
  Frontend -> Backend: API Calls
}

Database: {
  shape: cylinder
  style.fill: "#10b981"
  style.font-color: "#fff"
}

Cache: {
  shape: hexagon
  style.fill: "#f59e0b"
  style.font-color: "#fff"
}

User -> Web App.Frontend: Interacts
Web App.Backend -> Database: Queries {
  style.stroke: "#10b981"
  style.animated: true
}
Web App.Backend -> Cache: Fast Reads {
  style.stroke: "#f59e0b"
  style.stroke-dash: 5
}
`;

// ===== Initialize =====
async function init() {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Populate examples dropdown
  populateExamples();

  // Create editor
  editorView = createEditor(editorContainer, defaultCode, onCodeChange, currentTheme);

  // Initialize D2 engine
  setStatus('loading', 'Loading D2...');
  showLoading(true);

  try {
    await initD2();
    setStatus('success', 'Ready');
    // Trigger initial render
    await triggerRender(defaultCode);
  } catch (err) {
    setStatus('error', 'Engine Error');
    showError(`Failed to load D2 engine: ${err.message}`);
  } finally {
    showLoading(false);
  }

  // Setup event listeners
  setupEventListeners();

  // Setup resizer
  setupResizer();

  // Setup panzoom
  setupPanzoom();
}

// ===== Debounced Renderer =====
const debouncedRender = createDebouncedRenderer((result) => {
  showLoading(false);

  if (result.error) {
    setStatus('error', 'Error');
    showError(result.error);
    // Keep the last valid SVG visible
  } else if (result.svg) {
    currentSVG = result.svg;
    diagramOutput.innerHTML = result.svg;
    setStatus('success', 'Rendered');
    hideError();
    hideEmptyState();
    resetPanzoom();
  } else {
    currentSVG = '';
    diagramOutput.innerHTML = '';
    setStatus('ready', 'Ready');
    hideError();
    showEmptyState();
  }
}, 400);

// ===== Render Trigger =====
async function triggerRender(code) {
  if (!code || !code.trim()) {
    currentSVG = '';
    diagramOutput.innerHTML = '';
    setStatus('ready', 'Ready');
    hideError();
    showEmptyState();
    return;
  }

  setStatus('rendering', 'Rendering...');
  showLoading(true);
  hideEmptyState();

  debouncedRender(code, { ...layoutOptions });
}

// ===== Code Change Handler =====
function onCodeChange(code) {
  triggerRender(code);
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Example selector
  exampleSelect.addEventListener('change', (e) => {
    const example = examples.find((ex) => ex.name === e.target.value);
    if (example) {
      setEditorContent(editorView, example.code);
      triggerRender(example.code);
    }
    e.target.value = '';
  });

  // Direction buttons
  directionButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.dir-btn');
    if (!btn) return;

    directionButtons.querySelectorAll('.dir-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    layoutOptions.direction = btn.dataset.dir;
    triggerRender(getEditorContent(editorView));
  });

  // Layout engine
  layoutEngineSelect.addEventListener('change', (e) => {
    layoutOptions.layoutEngine = e.target.value;
    triggerRender(getEditorContent(editorView));
  });

  // Sketch toggle
  sketchToggle.addEventListener('change', (e) => {
    layoutOptions.sketch = e.target.checked;
    triggerRender(getEditorContent(editorView));
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('d2-theme', currentTheme);

    // Recreate editor with new theme
    const code = getEditorContent(editorView);
    editorView.destroy();
    editorView = createEditor(editorContainer, code, onCodeChange, currentTheme);
  });

  // Export button
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportDropdown.classList.toggle('hidden');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
      exportDropdown.classList.add('hidden');
    }
  });

  // Export actions
  exportDropdown.addEventListener('click', async (e) => {
    const action = e.target.dataset.export;
    if (!action) return;

    exportDropdown.classList.add('hidden');

    switch (action) {
      case 'svg':
        downloadSVG(currentSVG);
        break;
      case 'png':
        try {
          await downloadPNG(currentSVG);
        } catch (err) {
          showError(`PNG export failed: ${err.message}`);
        }
        break;
      case 'd2':
        downloadD2(getEditorContent(editorView));
        break;
      case 'copy-svg':
        const success = await copySVGToClipboard(currentSVG);
        if (success) {
          setStatus('success', 'Copied!');
          setTimeout(() => setStatus('success', 'Rendered'), 1500);
        }
        break;
    }
  });

  // Zoom controls
  zoomInBtn.addEventListener('click', () => {
    if (panzoomInstance) panzoomInstance.zoomTo(0, 0, 1.3);
  });

  zoomOutBtn.addEventListener('click', () => {
    if (panzoomInstance) panzoomInstance.zoomTo(0, 0, 0.7);
  });

  zoomResetBtn.addEventListener('click', () => {
    resetPanzoom();
  });
}

// ===== Populate Examples =====
function populateExamples() {
  examples.forEach((example) => {
    const option = document.createElement('option');
    option.value = example.name;
    option.textContent = example.name;
    exampleSelect.appendChild(option);
  });
}

// ===== Status Badge =====
function setStatus(type, text) {
  statusBadge.textContent = text;
  statusBadge.className = 'panel-badge';

  switch (type) {
    case 'rendering':
    case 'loading':
      statusBadge.classList.add('rendering');
      break;
    case 'success':
      statusBadge.classList.add('success');
      break;
    case 'error':
      statusBadge.classList.add('error');
      break;
    default:
      break;
  }
}

// ===== Error Display =====
function showError(message) {
  errorMessage.textContent = message;
  errorOverlay.classList.remove('hidden');
}

function hideError() {
  errorOverlay.classList.add('hidden');
}

// ===== Loading =====
function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
}

// ===== Empty State =====
function showEmptyState() {
  emptyState.classList.remove('hidden');
}

function hideEmptyState() {
  emptyState.classList.add('hidden');
}

// ===== Panzoom =====
function setupPanzoom() {
  panzoomInstance = panzoom(diagramOutput, {
    maxZoom: 5,
    minZoom: 0.2,
    smoothScroll: false,
    bounds: false,
    boundsPadding: 0.1,
    zoomDoubleClickSpeed: 1,
  });
}

function resetPanzoom() {
  if (panzoomInstance) {
    panzoomInstance.dispose();
  }
  diagramOutput.style.transform = '';
  setupPanzoom();
}

// ===== Resizer =====
function setupResizer() {
  const resizer = document.getElementById('resizer');
  const editorPanel = document.getElementById('editor-panel');
  const mainContent = document.getElementById('main-content');

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerRect = mainContent.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;

    // Clamp between 20% and 80%
    const percent = Math.min(Math.max(newWidth / containerWidth, 0.2), 0.8);
    editorPanel.style.width = `${percent * 100}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// ===== Start =====
init();
