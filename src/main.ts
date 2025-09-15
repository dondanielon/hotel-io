import { Sandbox } from "./game-modes/sandbox/sandbox";
import { TerrainEditorMenu } from "./ui/terrain-editor-menu.ui";
import { WebConsole } from "./ui/web-console";

const game = new Sandbox();
// Expose game instance for debugging
(window as any).game = game;
customElements.define("terrain-editor-menu", TerrainEditorMenu);
customElements.define("web-console", WebConsole);
