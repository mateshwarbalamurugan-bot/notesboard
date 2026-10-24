NOTESBOARD — AI STUDIO DEMO MODE PATCH

This patch replaces only src/App.vue. It does not change your backend, notes database, API keys, or package files.

What changes:
- AI Studio opens with a prepared example project plan already displayed.
- Generate with AI uses prepared local sample responses for Project plan, Brainstorm ideas, Explain simply, and Learning roadmap.
- No API key, internet request, or backend AI endpoint is required for this presentation demo.
- Results are clearly labeled as prepared demo examples, not live AI-generated responses.
- The existing save-as-note and copy actions remain available.
- Existing tags, navigation, and animation styling are preserved from the current App.vue.

INSTALL:
1. In VS Code, open your project root folder (the folder containing package.json and src).
2. Back up src/App.vue (for example, copy it to App.before-demo.vue).
3. Extract this ZIP into the project root and allow src/App.vue to be replaced.
4. Restart Vite from the project root: Ctrl+C, then npm run dev.
5. Refresh http://localhost:5173 with Ctrl+F5.

This is intentionally a mock/demo AI mode. It does not call OpenAI or Gemini. To return to live AI later, restore API-backed generation and configure a working provider key on the backend.
