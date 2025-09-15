interface Command {
  name: string;
  execute: (args?: string[]) => string | Promise<string> | void | Promise<void>;
  description: string;
}

export class WebConsole extends HTMLElement {
  private output: HTMLDivElement;
  private input: HTMLInputElement;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private commands: Map<string, Command> = new Map();
  //private isActive: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.setupCommands();
    this.render();
    this.setupEventListeners();
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
            .map((cmd) => ` ${cmd.name.padEnd(15)} - ${cmd.description}`)
            .join("\n");

          return `Available commands: \n${list}`;
        },
      },
      {
        name: "clear",
        description: "Clears console",
        execute: () => {
          this.output.replaceChildren();
        },
      },
    ];

    commands.forEach((cmd) => this.commands.set(cmd.name, cmd));
  }

  private setupEventListeners(): void {
    //this.addEventListener("keydown", (e) => {
    //  console.log(e.key);
    //});

    this.input.addEventListener("keydown", (e) => {
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
    const cmdText = this.input.value.trim();
    if (!cmdText) return;

    this.commandHistory.push(cmdText);
    this.historyIndex = this.commandHistory.length;
    this.addOutputLine(`$ ${cmdText}`, "output-line");

    const command = this.commands.get(cmdText);

    if (!command) {
      this.addOutputLine(`$ hotel-io: command not found: ${cmdText}`, "output-line");
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
    const line = document.createElement("span");
    line.className = className;
    line.textContent = text;

    this.output.appendChild(line);
    this.input.value = "";
  }

  private render(): void {
    if (!this.shadowRoot) return;

    console.log("is rendering");

    this.shadowRoot.innerHTML = `
      <style>
        .container {
          position: absolute;
          z-index: 100;
          top: 50px;
          left: 10px;
          background-color: hsl(79 1.9% 11.3%);
          display: flex;
          flex-direction: column;
          border-radius: 5px;
          min-width: 600px;
          color: hsl(79 1.9% 76.5%);
          padding: 10px;
        }

        .console-output {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: left;
        }

        .input {}

        .prompt {
          color: hsl(79 1.9% 76.5%);
          font-size: 14px;
        }

        .console-input {
          background-color: hsl(79 1.9% 11.3%);
          border: none;
          color: hsl(79 1.9% 76.5%);
          outline: none;
        }

        .output-line {
          font-size: 14px;
        }
      </style>

      <div class="container">
        <div class="console-output"></div>
        <div class="input>
          <span class="prompt">$:</span>
          <input type="text" class="console-input" autocomplete="off"/>
        </div>
      </div>
    `;

    this.input = this.shadowRoot.querySelector(".console-input")!;
    this.output = this.shadowRoot.querySelector(".console-output")!;

    console.log({ input: this.input, output: this.output });
  }
}
