import { Sandbox } from "@root/sandbox";
import { UIWebConsole } from "@ui/web-console";

const sandbox = new Sandbox();
await sandbox.init();
// Define UI custom elements
customElements.define("web-console", UIWebConsole);
