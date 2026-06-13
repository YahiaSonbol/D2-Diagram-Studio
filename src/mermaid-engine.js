import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

/**
 * Render Mermaid code to SVG
 * @param {string} code - Mermaid source code
 * @param {object} options - Rendering options
 * @param {string} options.theme - 'dark' or 'light'
 * @returns {Promise<{svg: string, error: string|null}>}
 */
export async function renderMermaid(code, options = {}) {
  const { theme = 'dark' } = options;

  if (!code || !code.trim()) {
    return { svg: '', error: null };
  }

  try {
    // Re-initialize with correct theme if needed
    mermaid.initialize({
      theme: theme === 'dark' ? 'dark' : 'default',
    });

    const id = `mermaid-${Math.random().toString(36).substring(7)}`;
    const { svg } = await mermaid.render(id, code);

    return { svg, error: null };
  } catch (err) {
    console.error('Mermaid render error:', err);
    return { svg: '', error: err.message || 'Failed to render Mermaid diagram' };
  }
}
