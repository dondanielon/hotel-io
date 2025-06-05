import { Game } from "./game";

console.log("Starting Hotel.io V2 - Server Authoritative with Client Prediction");

const game = new Game();
game.setupLobby();

// Expose game instance for debugging
(window as any).game = game;

// Add version indicator to the page
const versionDiv = document.createElement("div");
versionDiv.style.position = "absolute";
versionDiv.style.top = "10px";
versionDiv.style.left = "10px";
versionDiv.style.color = "#00ff00";
versionDiv.style.fontFamily = "Arial, sans-serif";
versionDiv.style.fontSize = "16px";
versionDiv.style.fontWeight = "bold";
versionDiv.style.backgroundColor = "rgba(0,0,0,0.8)";
versionDiv.style.padding = "8px 12px";
versionDiv.style.borderRadius = "5px";
versionDiv.style.border = "2px solid #00ff00";
versionDiv.textContent = "HOTEL.IO V2";
document.body.appendChild(versionDiv);

console.log("Hotel.io V2 initialized successfully");
