import * as THREE from "three/webgpu";

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
  isOpen: boolean;
}

export interface GameState {
  camera: THREE.PerspectiveCamera | null;
  dashTargetPosition: THREE.Vector3 | null;
  gameMode: "sandbox" | "multiplayer" | null;
  lastDashTime: number;
  mainPlayerId: string;
  mappedPlayers: Record<string, number>;
  mouseLocation: THREE.Vector2;
  renderer: THREE.WebGPURenderer | null;
  scene: THREE.Scene | null;
  targetPosition: THREE.Vector3 | null;
  wireframeMesh: THREE.Group | null;
}
