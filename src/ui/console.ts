// Import templates as text
import htmlTemplate from "./console.html?raw";
import cssTemplate from "./console.css?raw";
import { Box } from "@root/objects/box";
import { GameStore } from "@root/shared/stores";
import { GameObject } from "@root/objects/game-object";
import { Action } from "@root/shared/enums";
import { Cylinder } from "@root/objects/cylinder";

const LOCAL_STORAGE_COMMAND_HISTORY_KEY = "console-command-history";

type LogType = "info" | "warn" | "err" | "cmd" | "ok";
type CommandResult = string | LogLine | LogLine[] | void;

interface LogLine {
  lv: string;
  type: LogType;
  msg: string;
  ts?: string;
}

interface Command {
  name: string;
  execute: (args?: string[]) => CommandResult | Promise<CommandResult>;
  description: string;
}

export class UIConsole extends HTMLElement {
  private container: HTMLDivElement | null = null;
  private output: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private commandHistory: string[] = [];
  private commands: Map<string, Command> = new Map();
  private commandHistoryIdx: number | null = null;
  private currentTab: string = "console";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupCommands();
    this.setupEventListeners();
    this.loadCommandHistory();
    this.open();
  }

  public addCommand(name: string, cmd: Command) {
    this.commands.set(name.toLowerCase(), cmd);
  }

  public removeCommand(name: string) {
    this.commands.delete(name.toLowerCase());
  }

  private setupCommands(): void {
    const commands: Command[] = [
      {
        name: "/help",
        description: "Show list of available commands",
        execute: () => {
          const list = Array.from(this.commands.values())
            .map((cmd) => `${cmd.name} - ${cmd.description}`)
            .join("\n");

          return `Available commands:\n${list}`;
        },
      },
      {
        name: "/clear",
        description: "Clears console",
        execute: () => {
          this.output?.replaceChildren();
        },
      },
      {
        name: "/clear-command-history",
        description: "Clears command history",
        execute: () => {
          this.commandHistory = [];
          localStorage.removeItem(LOCAL_STORAGE_COMMAND_HISTORY_KEY);
        },
      },
      {
        name: "/place-item",
        description: "Places an item on the terrain",
        execute: (args) => {
          const itemId = args?.[0];
          if (!itemId) return "Missing item id. (ex: place-item box)";

          const scene = GameStore.getState().scene;
          if (!scene) return "Error: scene is not defined in game state";

          const currentObjectToPlace = GameStore.getState().objectToPlace;
          let objectToPlace: GameObject | null = null;

          if (currentObjectToPlace) {
            currentObjectToPlace.mesh.clear();
            scene.remove(currentObjectToPlace.mesh);
            GameStore.update("objectToPlace", null);
          }

          if (itemId === "box") {
            objectToPlace = new Box();
            objectToPlace.mesh.rotation.x = -Math.PI / 2;
          }

          if (itemId === "cyl") {
            objectToPlace = new Cylinder();
          }

          if (objectToPlace) {
            GameStore.setState({ action: Action.EditorPlacingItem, objectToPlace });
            scene.add(objectToPlace.mesh);
            this.close();
          }
        },
      },
    ];

    commands.forEach((cmd) => this.commands.set(cmd.name, cmd));
  }

  private setupEventListeners(): void {
    this.input?.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (key === "enter") {
        this.executeCommand();
        return;
      }
      if (key === "arrowup") {
        e.preventDefault();
        this.handleArrowUp();
        return;
      }
      if (key === "arrowdown") {
        e.preventDefault();
        this.handleArrowDown();
        return;
      }
    });

    this.setupTabs();
  }

  private setupTabs(): void {
    const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".console-tab");
    if (!tabs) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab;
        if (!tabName || tabName === this.currentTab) return;
        this.currentTab = tabName;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
      });
    });
  }

  private open(): void {
    if (!this.container) return;
    requestAnimationFrame(() => {
      this.container?.classList.add("open");
    });
  }

  public close(): void {
    if (!this.container) {
      this.remove();
      return;
    }
    this.container.addEventListener("transitionend", () => this.remove(), { once: true });
    this.container.classList.remove("open");
  }

  private async executeCommand(): Promise<void> {
    if (!this.input) return;
    const cmdText = this.input.value.trim();
    if (!cmdText) return;

    this.input.value = "";
    this.addOutputLine({ lv: "CMD", type: "cmd", msg: `> ${cmdText}` });

    const [commandName, ...args] = cmdText.split(" ");
    const command = this.commands.get(commandName);

    if (!command) {
      this.addOutputLine({ lv: "ERR", type: "err", msg: `unknown command: ${cmdText}. try /help` });
      return;
    }

    this.addCommandToHistory(cmdText);

    try {
      const result = await command.execute(args);
      if (!result) return;
      if (Array.isArray(result)) {
        result.forEach((line) => this.addOutputLine(line));
      } else {
        this.addOutputLine(result);
      }
    } catch (error: any) {
      this.addOutputLine({ lv: "ERR", type: "err", msg: `error: ${error.message}` });
    }
  }

  private handleArrowUp(): void {
    if (!this.input) return;
    if (this.commandHistoryIdx === null) {
      if (this.commandHistory.length > 0) {
        this.commandHistoryIdx = this.commandHistory.length - 1;
        this.input.value = this.commandHistory[this.commandHistoryIdx];
      }
    } else {
      if (this.commandHistoryIdx === 0) {
        if (this.input.value) return;
        this.input.value = this.commandHistory[this.commandHistoryIdx];
        return;
      }
      this.commandHistoryIdx = this.commandHistoryIdx - 1;
      this.input.value = this.commandHistory[this.commandHistoryIdx];
    }
  }

  private handleArrowDown(): void {
    if (!this.input) return;
    if (this.commandHistoryIdx === null) return;
    if (this.commandHistoryIdx === this.commandHistory.length - 1) {
      this.commandHistoryIdx = null;
      this.input.value = "";
      return;
    }
    this.commandHistoryIdx = this.commandHistoryIdx + 1;
    this.input.value = this.commandHistory[this.commandHistoryIdx];
  }

  private addOutputLine(line: LogLine | string) {
    if (!this.output) return;

    const log: LogLine = typeof line === "string" ? { lv: "INFO", type: "info", msg: line } : line;

    const lineEl = document.createElement("div");
    lineEl.className = `console-output-line ${log.type}`;

    const tsEl = document.createElement("span");
    const timestamp = log.ts || new Date().toTimeString().slice(0, 8);
    tsEl.className = "ts";
    tsEl.textContent = `[${timestamp}]`;

    const lvEl = document.createElement("span");
    lvEl.className = "lv";
    lvEl.textContent = log.lv;

    const msgEl = document.createElement("span");
    msgEl.className = "msg";
    msgEl.style.whiteSpace = "pre-wrap";
    msgEl.textContent = log.msg;

    lineEl.append(tsEl, lvEl, msgEl);
    this.output.appendChild(lineEl);
    this.output.scrollTop = this.output.scrollHeight;
  }

  private loadCommandHistory(): void {
    try {
      const history = localStorage.getItem(LOCAL_STORAGE_COMMAND_HISTORY_KEY);
      if (history === null) return;
      const parsedHistory = JSON.parse(history);
      if (Array.isArray(parsedHistory)) {
        this.commandHistory = parsedHistory;
      }
    } catch {
      // Silently fail
    }
  }

  private addCommandToHistory(cmdText: string): void {
    this.commandHistoryIdx = null;
    if (cmdText !== this.commandHistory.at(-1)) {
      this.commandHistory.push(cmdText);
      localStorage.setItem(LOCAL_STORAGE_COMMAND_HISTORY_KEY, JSON.stringify(this.commandHistory));
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${cssTemplate}</style>
      ${htmlTemplate}
    `;

    this.container = this.shadowRoot.querySelector(".console-container");
    this.input = this.shadowRoot.querySelector("#input");
    this.output = this.shadowRoot.querySelector("#output");

    const closeBtn = this.shadowRoot.querySelector("#close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.close();
      });
    }

    if (this.input) {
      this.input.focus();
    }
  }
}
