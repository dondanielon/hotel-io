import * as THREE from 'three';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerComponent } from '@root/components/player.component';
import { ECSYThreeSystem } from 'ecsy-three';
import { Vector3 } from 'three';
import { Constants } from '@root/constants';

/**
 * System responsible for handling player movement and animations
 */
export class MovementSystem extends ECSYThreeSystem {
  static queries = {
    players: {
      components: [PlayerComponent, MovementComponent],
    },
  };

  execute(delta: number, _time: number): void {
    this.queries.players.results.forEach((entity) => {
      const playerMesh = entity.getObject3D<THREE.Mesh>()!;
      const movementComponent = entity.getMutableComponent(MovementComponent)!;

      if (!movementComponent.isMoving || !movementComponent.targetPosition) return;

      const distance = movementComponent.speed * delta;
      const direction = new Vector3()
        .subVectors(movementComponent.targetPosition, playerMesh.position)
        .normalize();

      const step = direction.multiplyScalar(distance);

      if (playerMesh.position.distanceTo(movementComponent.targetPosition) > distance) {
        playerMesh.position.add(step);
      } else {
        playerMesh.position.copy(movementComponent.targetPosition);
        movementComponent.isMoving = false;
        movementComponent.targetPosition = null;
      }

      playerMesh.rotation.y = this.calculateRotationY(playerMesh.rotation.y, direction, delta);
    });
  }

  private calculateRotationY(currentRotationY: number, direction: Vector3, delta: number): number {
    const targetRotation = Math.atan2(direction.x, direction.z);
    let rotationDifference = targetRotation - currentRotationY;

    // Normalize rotation difference to [-PI, PI]
    if (rotationDifference > Math.PI) rotationDifference -= Math.PI * 2;
    if (rotationDifference < -Math.PI) rotationDifference += Math.PI * 2;

    const smoothAngle =
      currentRotationY + rotationDifference * Constants.PLAYER_ROTATION_SPEED * delta;

    return THREE.MathUtils.euclideanModulo(smoothAngle + Math.PI, Math.PI * 2) - Math.PI;
  }
}
