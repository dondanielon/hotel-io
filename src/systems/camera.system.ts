import * as THREE from 'three';
import { ECSYThreeSystem, WebGLRendererComponent } from 'ecsy-three';
import {
  CAMERA_SYSTEM_X_POSITION_ADD,
  CAMERA_SYSTEM_Y_POSITION_ADD,
  CAMERA_SYSTEM_Z_POSITION_ADD,
} from '@root/constants';
import { GameStore } from '@root/stores/game.store';
import { PlayerComponent } from '@root/components/player.component';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';

export class CameraSystem extends ECSYThreeSystem {
  static queries = {
    renderer: { components: [WebGLRendererComponent] },
    players: {
      components: [PlayerComponent, MovementComponent, PlayerAnimationComponent],
    },
  };

  execute(_delta: number, _time: number): void {
    const playerEntityId = GameStore.getState().mappedPlayers[GameStore.getState().user?.id ?? ''];
    const playerEntity = this.queries.players?.results.find((x) => x.id === playerEntityId);
    const rendereComponent = this.queries.renderer.results[0].getComponent(WebGLRendererComponent);
    const camera = rendereComponent?.camera.getObject3D();

    if (!playerEntity) return;

    const playerMesh = playerEntity.getObject3D<THREE.Mesh>()!;

    camera?.position.set(
      playerMesh.position.x + CAMERA_SYSTEM_X_POSITION_ADD,
      playerMesh.position.y + CAMERA_SYSTEM_Y_POSITION_ADD,
      playerMesh.position.z + CAMERA_SYSTEM_Z_POSITION_ADD
    );
    camera?.lookAt(playerMesh.position);
  }
}
