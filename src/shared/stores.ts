import * as THREE from "three/webgpu";
import { StoreManager } from "@managers/store-manager";
import { GameState } from "@shared/types";
import { ConsoleState } from "@shared/types";

export const GameStore = new StoreManager<GameState>({
  camera: null,
  dashTargetPosition: null,
  gameMode: null,
  lastDashTime: 0,
  mainPlayerId: "",
  mappedPlayers: {},
  mouseLocation: new THREE.Vector2(-1, 1), // top left corner
  renderer: null,
  scene: null,
  targetPosition: null,
  wireframeMesh: null,
});

export const ConsoleStore = new StoreManager<ConsoleState>({
  history: [],
});
