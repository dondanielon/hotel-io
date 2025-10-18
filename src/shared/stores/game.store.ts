import { User } from "@root/shared/types/user.types";
import { Store } from "../../libs/state-manager/store";
import * as THREE from "three";
import { ECSYThreeEntity } from "ecsy-three";

export interface GameState {
  gameMode: "sandbox" | "multiplayer" | null;
  mappedPlayers: Record<string, number>;
  mouseLocation: THREE.Vector2;
  requestGameList: boolean;
  targetPosition: THREE.Vector3 | null;
  dashTargetPosition: THREE.Vector3 | null;
  user: User | null;
  lastDashTime: number;
  cameraTarget: ECSYThreeEntity | null;
  playerEntity: ECSYThreeEntity | null;
  playerWireframe: ECSYThreeEntity | null;
  playerAxes: THREE.Group<THREE.Object3DEventMap> | null;
}

export const GameStore = new Store<GameState>({
  gameMode: null,
  mappedPlayers: {},
  mouseLocation: new THREE.Vector2(-1, 1), // top left corner
  requestGameList: false,
  targetPosition: null,
  dashTargetPosition: null,
  user: null,
  lastDashTime: 0,
  cameraTarget: null,
  playerEntity: null,
  playerWireframe: null,
  playerAxes: null,
});
