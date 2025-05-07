import * as THREE from "three";
import { ECSYThreeEntity, ECSYThreeSystem, WebGLRendererComponent } from "ecsy-three";
import { Constants } from "@root/constants";
import { GameStore } from "@root/stores/game.store";

/**
 * System responsible for managing the camera position and orientation
 */
export class CameraSystem extends ECSYThreeSystem {
  static queries = {
    renderer: { components: [WebGLRendererComponent] },
  };

  execute(_delta: number, _time: number): void {
    const targetEntity = GameStore.getState().cameraTarget;
    const camera = this.queries.renderer.results[0]
      ?.getComponent(WebGLRendererComponent)
      ?.camera.getObject3D<THREE.PerspectiveCamera>();

    if (!camera) {
      console.error("Camera not found");
      return;
    }

    this.updateCameraPosition(camera, targetEntity ?? undefined);
  }

  private updateCameraPosition(camera: THREE.Camera, entity?: ECSYThreeEntity): void {
    const mesh = entity?.getObject3D<THREE.Mesh>() ?? null;

    camera.position.set(
      (mesh ? mesh.position.x : 0) + Constants.CAMERA_SYSTEM_X_POSITION_ADD,
      (mesh ? mesh.position.y : 0) + Constants.CAMERA_SYSTEM_Y_POSITION_ADD,
      (mesh ? mesh.position.z : 0) + Constants.CAMERA_SYSTEM_Z_POSITION_ADD,
    );

    camera.lookAt(mesh ? mesh.position : new THREE.Vector3(0, 0, 0));
  }
}
