import * as THREE from "three/webgpu";
import { Player } from "@objects/player";
import { CAMERA_X_POSITION_ADD, CAMERA_Y_POSITION_ADD, CAMERA_Z_POSITION_ADD } from "@root/shared/constants";

export class CameraManager {
  constructor(
    private camera: THREE.PerspectiveCamera,
    private mainPlayer: Player,
  ) {}

  public update(_delta: number, _elapsed: number): void {
    this.camera.position.set(
      (this.mainPlayer.mesh ? this.mainPlayer.mesh.position.x : 0) + CAMERA_X_POSITION_ADD,
      (this.mainPlayer.mesh ? this.mainPlayer.mesh.position.y : 0) + CAMERA_Y_POSITION_ADD,
      (this.mainPlayer.mesh ? this.mainPlayer.mesh.position.z : 0) + CAMERA_Z_POSITION_ADD,
    );
    const targetPosition = this.mainPlayer.mesh.position.clone();
    // Adjust the target position to be slightly above to avoid looking at the player's feet
    targetPosition.y += 0.75;

    this.camera.lookAt(targetPosition);
  }
}
