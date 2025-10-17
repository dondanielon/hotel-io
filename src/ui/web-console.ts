import { ConsoleStore } from "@root/shared/stores/console.store";

interface Command {
  name: string;
  execute: (args?: string[]) => string | Promise<string> | void | Promise<void>;
  description: string;
}

export class WebConsole extends HTMLElement {
  private unsubscribe?: () => void;
  private output: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
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
    this.historyIndex = this.commandHistory.length;
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
        this.addOutputLine(`Error: ${error.message}`, "error-line");
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
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          cursor: url("/cursor-v1.png") 3 2, auto !important;
        }

        .container {
          position: absolute;
          z-index: 100;
          top: 50px;
          left: 10px;
          background: linear-gradient(135deg, rgba(13, 17, 23, 0.95), rgba(22, 27, 34, 0.40));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(48, 54, 61, 0.8);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          width: 650px;
          color: #58a6ff;
          overflow: hidden;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .header {
          background: rgba(22, 27, 34, 0.2);
          border-bottom: 1px solid rgba(48, 54, 61, 0.8);
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #58a6ff;
        }

        .header-icon {
          width: 16px;
          height: 16px;
          fill: #58a6ff;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: #8b949e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 18px;
          line-height: 1;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-close:hover {
          background: rgba(248, 81, 73, 0.15);
          color: #f85149;
        }

        .console-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .console-output {
          height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: rgba(1, 4, 9, 0.2);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.2;
        }

        .console-output::-webkit-scrollbar {
          width: 8px;
        }

        .console-output::-webkit-scrollbar-track {
          background: rgba(48, 54, 61, 0.1);
          border-radius: 4px;
        }

        .console-output::-webkit-scrollbar-thumb {
          background: rgba(88, 166, 255, 0.2);
          border-radius: 4px;
        }

        .console-output::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 166, 255, 0.3);
        }

        .output-line {
          font-size: 13px;
          color: #58a6ff;
          word-break: break-word;
          white-space: pre-wrap;
          width: 100%;
        }

        .output-line.error {
          color: #f85149;
        }

        .output-line.success {
          color: #3fb950;
        }

        .output-line.warning {
          color: #d29922;
        }

        .input-container {
          display: flex;
          align-items: center;
          background: rgba(1, 4, 9, 0.4);
          border: 1px solid rgba(48, 54, 61, 0.6);
          border-radius: 4px;
          padding: 8px 12px;
          transition: border-color 0.2s;
        }

        .input-container:focus-within {
          border-color: #58a6ff;
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.1);
        }

        .prompt {
          color: #58a6ff;
          font-size: 14px;
          margin-right: 8px;
          font-weight: 600;
          user-select: none;
        }

        .console-input {
          background: transparent;
          border: none;
          color: #58a6ff;
          outline: none;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          animation: slideIn 0.2s ease-out;
        }
      </style>

      <div class="container" id="console-container">
        <div class="header" id="console-header">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM7.25 8a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 01-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm1.5 1.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"/>
            </svg>
            <span>Console</span>
          </div>
          <div class="header-actions">
            <button class="btn-close" id="btn-close" title="Cerrar">×</button>
          </div>
        </div>
        <div class="console-body">
          <div class="console-output"></div>
          <div class="input-container">
            <span class="prompt">$</span>
            <input type="text" class="console-input" autocomplete="off"/>
          </div>
        </div>
      </div>
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
