import htmlTemplate from "./examine-popup.html?raw";
import baseCss from "./float-panel.css?raw";
import cssTemplate from "./examine-popup.css?raw";

const objectData: Record<string, {
  name: string; rarity: string; rarityLabel: string; desc: string;
  stats: [string, string][]; actions: string[];
}> = {
  pod: {
    name: "Recharge Pod MK-IV", rarity: "rare", rarityLabel: "Rare",
    desc: "Standard-issue recharge station from the Hexagon Collective. Restores 5 Energy/s while occupied.",
    stats: [["Type", "FURNI · UTILITY"], ["Size", "2×2 TILES"], ["Charge", "5 EP/S"], ["Owner", "YOU"], ["Acquired", "12 D AGO"]],
    actions: ["Use", "Move", "Pick up"],
  },
  arcade: {
    name: "Neon Arcade Cabinet", rarity: "epic", rarityLabel: "Epic",
    desc: "A fully playable retro cabinet with 12 built-in mini-games. Wager Coins against other players.",
    stats: [["Type", "FURNI · INTERACTIVE"], ["Size", "1×1 TILE"], ["Games", "12"], ["High score", "184,220"], ["Owner", "YOU"]],
    actions: ["Play", "Move", "Pick up"],
  },
  crate: {
    name: "Legendary Loot Crate", rarity: "legendary", rarityLabel: "Legendary",
    desc: "Contains a guaranteed Legendary-tier cosmetic plus 3 random Rare-or-better items.",
    stats: [["Type", "CONSUMABLE"], ["Drops", "4 (1 LEGENDARY)"], ["Tradeable", "NO"], ["Expires", "NEVER"]],
    actions: ["Open", "Inspect"],
  },
  plant: {
    name: "Bioluminescent Fern", rarity: "rare", rarityLabel: "Rare",
    desc: "A genetically modified fern that emits a soft glow at night. Cosmetic only.",
    stats: [["Type", "FURNI · DECOR"], ["Size", "1×1 TILE"], ["Owner", "YOU"], ["Acquired", "3 D AGO"]],
    actions: ["Move", "Pick up"],
  },
};

const playerData: Record<string, {
  name: string; level: number; tagline: string; color: string; initials: string;
  stats: [string, string][]; badges: [string, string][]; bio: string;
}> = {
  p1: { name: "NovaBlade", level: 32, tagline: "APEX STRIKER · EU-3", color: "oklch(0.7 0.2 30)", initials: "NB",
    stats: [["ELO", "2,184"], ["WINS", "341"], ["K/D", "2.4"], ["STREAK", "7"]],
    badges: [["Apex Striker", "var(--lime)"], ["Top 500", "var(--magenta)"], ["Season 4", "var(--violet)"]],
    bio: "Dueling at sunrise. Buying any Aurora-set parts. No trades under 200 gems." },
  p2: { name: "PixelPriest", level: 18, tagline: "HEALER · EU-3", color: "oklch(0.7 0.22 0)", initials: "PP",
    stats: [["ELO", "1,520"], ["WINS", "128"], ["K/D", "0.9"], ["HEALS", "88k"]],
    badges: [["Support Main", "var(--teal)"], ["Season 3", "var(--violet)"]],
    bio: "Heals provided. Buy me an arcade token and I owe you." },
  p3: { name: "RogueByte", level: 27, tagline: "ROGUE · HACKER · EU-3", color: "oklch(0.78 0.2 130)", initials: "RB",
    stats: [["ELO", "1,890"], ["WINS", "212"], ["K/D", "1.8"], ["STREAK", "3"]],
    badges: [["Speedrunner", "var(--lime)"], ["Glitch Hunter", "var(--magenta)"]],
    bio: "Looking for duo partners for the new dungeon. DM me." },
  p4: { name: "ZeroSamurai", level: 41, tagline: "IAIDO MASTER · EU-3", color: "oklch(0.85 0.18 80)", initials: "ZS",
    stats: [["ELO", "2,640"], ["WINS", "901"], ["K/D", "3.1"], ["STREAK", "12"]],
    badges: [["Top 100", "var(--violet)"], ["Founder", "var(--lime)"], ["Apex", "var(--magenta)"]],
    bio: "One cut. One kill. Trades welcome on Saturdays only." },
};

export interface ExamineTarget {
  kind: "object" | "player";
  id?: string;
  name?: string;
  objType?: string;
  color?: string;
}

