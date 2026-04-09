# UI Developer (Web Module)

The frontend application component for the HERO Chaos Dashboard.

## Responsibilities
- Built with vanilla HTML/CSS/JS for high performance and zero-build execution.
- Display a robust visualization of the current chaotic state via interactive widgets.
- Trigger AI logic through the Dispatch Modal to resolve tasks dynamically.

## How to Run the Web Dashboard
Since the application uses standard HTML, you don't need `npm` or any complex build tools. You can run it effortlessly using Python's built-in web server.

1. Open your terminal and navigate to the `web` folder.
2. Start the local HTTP server:
   ```bash
   python3 -m http.server 3000
   ```
3. Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

*(Note: Ensure your `dispatcher/server.py` FastAPI backend is simultaneously running on port 8000 for the app to eventually fetch real AI completions, though the current mock iteration simulates the AI response directly for instant demo viability!)*
