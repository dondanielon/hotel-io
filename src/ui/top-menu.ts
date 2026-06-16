import htmlTemplate from "./top-menu.html?raw";
import cssTemplate from "./top-menu.css?raw";

export class UITopMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupFactionStrip();
  }

  private setupFactionStrip(): void {
    const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".faction-tab");
    if (!tabs) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.dispatchEvent(new CustomEvent("faction-select", {
          detail: { faction: tab.dataset.faction },
          bubbles: true,
          composed: true,
        }));
      });
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
