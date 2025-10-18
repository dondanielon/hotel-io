import { Sandbox } from "./game-modes/sandbox/sandbox";
import { UIWebConsole } from "./ui/web-console";

const game = new Sandbox();
// Expose game instance for debugging
(window as any).game = game;

// Define web components
customElements.define("web-console", UIWebConsole);
