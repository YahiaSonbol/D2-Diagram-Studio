// D2 Engine - WASM-based D2 compiler/renderer wrapper

let d2Instance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initialize the D2 WASM engine
 */
export async function initD2() {
  if (d2Instance) return d2Instance;
  if (initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      const { D2 } = await import('@terrastruct/d2');
      d2Instance = new D2();
      isInitializing = false;
      return d2Instance;
    } catch (err) {
      isInitializing = false;
      initPromise = null;
      throw new Error(`Failed to initialize D2 engine: ${err.message}`);
    }
  })();

  return initPromise;
}

/**
 * Compile and render D2 code to SVG
 * @param {string} code - D2 source code
 * @param {object} options - Rendering options
 * @param {string} options.direction - Layout direction (up, down, left, right)
 * @param {string} options.layoutEngine - Layout engine (dagre, elk)
 * @param {boolean} options.sketch - Whether to use sketch mode
 * @returns {Promise<{svg: string, error: string|null}>}
 */
export async function renderD2(code, options = {}) {
  const { direction = 'down', layoutEngine = 'dagre', sketch = false } = options;

  if (!code || !code.trim()) {
    return { svg: '', error: null };
  }

  // If layout engine is TALA or format is PNG, use the backend server
  if (layoutEngine === 'tala' || options.format === 'png') {
    try {
      const response = await fetch('http://localhost:3001/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend rendering failed');
      }

      if (options.format === 'png') {
        const blob = await response.blob();
        return { pngBlob: blob, error: null };
      }

      const data = await response.json();
      return { svg: data.svg, error: null };
    } catch (err) {
      return { svg: '', error: `${options.format === 'png' ? 'PNG' : 'TALA'} Render Error: ${err.message}` };
    }
  }

  try {
    const d2 = await initD2();

    // Inject layout configuration into the code
    const configBlock = buildConfigBlock(direction, layoutEngine);
    const fullCode = configBlock + code;

    // Compile
    const result = await d2.compile(fullCode, { sketch });

    // Render
    const svg = await d2.render(result.diagram, result.renderOptions);

    return { svg, error: null };
  } catch (err) {
    const errorMessage = extractErrorMessage(err);
    return { svg: '', error: errorMessage };
  }
}

/**
 * Build a D2 config block to inject direction and layout engine
 */
function buildConfigBlock(direction, layoutEngine) {
  let config = '';

  // Add direction
  if (direction && direction !== 'down') {
    config += `direction: ${direction}\n`;
  }

  // Add layout engine config
  if (layoutEngine && layoutEngine !== 'dagre') {
    config += `vars: {\n  d2-config: {\n    layout-engine: ${layoutEngine}\n  }\n}\n`;
  }

  if (config) {
    config += '\n';
  }

  return config;
}

/**
 * Extract a clean error message from D2 compilation errors
 */
function extractErrorMessage(err) {
  if (!err) return 'Unknown error';

  let message = err.message || String(err);

  // Clean up common D2 error prefixes
  message = message.replace(/^Error:\s*/i, '');

  // Limit length
  if (message.length > 500) {
    message = message.substring(0, 500) + '...';
  }

  return message;
}

/**
 * Create a debounced render function
 * @param {function} renderCallback - Callback to invoke with render results
 * @param {number} delay - Debounce delay in ms
 */
export function createDebouncedRenderer(renderCallback, delay = 400) {
  let timeoutId = null;
  let currentRequestId = 0;

  return function debouncedRender(code, options) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const requestId = ++currentRequestId;

    timeoutId = setTimeout(async () => {
      const result = await renderD2(code, options);
      // Only call back if this is still the latest request
      if (requestId === currentRequestId) {
        renderCallback(result);
      }
    }, delay);
  };
}

/**
 * Check if D2 engine is ready
 */
export function isD2Ready() {
  return d2Instance !== null;
}

/**
 * Check if D2 engine is currently initializing
 */
export function isD2Initializing() {
  return isInitializing;
}
