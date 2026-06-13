import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'arial, sans-serif',
  htmlLabels: false,
  flowchart: { useHtmlLabels: false },
  sequence: { useHtmlLabels: false },
  er: { useHtmlLabels: false },
});

/**
 * Render Mermaid code to SVG
 * @param {string} code - Mermaid source code
 * @param {object} options - Rendering options
 * @param {string} options.theme - 'dark' or 'light'
 * @param {string} options.direction - 'up', 'down', 'left', 'right'
 * @returns {Promise<{svg: string, error: string|null}>}
 */
export async function renderMermaid(code, options = {}) {
  const { theme = 'dark', direction = 'down' } = options;

  if (!code || !code.trim()) {
    return { svg: '', error: null };
  }

  try {
    // Map direction for graphs/flowcharts
    const dirMap = {
      'up': 'BT',
      'down': 'TD',
      'left': 'RL',
      'right': 'LR'
    };
    const mermaidDir = dirMap[direction] || 'TD';
    
    // Auto-replace orientation for graphs/flowcharts
    let processedCode = code;
    if (code.trim().match(/^(graph|flowchart)/i)) {
      processedCode = code.replace(/^(graph|flowchart)(\s+[A-Z]{2})?/i, `$1 ${mermaidDir}`);
    }

    // Re-initialize with correct theme if needed
    mermaid.initialize({
      theme: theme === 'dark' ? 'dark' : 'default',
      htmlLabels: false,
      flowchart: { useHtmlLabels: false },
      sequence: { useHtmlLabels: false },
      er: { useHtmlLabels: false },
    });

    const id = `mermaid-${Math.random().toString(36).substring(7)}`;
    const { svg } = await mermaid.render(id, processedCode);

    return { svg, error: null };
  } catch (err) {
    console.error('Mermaid render error:', err);
    return { svg: '', error: err.message || 'Failed to render Mermaid diagram' };
  }
}
