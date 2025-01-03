import { PerspectiveCamera } from 'three';

import { PlayerEntity } from '../entities/PlayerEntity';
import {
  CAMERA_SYSTEM_POSITION_LERP_ALPHA,
  CAMERA_SYSTEM_X_POSITION_ADD,
  CAMERA_SYSTEM_Y_POSITION_ADD,
  CAMERA_SYSTEM_Z_POSITION_ADD,
} from '../common/constants';

export class CameraSystem {
  private camera: PerspectiveCamera;
  private player: PlayerEntity;

  public cX = CAMERA_SYSTEM_X_POSITION_ADD;
  public cY = CAMERA_SYSTEM_Y_POSITION_ADD;
  public cZ = CAMERA_SYSTEM_Z_POSITION_ADD;

  constructor(camera: PerspectiveCamera, player: PlayerEntity) {
    this.camera = camera;
    this.camera.position.set(0, 0, 0);

    this.player = player;
  }

  public update(_delta: number): void {
    const position = this.player.mesh.position;
    const v = {
      x: position.x + this.cX,
      y: position.y + this.cY,
      z: position.z + this.cZ,
    };

    this.camera.position.lerp(v, CAMERA_SYSTEM_POSITION_LERP_ALPHA);
    this.camera.lookAt(position);
  }
}
