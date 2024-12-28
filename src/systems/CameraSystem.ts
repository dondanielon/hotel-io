import { PerspectiveCamera } from 'three';
import { PlayerMesh } from '../common/types';
import {
  CAMERA_SYSTEM_ASPECT_RATIO,
  CAMERA_SYSTEM_FAR_VIEW,
  CAMERA_SYSTEM_FOV,
  CAMERA_SYSTEM_NEAR_VIEW,
  CAMERA_SYSTEM_POSITION_LERP_ALPHA,
} from '../common/constants';

export class CameraSystem {
  public camera: PerspectiveCamera;

  constructor(private player: PlayerMesh) {
    this.camera = this.setupCamera();
    this.camera.position.set(0, 0, 0);
  }

  public update(_delta: number): void {
    const v = {
      x: this.player.position.x,
      y: this.player.position.y + 20,
      z: this.player.position.z + 20,
    };

    this.camera.position.lerp(v, CAMERA_SYSTEM_POSITION_LERP_ALPHA);
    this.camera.lookAt(this.player.position);
  }

  private setupCamera() {
    return new PerspectiveCamera(
      CAMERA_SYSTEM_FOV,
      CAMERA_SYSTEM_ASPECT_RATIO,
      CAMERA_SYSTEM_NEAR_VIEW,
      CAMERA_SYSTEM_FAR_VIEW
    );
  }
}
