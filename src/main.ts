import { Sandbox } from "./game-modes/sandbox/sandbox";
import { WebConsole } from "./ui/web-console";

const game = new Sandbox();
// Expose game instance for debugging
(window as any).game = game;

// Define web components
customElements.define("web-console", WebConsole);
