import { Sandbox } from "@root/sandbox";
import { UIConsole } from "@ui/console";
import { UIObjectContextMenu } from "@ui/object-context-menu";
import { UITopMenu } from "@ui/top-menu";
import { UI_CONSOLE_TAG_NAME, UI_OBJECT_CONTEXT_MENU_TAG_NAME, UI_TOP_MENU_TAG_NAME } from "@shared/constants";

// Define UI custom elements
// customElements.define(UI_CONSOLE_TAG_NAME, UIWebConsole);
customElements.define(UI_CONSOLE_TAG_NAME, UIConsole);
customElements.define(UI_OBJECT_CONTEXT_MENU_TAG_NAME, UIObjectContextMenu);
customElements.define(UI_TOP_MENU_TAG_NAME, UITopMenu);
// Initialize world
const sandbox = new Sandbox();
await sandbox.init();
