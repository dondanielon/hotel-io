import { User } from "@root/types/user.types";
import { Store } from "./store";
import * as THREE from "three";
import { ECSYThreeEntity } from "ecsy-three";

export interface GameState {
  mappedPlayers: Record<string, number>;
  mouseLocation: THREE.Vector2;
  requestGameList: boolean;
  targetPosition: { x: number; y: number; z: number } | null;
  user: User | null;
  lastDashTime: number;
  cameraTarget: ECSYThreeEntity | null;
}

export const GameStore = new Store<GameState>({
  mappedPlayers: {},
  mouseLocation: new THREE.Vector2(-1, 1), // top left corner
  requestGameList: false,
  targetPosition: null,
  user: null,
  lastDashTime: 0,
  cameraTarget: null,
});
