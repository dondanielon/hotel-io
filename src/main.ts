import { Sandbox } from "@root/sandbox";
import { UIWebConsole } from "@ui/web-console";
import { UIObjectContextMenu } from "./ui/object-context-menu";
import { UI_CONSOLE_TAG_NAME, UI_OBJECT_CONTEXT_MENU_TAG_NAME } from "./shared/constants";

// Define UI custom elements
customElements.define(UI_CONSOLE_TAG_NAME, UIWebConsole);
customElements.define(UI_OBJECT_CONTEXT_MENU_TAG_NAME, UIObjectContextMenu);
// Initialize world
const sandbox = new Sandbox();
await sandbox.init();
