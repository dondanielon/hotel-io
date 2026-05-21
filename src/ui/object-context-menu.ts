import htmlTemplate from "./object-context-menu.html?raw";
import cssTemplate from "./object-context-menu.css?raw";

export type ContextMenuAction = "go-to" | "edit" | "examine";

export class UIObjectContextMenu extends HTMLElement {
  private onSelect?: (action: ContextMenuAction) => void;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  public setPosition(x: number, y: number): void {
    this.style.position = "fixed";
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.style.zIndex = "9999";
  }

  public onAction(cb: (action: ContextMenuAction) => void): void {
    this.onSelect = cb;
  }

  private setupEventListeners(): void {
    this.shadowRoot?.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", () => {
        const action = (item as HTMLElement).dataset.action as ContextMenuAction;
        this.onSelect?.(action);
        this.remove();
      });
    });

    // Defer listener registration to next event loop cycle, preventing the current
    // click event from bubbling up to window and immediately closing the menu.
    setTimeout(() => {
      // Close on outside click
      window.addEventListener("click", () => this.remove(), { once: true });
    });
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${cssTemplate}</style>
      ${htmlTemplate}
    `;
  }
}
