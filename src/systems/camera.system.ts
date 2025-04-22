import * as THREE from 'three';
import { ECSYThreeEntity, ECSYThreeSystem, WebGLRendererComponent } from 'ecsy-three';
import { Constants } from '@root/constants';
import { GameStore } from '@root/stores/game.store';
import { PlayerComponent } from '@root/components/player.component';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';

/**
 * System responsible for managing the camera position and orientation
 */
export class CameraSystem extends ECSYThreeSystem {
  static queries = {
    renderer: { components: [WebGLRendererComponent] },
    players: {
      components: [PlayerComponent, MovementComponent, PlayerAnimationComponent],
    },
  };

  execute(_delta: number, _time: number): void {
    const playerEntity = this.getCurrentPlayerEntity();
    const camera = this.getCamera();

    if (!playerEntity || !camera) {
      return;
    }

    this.updateCameraPosition(camera, playerEntity);
  }

  // TODO: Don't log errors if authentication is not yet completed
  private getCurrentPlayerEntity(): ECSYThreeEntity | null {
    const userId = GameStore.getState().user?.id;
    if (!userId) {
      console.warn('No user ID found in game store');
      return null;
    }

    const playerEntityId = GameStore.getState().mappedPlayers[userId];
    if (!playerEntityId) {
      console.warn('No player entity ID found for user:', userId);
      return null;
    }

    const playerEntity = this.queries.players.results.find(
      (entity) => entity.id === playerEntityId
    );
    if (!playerEntity) {
      console.warn('Player entity not found with ID:', playerEntityId);
      return null;
    }

    return playerEntity;
  }

  private getCamera(): THREE.PerspectiveCamera | null {
    const rendererEntity = this.queries.renderer.results[0];
    if (!rendererEntity) {
      console.warn('No renderer entity found');
      return null;
    }

    const rendererComponent = rendererEntity.getComponent(WebGLRendererComponent);
    if (!rendererComponent) {
      console.warn('No renderer component found');
      return null;
    }

    const camera = rendererComponent.camera.getObject3D<THREE.PerspectiveCamera>();
    if (!camera) {
      console.warn('No camera found in renderer component');
      return null;
    }

    return camera;
  }

  private updateCameraPosition(camera: THREE.Camera, playerEntity: ECSYThreeEntity): void {
    const playerMesh = playerEntity.getObject3D<THREE.Mesh>();
    if (!playerMesh) {
      console.warn('No player mesh found');
      return;
    }

    try {
      // camera.position.set(
      //   playerMesh.position.x + Constants.CAMERA_SYSTEM_X_POSITION_ADD,
      //   playerMesh.position.y + Constants.CAMERA_SYSTEM_Y_POSITION_ADD,
      //   playerMesh.position.z + Constants.CAMERA_SYSTEM_Z_POSITION_ADD
      // );

      // camera.lookAt(playerMesh.position);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    } catch (error) {
      console.error('Error updating camera position:', error);
    }
  }
}
