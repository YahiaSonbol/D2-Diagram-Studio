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
export async function downloadPNG(svgContent, filename = 'diagram', scale = 2, theme = 'dark') {
  if (!svgContent) return;

  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgEl = doc.documentElement;

      if (svgEl.tagName === 'parsererror') {
        throw new Error('SVG parsing failed');
      }

      let width = parseFloat(svgEl.getAttribute('width'));
      let height = parseFloat(svgEl.getAttribute('height'));

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

      width = width || 800;
      height = height || 600;

      // Ensure explicit dimensions and namespace
      svgEl.setAttribute('width', width);
      svgEl.setAttribute('height', height);
      if (!svgEl.getAttribute('xmlns')) {
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
      
      // Cleanup: Remove potentially tainting external references in Mermaid/D2 SVGs
      const styleTags = svgEl.querySelectorAll('style');
      styleTags.forEach(style => {
        let css = style.textContent;
        // Remove @import and external font-face URLs
        css = css.replace(/@import\s+url\([^)]+\);?/gi, '');
        css = css.replace(/url\(['"]?https?:\/\/[^'"]+['"]?\)/gi, 'none');
        style.textContent = css;
      });

      const serializedSvg = new XMLSerializer().serializeToString(svgEl);
      const img = new Image();
      
      // Use Base64 encoding for better compatibility
      const blob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = theme === 'dark' ? '#0f0f1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = dataUrl;
          link.click();
          
          URL.revokeObjectURL(url);
          resolve();
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas export failed: ' + err.message));
        }
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG for PNG conversion'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
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
  
  // Use a slight timeout before cleanup to ensure the browser has started the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}
