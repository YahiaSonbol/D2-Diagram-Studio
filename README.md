# D2 Diagram Studio

D2 Diagram Studio is a browser-based integrated development environment for the D2 diagramming language. It allows users to write D2 code and see their diagrams update in real-time, offering several layout engines and organization options to suit different architectural needs.

This project was built to provide a clean, local, and professional workspace for architects and developers who prefer the diagrams-as-code workflow.

## Key Features

- **Real-time Live Preview**: Your diagrams render as you type, providing immediate visual feedback.
- **Support for Multiple Engines**: Toggle between Dagre, ELK, and TALA layout engines.
- **TALA Integration**: Full support for the proprietary TALA layout engine via a local proxy server.
- **Modern Editor**: High-performance editor powered by CodeMirror 6, featuring D2 syntax highlighting and dark/light modes.
- **Visual Controls**: Manage diagram direction, toggle sketch mode for a hand-drawn look, and use pan/zoom for navigating large diagrams.
- **Export Capabilities**: Download your work as SVG or high-resolution PNG, or copy the SVG source directly to your clipboard.

## Architecture

The application is split into two main components:

1. **Frontend**: A Vite-powered vanilla JavaScript application that handles the UI, editor state, and client-side rendering for Dagre and ELK using the official D2 WebAssembly package.
2. **Backend**: An Express server that acts as a bridge to the D2 CLI. This is necessary to support the TALA engine, which is proprietary and not bundled in the client-side library.

## Getting Started

### Prerequisites

- Node.js installed on your system.
- D2 CLI installed (to use the TALA engine). You can install it using the following command:
  ```bash
  curl -fsSL https://d2lang.com/install.sh | sh -s -- --tala
  ```

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start both the frontend development server and the backend rendering server simultaneously, run:

```bash
npm run dev:all
```

The application will be available at http://localhost:5173 and the rendering server at http://localhost:3001.

## License

This project is open-source and available under the MIT License. Please note that while the D2 core is open-source, the TALA layout engine is a proprietary product of Terrastruct and may require a license for certain uses.
