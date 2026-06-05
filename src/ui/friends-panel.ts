import htmlTemplate from "./friends-panel.html?raw";
import baseCss from "./float-panel.css?raw";
import cssTemplate from "./friends-panel.css?raw";

const friendsData = {
  online: [
    { id: "p1", name: "NovaBlade", level: 32, status: 'In room "Neon Atrium"', color: "oklch(0.7 0.2 30)" },
    { id: "p4", name: "ZeroSamurai", level: 41, status: "In room \"Iaido Dojo\" · do not disturb", color: "oklch(0.85 0.16 80)", tag: "busy" },
    { id: "p3", name: "RogueByte", level: 27, status: 'In dungeon "Glitch Caverns"', color: "oklch(0.78 0.2 130)" },
    { id: "p2", name: "PixelPriest", level: 18, status: "AFK · last seen 12m ago", color: "oklch(0.7 0.22 0)", tag: "afk" },
  ],
  offline: [
    { id: "p5", name: "EchoFox", level: 14, status: "Last seen 2 hours ago", color: "oklch(0.7 0.15 50)" },
    { id: "p6", name: "GlitchKid", level: 22, status: "Last seen yesterday", color: "oklch(0.7 0.18 250)" },
    { id: "p7", name: "Hex_99", level: 8, status: "Last seen 4 days ago", color: "oklch(0.7 0.16 320)" },
  ],
  requests: [
    { id: "r1", name: "CryoBee", level: 12, status: "Sent you a friend request", color: "oklch(0.7 0.16 200)" },
    { id: "r2", name: "PrismDuck", level: 31, status: "Sent you a friend request", color: "oklch(0.7 0.18 100)" },
  ],
};

type FriendStatus = "online" | "offline" | "requests" | "afk" | "busy";
interface Friend { id: string; name: string; level: number; status: string; color: string; tag?: string; }

export class UIFriendsPanel extends HTMLElement {
  private currentTab = "online";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.centerPanel(420, 580);
    this.setupDraggable();
    this.setupInteractions();
    this.renderContent();
  }

  private centerPanel(width: number, height: number): void {
    const panel = this.shadowRoot?.querySelector<HTMLElement>(".float-panel");
    if (!panel) return;
    panel.style.left = `${Math.round(window.innerWidth / 2 - width / 2)}px`;
    panel.style.top = `${Math.round(window.innerHeight / 2 - height / 2)}px`;
  }

  private setupDraggable(): void {
    const panel = this.shadowRoot?.querySelector<HTMLElement>(".float-panel");
    const header = this.shadowRoot?.querySelector<HTMLElement>(".fp-head");
    if (!panel || !header) return;

    let isDragging = false;
    let currentX: number, currentY: number, initialX: number, initialY: number;
    let xOffset = 0, yOffset = 0;

    header.addEventListener("mousedown", (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".fp-close")) return;
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
    });

    document.addEventListener("mouseup", () => { isDragging = false; });
  }

  private setupInteractions(): void {
    const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".tab");
    tabs?.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.currentTab = tab.dataset.tab || "online";
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        this.renderContent();
      });
    });
  }

  private renderFriendRow(f: Friend, status: FriendStatus): string {
    const initials = f.name.slice(0, 2).toUpperCase();
    const rowStatus = f.tag || status;
    const actions = status === "requests"
      ? `<button class="accept" title="Accept">✓</button><button title="Decline">×</button>`
      : `<button title="Whisper">✉</button><button title="Examine">⊙</button><button title="Invite">+</button>`;

    return `
      <div class="friend-row ${rowStatus}">
        <div class="avatar" style="background: linear-gradient(135deg, ${f.color}, oklch(0.3 0.18 290))">${initials}</div>
        <div class="info">
          <div class="name">${f.name}<span class="lv">LV ${f.level}</span></div>
          <div class="status">${f.status}</div>
        </div>
        <div class="actions">${actions}</div>
      </div>`;
  }

  private renderContent(): void {
    const container = this.shadowRoot?.querySelector("#friends-content");
    if (!container) return;

    let html = "";
    if (this.currentTab === "online") {
      html += `<div class="section-head">Online <span class="count">${friendsData.online.length}</span></div>`;
      html += `<div class="friends-list">${friendsData.online.map((f) => this.renderFriendRow(f, "online")).join("")}</div>`;
    } else if (this.currentTab === "all") {
      html += `<div class="section-head">Online <span class="count">${friendsData.online.length}</span></div>`;
      html += `<div class="friends-list">${friendsData.online.map((f) => this.renderFriendRow(f, "online")).join("")}</div>`;
      html += `<div class="section-head">Offline <span class="count">${friendsData.offline.length}</span></div>`;
      html += `<div class="friends-list">${friendsData.offline.map((f) => this.renderFriendRow(f, "offline")).join("")}</div>`;
    } else if (this.currentTab === "requests") {
      html += `<div class="section-head">Incoming requests <span class="count">${friendsData.requests.length}</span></div>`;
      html += `<div class="friends-list">${friendsData.requests.map((f) => this.renderFriendRow(f, "requests")).join("")}</div>`;
    }

    container.innerHTML = html;
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${baseCss}${cssTemplate}</style>
      ${htmlTemplate}
    `;

    this.shadowRoot.querySelector("#close")?.addEventListener("click", () => this.remove());
  }
}
