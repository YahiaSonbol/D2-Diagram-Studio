# Contributing to D2 Diagram Studio

Thank you for your interest in contributing to D2 Diagram Studio. We welcome contributions from the community to help improve the tool and expand its capabilities.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a feature suggestion, please open an issue on the GitHub repository. When reporting a bug, please include:
- A clear description of the problem.
- Steps to reproduce the issue.
- Examples of the D2 code that caused the problem.
- Details about your environment (browser version, OS).

### Submitting Pull Requests

We appreciate pull requests for bug fixes and new features. To contribute code:

1. Fork the repository and create your branch from the main branch.
2. Ensure your code follows the existing style and structure of the project.
3. If you add a new feature, please update the documentation accordingly.
4. Open a pull request with a detailed description of your changes and why they are necessary.

## Development Workflow

The project uses a combined development environment for the frontend and backend.

- **Editor**: We use CodeMirror 6 for the D2 editor. Custom language definitions can be found in `src/editor.js`.
- **Rendering**: The logic for switching between client-side WASM and server-side CLI rendering is in `src/d2-engine.js`.
- **Backend**: The Express server in `server.js` handles CLI execution and temporary file management.

To run the full suite locally:
```bash
npm run dev:all
```

## Community Standards

We aim to maintain a professional and welcoming environment for everyone. Please be respectful in your communications and constructive in your feedback.
