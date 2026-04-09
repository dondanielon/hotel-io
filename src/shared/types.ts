import * as THREE from "three/webgpu";
import { Action } from "@shared/enums";
import { GameObject } from "@root/objects/game-object";

export interface PlayerAnimations {
  idle: THREE.AnimationAction;
  run: THREE.AnimationAction;
  tpose: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  // dash: THREE.AnimationAction;
  // swordAttack: THREE.AnimationAction;
}

export interface ConsoleState {
  history: string[];
}

export interface GameState {
  action: Action;
  camera: THREE.PerspectiveCamera | null;
  dashTargetPosition: THREE.Vector3 | null;
  gameMode: "sandbox" | "multiplayer" | null;
  lastDashTime: number;
  mainPlayerId: string;
  mappedPlayers: Record<string, number>;
  mouseLocation: THREE.Vector2;
  objectToPlace: GameObject | null;
  renderer: THREE.WebGPURenderer | null;
  scene: THREE.Scene | null;
  targetPosition: THREE.Vector3 | null;
  wireframeMesh: THREE.Group | null;
}
