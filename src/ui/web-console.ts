import { ConsoleStore } from "@root/shared/stores/console.store";

// Import templates as text
import htmlTemplate from "./web-console.html?raw";
import cssTemplate from "./web-console.css?raw";

interface Command {
  name: string;
  execute: (args?: string[]) => string | Promise<string> | void | Promise<void>;
  description: string;
}

export class UIWebConsole extends HTMLElement {
  private unsubscribe?: () => void;
  private output: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private commandHistory: string[] = [];
  private commands: Map<string, Command> = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.unsubscribe = ConsoleStore.subscribe(() => this.render());
    this.render();
    this.setupCommands();
    this.setupEventListeners();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
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
    ];

    commands.forEach((cmd) => this.commands.set(cmd.name, cmd));
  }

  private setupEventListeners(): void {
    this.input?.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          this.executeCommand();
          break;
        default:
          break;
      }
    });
  }

  private async executeCommand(): Promise<void> {
    const cmdText = this.input?.value.trim();
    if (!cmdText) return;

    this.commandHistory.push(cmdText);
    this.addOutputLine(`hotel-io: ${cmdText}`, "output-line");

    const command = this.commands.get(cmdText);

    if (!command) {
      this.addOutputLine(`command not found: ${cmdText}`, "output-line");
    } else {
      try {
        const result = await command.execute();
        if (result) {
          this.addOutputLine(result);
        }
      } catch (error: any) {
        this.addOutputLine(`Error: ${error.message}`, "output-line error");
      }
    }
  }

  private addOutputLine(text: string, className: string = "") {
    const line = document.createElement("div");
    line.className = className;
    line.style.whiteSpace = "pre-wrap";
    line.textContent = text;

    if (this.input && this.output) {
      this.output.appendChild(line);
      this.input.value = "";
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  private setupDraggable(): void {
    const container = this.shadowRoot?.querySelector("#console-container") as HTMLElement;
    const header = this.shadowRoot?.querySelector("#console-header") as HTMLElement;

    if (!container || !header) return;

    let isDragging = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener("mousedown", (e: MouseEvent) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if ((e.target as HTMLElement).closest("#btn-close")) {
        return;
      }

      isDragging = true;
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${cssTemplate}</style>
      ${htmlTemplate}
    `;

    this.input = this.shadowRoot.querySelector(".console-input");
    this.output = this.shadowRoot.querySelector(".console-output");

    this.setupDraggable();

    const closeBtn = this.shadowRoot.querySelector("#btn-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        ConsoleStore.update("isOpen", !ConsoleStore.getState().isOpen);
        const container = document.getElementById("console-container");
        if (container) container.innerHTML = "";
      });
    }

    if (this.input) {
      this.input.focus();
    }
  }
}