export class UIExaminePopup extends HTMLElement {
  private target: ExamineTarget | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupDraggable();
  }

  public setTarget(target: ExamineTarget): void {
    this.target = target;
    this.renderContent();

    const panel = this.shadowRoot?.querySelector<HTMLElement>("#float-panel");
    if (panel) {
      const w = target.kind === "object" ? 480 : 480;
      const h = target.kind === "object" ? 380 : 480;
      panel.style.left = `${Math.round(window.innerWidth / 2 - w / 2)}px`;
      panel.style.top = `${Math.round(window.innerHeight / 2 - h / 2)}px`;
    }
  }

  private setupDraggable(): void {
    const panel = this.shadowRoot?.querySelector<HTMLElement>("#float-panel");
    const header = this.shadowRoot?.querySelector<HTMLElement>("#fp-head");
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

  private renderContent(): void {
    if (!this.target) return;
    const body = this.shadowRoot?.querySelector("#examine-body");
    if (!body) return;

    if (this.target.kind === "object") {
      this.renderObjectContent(body);
    } else {
      this.renderPlayerContent(body);
    }
  }

  private renderObjectContent(body: Element): void {
    const target = this.target!;
    const data = objectData[target.objType || "pod"] || objectData.pod;

    const headTitle = this.shadowRoot?.querySelector("#head-title");
    const headId = this.shadowRoot?.querySelector("#head-id");
    if (headTitle) headTitle.textContent = "Examine";
    if (headId) headId.textContent = `#${(target.id || "obj-0000").toUpperCase()}`;

    const stats = data.stats.map(([k, v]) =>
      `<div class="stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`
    ).join("");

    const actions = data.actions.map((a, i) =>
      `<button class="btn ${i > 0 ? "ghost" : ""}">${a}</button>`
    ).join("");

    body.innerHTML = `
      <div class="examine-obj-body">
        <div class="preview-3d">
          <div class="preview-3d-canvas"></div>
          <div class="label-3d">
            <span>// MODEL_PREVIEW</span>
            <span>ROT · AUTO</span>
          </div>
        </div>
        <div class="obj-info">
          <span class="rarity-chip ${data.rarity}">${data.rarityLabel.toUpperCase()}</span>
          <div class="obj-name">${data.name}</div>
          <div class="obj-desc">${data.desc}</div>
          <div class="stats-table">${stats}</div>
          <div class="actions-row">${actions}</div>
        </div>
      </div>`;
  }

  private renderPlayerContent(body: Element): void {
    const target = this.target!;
    const data = playerData[target.id || ""] || {
      name: target.name || "Player", level: 12, tagline: "EU-3",
      color: target.color || "oklch(0.7 0.18 215)",
      initials: (target.name || "P").slice(0, 2).toUpperCase(),
      stats: [["ELO", "1,200"], ["WINS", "24"], ["K/D", "1.0"], ["STREAK", "0"]] as [string, string][],
      badges: [["New Recruit", "var(--teal)"]] as [string, string][],
      bio: "No bio yet.",
    };

    const headTitle = this.shadowRoot?.querySelector("#head-title");
    const headId = this.shadowRoot?.querySelector("#head-id");
    if (headTitle) headTitle.textContent = "Profile";
    if (headId) headId.textContent = `#${(target.id || "p").toUpperCase()}`;

    const stats = data.stats.map(([k, v]) =>
      `<div class="profile-stat"><div class="sv">${v}</div><div class="sk">${k}</div></div>`
    ).join("");

    const badges = data.badges.map(([label, color]) =>
      `<span class="badge-chip"><span class="b" style="background: ${color}"></span>${label}</span>`
    ).join("");

    body.innerHTML = `
      <div class="profile-head" style="background: linear-gradient(135deg, ${data.color}, oklch(0.10 0.005 250))">
        <div class="av" style="background: linear-gradient(135deg, ${data.color}, oklch(0.3 0.18 290))">${data.initials}</div>
        <div class="who">
          <div class="nm">${data.name}<span class="lvtag">LV ${data.level}</span></div>
          <div class="tagline">${data.tagline}</div>
        </div>
      </div>
      <div class="profile-stats">${stats}</div>
      <div class="profile-body">
        <div class="badges">${badges}</div>
        <div class="bio-box">
          <span class="lbl">Status / Bio</span>
          "${data.bio}"
        </div>
        <div style="display: flex; gap: 4px">
          <button class="btn" style="flex: 1">Whisper</button>
          <button class="btn ghost" style="flex: 1">Add friend</button>
          <button class="btn ghost" style="flex: 1">Trade</button>
        </div>
      </div>`;
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
