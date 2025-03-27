import { System } from 'ecsy';
import { Vector3 } from 'three';
import { WebGLRendererComponent } from 'ecsy-three';
import {
  CAMERA_SYSTEM_X_POSITION_ADD,
  CAMERA_SYSTEM_Y_POSITION_ADD,
  CAMERA_SYSTEM_Z_POSITION_ADD,
} from '../constants';

export class CameraSystem extends System {
  static queries = {
    webgl: { components: [WebGLRendererComponent] },
  };

  execute(_delta: number, _time: number): void {
    const webglEntity = this.queries.webgl.results[0];
    const webglComponent = webglEntity.getComponent(WebGLRendererComponent);

    if (!webglComponent) return;

    const camera = webglComponent.camera.getObject3D();

    camera?.position.set(
      0 + CAMERA_SYSTEM_X_POSITION_ADD,
      0 + CAMERA_SYSTEM_Y_POSITION_ADD,
      0 + CAMERA_SYSTEM_Z_POSITION_ADD
    );
    camera?.lookAt(new Vector3(0, 0, 0));
  }
}
