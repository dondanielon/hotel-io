export class UIWorldEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {}

  private render(): void {
    if (!this.shadowRoot) return;
  }
}
