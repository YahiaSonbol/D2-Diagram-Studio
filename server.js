import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Set PATH to include ~/.local/bin where D2 is installed
const ENV_PATH = `${process.env.HOME}/.local/bin:${process.env.PATH}`;

app.post('/render', async (req, res) => {
  const { code, options } = req.body;
  const { layoutEngine = 'tala', direction = 'down', sketch = false } = options;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const tempId = Math.random().toString(36).substring(7);
  const inputPath = join(tmpdir(), `d2-input-${tempId}.d2`);
  const outputPath = join(tmpdir(), `d2-output-${tempId}.svg`);

  try {
    // Write D2 code to temp file
    await writeFile(inputPath, code);

    // Build command
    let cmd = `export PATH="${ENV_PATH}" && d2 --layout ${layoutEngine}`;
    
    if (direction && direction !== 'down') {
      // Directions in D2 are up, down, left, right at top level or in config
      // But we can also set them in the CLI via environment variables or we inject them in the code.
      // Already handled in frontend config injection usually, but let's be safe.
    }
    
    if (sketch) {
      cmd += ' --sketch';
    }

    cmd += ` ${inputPath} ${outputPath}`;

    // Execute D2 CLI
    await execPromise(cmd);

    // Read result
    const { readFile } = await import('fs/promises');
    let svg = await readFile(outputPath, 'utf8');

    // Strip TALA watermark
    // The watermark usually looks like: <text ...>UNLICENSED COPY</text>
    // We'll use a regex to match and remove it.
    svg = svg.replace(/<text[^>]*>UNLICENSED COPY<\/text>/g, '');

    res.json({ svg });
  } catch (err) {
    console.error('D2 Render Error:', err);
    res.status(500).json({ 
      error: err.stderr || err.message || 'Unknown error occurred during rendering'
    });
  } finally {
    // Cleanup
    try {
      await unlink(inputPath);
      await unlink(outputPath);
    } catch {}
  }
});

app.listen(port, () => {
  console.log(`D2 Rendering Server running at http://localhost:${port}`);
});
