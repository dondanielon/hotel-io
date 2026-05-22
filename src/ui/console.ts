// Import templates as text
import htmlTemplate from "./console.html?raw";
import cssTemplate from "./console.css?raw";
import { Box } from "@root/objects/box";
import { GameStore } from "@root/shared/stores";
import { GameObject } from "@root/objects/game-object";
import { Action } from "@root/shared/enums";
import { Cylinder } from "@root/objects/cylinder";

const LOCAL_STORAGE_COMMAND_HISTORY_KEY = "console-command-history";

interface Command {
  name: string;
  execute: (args?: string[]) => string | Promise<string> | void | Promise<void>;
  description: string;
}

export class UIConsole extends HTMLElement {
  private output: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private commandHistory: string[] = [];
  private commands: Map<string, Command> = new Map();
  private commandHistoryIdx: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupCommands();
    this.setupEventListeners();
    this.loadCommandHistory();
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
        name: "help",
        description: "Show list of available commands",
        execute: () => {
          const list = Array.from(this.commands.values())
            .map((cmd) => ` ${cmd.name} - ${cmd.description}`)
            .join("\n");

          return `Available commands:\n${list}`;
        },
      },
      {
        name: "clear",
        description: "Clears console",
        execute: () => {
          this.output?.replaceChildren();
        },
      },
      {
        name: "clear-command-history",
        description: "Clears command history",
        execute: () => {
          this.commandHistory = [];
          localStorage.removeItem(LOCAL_STORAGE_COMMAND_HISTORY_KEY);
        },
      },
      {
        name: "place-item",
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
            this.remove();
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
  }

  private async executeCommand(): Promise<void> {
    const cmdText = this.input?.value.trim();
    if (!cmdText) return;

    this.addOutputLine(`hotel-io: ${cmdText}`, "console-output-line");

    const [commandName, ...args] = cmdText.split(" ");
    const command = this.commands.get(commandName);

    if (!command) {
      this.addOutputLine(`command not found: ${cmdText}`, "console-output-line");
    } else {
      this.addCommandToHistory(cmdText);
      try {
        const result = await command.execute(args);
        if (result) {
          this.addOutputLine(result);
        }
      } catch (error: any) {
        this.addOutputLine(`Error: ${error.message}`, "console-output-line error");
      }
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

  private addOutputLine(text: string, className: string = "") {
    if (this.input && this.output) {
      const line = document.createElement("div");
      line.className = className;
      line.style.whiteSpace = "pre-wrap";
      line.textContent = text;

      this.output.appendChild(line);
      this.input.value = "";
      this.output.scrollTop = this.output.scrollHeight;
    }
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

    this.input = this.shadowRoot.querySelector("#input");
    this.output = this.shadowRoot.querySelector("#output");

    const closeBtn = this.shadowRoot.querySelector("#close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.remove();
      });
    }

    if (this.input) {
      this.input.focus();
    }
  }
}
