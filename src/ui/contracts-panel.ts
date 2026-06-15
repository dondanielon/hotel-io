import htmlTemplate from "./contracts-panel.html?raw";
import baseCss from "./float-panel.css?raw";
import cssTemplate from "./contracts-panel.css?raw";

const factionMeta: Record<string, { name: string; color: string }> = {
  vulcan: { name: "Vulcan", color: "oklch(0.66 0.27 18)" },
  hexar:  { name: "Hexar",  color: "oklch(0.62 0.24 295)" },
  aether: { name: "Aether", color: "oklch(0.78 0.13 215)" },
  kyro:   { name: "Kyro",   color: "oklch(0.78 0.16 80)" },
  oni:    { name: "Oni",    color: "oklch(0.72 0.26 340)" },
};

interface Objective { text: string; done: number; total: number; reward?: number; locked?: boolean; }
interface Reward { glyph: string; rarity: string | null; plus?: boolean; }
interface Contract {
  id: string; faction: string; title: string; tag: string; desc: string;
  objectives: Objective[]; rewards: Reward[] | null;
}

const contractsData: Contract[] = [
  { id: "c1", faction: "vulcan", title: "Introducing: Vulcan", tag: "LIAISON",
    desc: "In Dire Marsh, hack a UESC terminal in Intersection, Bio-Research, or Complex. Defeat the responding Commander, then take their shipping manifest.",
    objectives: [
      { text: "Hack terminal at Intersection, Complex, or Bio-Research", done: 0, total: 1, reward: 90 },
      { text: "Acquire Shipping Manifest from UESC Commander", done: 0, total: 1, reward: 90, locked: true },
      { text: "Scan the nearby stacked shipping container", done: 0, total: 1, reward: 90, locked: true },
    ],
    rewards: [{ glyph: "AMM", rarity: "rare" }, { glyph: "BIO", rarity: "epic" }, { glyph: "KEY", rarity: "legendary" }, { glyph: "+3", rarity: null, plus: true }],
  },
  { id: "c2", faction: "hexar", title: "Introducing: Hexar", tag: "LIAISON",
    desc: "Hexar, an antiestablishment cell in conflict with the UESC, has challenged you to join their cause.",
    objectives: [
      { text: "Speak to Hexar contact at Skyline Lounge", done: 0, total: 1, reward: 60 },
      { text: "Recover encrypted dataspike from Glitch Caverns", done: 0, total: 1, reward: 60, locked: true },
    ],
    rewards: [{ glyph: "CHM", rarity: "rare" }, { glyph: "PWR", rarity: "epic" }, { glyph: "AVR", rarity: "epic" }, { glyph: "+2", rarity: null, plus: true }],
  },
  { id: "c3", faction: "oni", title: "Can't Adapt: Can't Fight I", tag: "STANDARD",
    desc: "Tool Carts contain weapon mods and consumables. Loot their contents to outfit your weapons and enhance combat strength.",
    objectives: [
      { text: "Loot Tool Carts", done: 0, total: 1, reward: 60 },
      { text: "Use utility or survivability consumables", done: 0, total: 1, reward: 60 },
    ],
    rewards: null,
  },
  { id: "c4", faction: "kyro", title: "Pathfinder I", tag: "WEEKLY",
    desc: "Explore the Neon Atrium and discover all 6 hidden data caches. Each cache rewards Coins and Faction Reputation.",
    objectives: [
      { text: "Discover hidden data caches", done: 3, total: 6, reward: 120 },
      { text: "Use any movement consumable", done: 1, total: 1, reward: 30 },
    ],
    rewards: [{ glyph: "COR", rarity: "epic" }, { glyph: "BTS", rarity: "rare" }, { glyph: "+1", rarity: null, plus: true }],
  },
  { id: "c5", faction: "aether", title: "Signal Intercept III", tag: "DAILY",
    desc: "Aether tags six rogue beacons across the hub for triangulation. Tag them all to receive a Rare-tier datacore.",
    objectives: [
      { text: "Tag rogue beacons", done: 4, total: 6, reward: 45 },
      { text: "Avoid detection by patrols", done: 0, total: 1, reward: 45 },
    ],
    rewards: [{ glyph: "COR", rarity: "rare" }, { glyph: "AMM", rarity: "common" }],
  },
  { id: "c6", faction: "vulcan", title: "Hot Iron", tag: "CHALLENGE",
    desc: "Win 5 consecutive duels in the Iaido Dojo without taking damage. Vulcan rewards perfect aggression.",
    objectives: [{ text: "Consecutive perfect duels", done: 2, total: 5, reward: 150 }],
    rewards: [{ glyph: "KTN", rarity: "legendary" }, { glyph: "CAP", rarity: "epic" }, { glyph: "+1", rarity: null, plus: true }],
  },
];

export class UIContractsPanel extends HTMLElement {
  private activeFaction = "all";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.centerPanel(1080, 620);
    this.setupDraggable();
    this.setupInteractions();
    this.renderContracts();
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
    const chips = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".faction-filters .filter-chip");
    chips?.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.activeFaction = chip.dataset.faction || "all";
        chips.forEach((c) => {
          c.classList.toggle("active", c === chip);
        });
        this.renderContracts();
      });
    });
  }

  private renderContracts(): void {
    const list = this.shadowRoot?.querySelector("#contracts-list");
    if (!list) return;

    const filtered = this.activeFaction === "all"
      ? contractsData
      : contractsData.filter((c) => c.faction === this.activeFaction);

    list.innerHTML = filtered.map((c) => {
      const fac = factionMeta[c.faction];
      const inProgress = c.tag === "WEEKLY" || c.tag === "DAILY";

      const objectives = c.objectives.map((o) => `
        <div class="objective ${o.locked ? "locked" : ""}">
          ${o.locked ? `<span class="lock">⊘</span>` : ""}
          <div class="obj-text">${o.text}</div>
          <div class="obj-progress">
            <span class="v ${o.done === o.total ? "done" : ""}">${o.done}/${o.total}</span>
            ${o.reward ? `<span class="reward">¢ ${o.reward}</span>` : ""}
          </div>
        </div>`).join("");

      const rewards = c.rewards ? `
        <div class="ctr-rewards">
          <div class="lbl">Completion rewards</div>
          <div class="reward-grid">${c.rewards.map((r) => `
            <div class="rwd ${r.plus ? "plus" : ""}">
              ${r.rarity ? `<span class="rarity-bar ${r.rarity}"></span>` : ""}
              <span class="glyph">${r.glyph}</span>
            </div>`).join("")}
          </div>
        </div>` : "";

      return `
        <div class="contract-card" style="--ctr-color: ${fac.color}">
          <div class="ctr-head">${c.title}</div>
          <span class="ctr-tag">${c.tag}</span>
          <div class="ctr-desc">${c.desc}</div>
          <div class="ctr-objectives">${objectives}</div>
          ${rewards}
          <div class="ctr-activate">
            <span class="icon">×</span>
            <span>${inProgress ? "In progress" : "Activate"}</span>
          </div>
        </div>`;
    }).join("");
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
