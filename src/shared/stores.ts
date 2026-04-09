import * as THREE from "three/webgpu";
import { StoreManager } from "@managers/store-manager";
import { GameState } from "@shared/types";
import { ConsoleState } from "@shared/types";
import { Action } from "@shared/enums";

export const GameStore = new StoreManager<GameState>({
  action: Action.Default,
  camera: null,
  dashTargetPosition: null,
  gameMode: null,
  lastDashTime: 0,
  mainPlayerId: "",
  mappedPlayers: {},
  mouseLocation: new THREE.Vector2(-1, 1), // top left corner
  objectToPlace: null,
  renderer: null,
  scene: null,
  targetPosition: null,
  wireframeMesh: null,
});

export const ConsoleStore = new StoreManager<ConsoleState>({
  history: [],
});
