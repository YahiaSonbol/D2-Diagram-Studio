// Export functionality - SVG, PNG, D2 source

/**
 * Download SVG file
 * @param {string} svgContent - Raw SVG string
 * @param {string} filename - File name without extension
 */
export function downloadSVG(svgContent, filename = 'd2-diagram') {
  if (!svgContent) return;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  triggerDownload(blob, `${filename}.svg`);
}

/**
 * Download PNG file (converts SVG to PNG via Canvas)
 * @param {string} svgContent - Raw SVG string
 * @param {string} filename - File name without extension
 * @param {number} scale - Resolution scale factor
 */
export async function downloadPNG(svgContent, filename = 'd2-diagram', scale = 2) {
  if (!svgContent) return;

  // Use DOMParser to get dimensions from the SVG string
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgEl = doc.documentElement;

  let width = parseFloat(svgEl.getAttribute('width'));
  let height = parseFloat(svgEl.getAttribute('height'));

  // Fallback to viewBox if width/height are missing or not numbers
  if (!width || !height || isNaN(width) || isNaN(height)) {
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(parseFloat);
      if (parts.length === 4) {
        width = parts[2];
        height = parts[3];
      }
    }
  }

  // Final fallback
  width = width || 800;
  height = height || 600;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Ensure the SVG has explicit dimensions and correct namespace
    svgEl.setAttribute('width', width);
    svgEl.setAttribute('height', height);
    
    const serializedSvg = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background color
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, width * scale, height * scale);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          triggerDownload(blob, `${filename}.png`);
          resolve();
        } else {
          reject(new Error('Failed to convert to PNG'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for PNG conversion'));
    };

    img.src = url;
  });
}

/**
 * Download D2 source file
 * @param {string} d2Code - D2 source code
 * @param {string} filename - File name without extension
 */
export function downloadD2(d2Code, filename = 'd2-diagram') {
  if (!d2Code) return;

  const blob = new Blob([d2Code], { type: 'text/plain' });
  triggerDownload(blob, `${filename}.d2`);
}

/**
 * Copy SVG to clipboard
 * @param {string} svgContent - Raw SVG string
 * @returns {Promise<boolean>} - Whether the copy succeeded
 */
export async function copySVGToClipboard(svgContent) {
  if (!svgContent) return false;

  try {
    await navigator.clipboard.writeText(svgContent);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = svgContent;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Helper to trigger a file download
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
