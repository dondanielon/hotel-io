export class TerrainEditorMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        /*This is just a comment*/
        .container { 
          position: absolute; 
          right: 0; 
          z-index: 100; 
          background-color: red; 
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .option-button {
          background: hsl(0 0% 9%);
          border: 1px solid hsl(0 0% 14.9%);
          border-radius: 6px;
          color: hsl(0 0% 98%);
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          cursor: url("/cursor-v1.png") 3 2, auto !important;
        }

        .option-button:hover {
          background: hsl(0 0% 14.9%);
          border-color: hsl(0 0% 21.9%);
        }

        .option-button:active {
          transform: translateY(1px);
        }
      </style> 

      <div class="container">
        <h2> World Editor </h2>
        <button class="option-button"> Cube </button>
      </div>
    `;
  }
}
