import * as THREE from 'three';
import { System } from 'ecsy';
import { WebGLRendererComponent } from 'ecsy-three';
import {
  CAMERA_SYSTEM_X_POSITION_ADD,
  CAMERA_SYSTEM_Y_POSITION_ADD,
  CAMERA_SYSTEM_Z_POSITION_ADD,
} from '@root/constants';

export class CameraSystem extends System {
  static queries = {
    webgl: { components: [WebGLRendererComponent] },
  };

  execute(_delta: number, _time: number): void {
    const rendereComponent = this.queries.webgl.results[0].getComponent(WebGLRendererComponent);
    const camera = rendereComponent?.camera.getObject3D();

    camera?.position.set(
      0 + CAMERA_SYSTEM_X_POSITION_ADD,
      0 + CAMERA_SYSTEM_Y_POSITION_ADD,
      0 + CAMERA_SYSTEM_Z_POSITION_ADD
    );
    camera?.lookAt(new THREE.Vector3(0, 0, 0));
  }
}
