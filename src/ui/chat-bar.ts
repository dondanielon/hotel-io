import htmlTemplate from "./chat-bar.html?raw";
import cssTemplate from "./chat-bar.css?raw";
import { handleActiveInput } from "@root/shared/utils";

const CHANNELS = ["SAY", "PARTY", "WHISPER"] as const;
type Channel = (typeof CHANNELS)[number];

interface ChatMessage {
  who: string;
  body: string;
  type?: Channel;
}

export class UIChatBar extends HTMLElement {
  private log: HTMLDivElement | null = null;
  private form: HTMLFormElement | null = null;
  private input: HTMLInputElement | null = null;
  private channelBtn: HTMLSpanElement | null = null;
  private channel: Channel = "SAY";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  public addMessage(msg: ChatMessage): void {
    this.appendMessage(msg);
  }

  private setupEventListeners(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.addEventListener("focusin", () => handleActiveInput());
    this.channelBtn?.addEventListener("click", () => this.cycleChannel());
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessage();
    });
  }

  private cycleChannel(): void {
    const idx = CHANNELS.indexOf(this.channel);
    this.channel = CHANNELS[(idx + 1) % CHANNELS.length];
    if (this.channelBtn) this.channelBtn.textContent = this.channel;
  }

  private sendMessage(): void {
    this.input?.focus();
    if (!this.input?.value.trim()) return;
    const body = this.input.value.trim();
    const type = this.channel.toLowerCase() as ChatMessage["type"];
    this.appendMessage({ who: "You", body, type });
    this.input.value = "";
  }

  private appendMessage(msg: ChatMessage): void {
    if (!this.log) return;
    const type = msg.type || "SAY";
    const chLabel = type.slice(0, 5);

    const line = document.createElement("div");
    line.className = `chat-msg ${type}`;
    line.innerHTML = `
      <span class="ch">${chLabel}</span>
      <span class="who">${msg.who}</span>
      <span class="body">${msg.body}</span>
    `;
    this.log.appendChild(line);
    this.log.scrollTop = this.log.scrollHeight;
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${cssTemplate}</style>
      ${htmlTemplate}
    `;

    this.log = this.shadowRoot.querySelector("#chat-log");
    this.input = this.shadowRoot.querySelector("#chat-input");
    this.channelBtn = this.shadowRoot.querySelector("#chat-channel");
    this.form = this.shadowRoot.querySelector("#chat-form");
  }
}
