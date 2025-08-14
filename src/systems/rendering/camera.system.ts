import * as THREE from "three";
import { ECSYThreeEntity, ECSYThreeObject3D, ECSYThreeSystem, WebGLRendererComponent } from "ecsy-three";
import { CameraConstants } from "@shared/constants/camera.constants";
import { GameStore } from "@root/shared/stores/game.store";

/**
 * System responsible for managing the camera position and orientation
 */
export class CameraSystem extends ECSYThreeSystem {
  static queries = {
    renderer: { components: [WebGLRendererComponent] },
  };

  execute(_delta: number, _time: number): void {
    const targetEntity = GameStore.getState().playerEntity;
    const camera = this.getCamera();

    this.updateCameraPosition(camera, targetEntity);
  }

  private updateCameraPosition(camera: THREE.Camera, entity: ECSYThreeEntity | null): void {
    const mesh = entity?.getObject3D<THREE.Mesh>() ?? null;

    camera.position.set(
      (mesh ? mesh.position.x : 0) + CameraConstants.X_POSITION_ADD,
      (mesh ? mesh.position.y : 0) + CameraConstants.Y_POSITION_ADD,
      (mesh ? mesh.position.z : 0) + CameraConstants.Z_POSITION_ADD,
    );

    camera.lookAt(mesh ? mesh.position.clone().setY(mesh.position.y + 0.75) : new THREE.Vector3(0, 0, 0));
  }

  private getCamera(): THREE.PerspectiveCamera & ECSYThreeObject3D {
    return this.queries.renderer.results[0]!.getComponent(
      WebGLRendererComponent,
    )!.camera.getObject3D<THREE.PerspectiveCamera>()!;
  }
}
