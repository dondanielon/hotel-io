import { Sandbox } from "./game-modes/sandbox/sandbox";

const game = new Sandbox();
// Expose game instance for debugging
(window as any).game = game;
