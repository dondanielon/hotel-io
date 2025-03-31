import * as THREE from 'three';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';
import { PlayerComponent } from '@root/components/player.component';
import { ECSYThreeSystem } from 'ecsy-three';
import { Vector3 } from 'three';

export class MovementSystem extends ECSYThreeSystem {
  static queries = {
    players: {
      components: [PlayerComponent, MovementComponent, PlayerAnimationComponent],
    },
  };

  execute(delta: number, _time: number): void {
    this.queries.players.results.forEach((entity) => {
      const playerComponent = entity.getComponent(PlayerComponent);
      const movementComponent = entity.getMutableComponent(MovementComponent);
      const animationComponent = entity.getComponent(PlayerAnimationComponent);

      if (playerComponent && movementComponent && animationComponent) {
        if (movementComponent.isMoving && movementComponent.targetPosition) {
          const playerMesh = entity.getObject3D<THREE.Mesh>()!;
          const direction = new Vector3()
            .subVectors(movementComponent.targetPosition, playerMesh.position)
            .normalize();

          const distance = movementComponent.speed * delta;
          const step = direction.multiplyScalar(distance);

          if (playerMesh.position.distanceTo(movementComponent.targetPosition) > distance) {
            if (!animationComponent.walk.isRunning()) {
              animationComponent.idle.fadeOut(0.2);
              animationComponent.walk.reset().fadeIn(0.2).play();
            }

            playerMesh.position.add(step);
          } else {
            if (animationComponent.walk.isRunning()) {
              animationComponent.walk.fadeOut(0.2);
              animationComponent.idle.reset().fadeIn(0.2).play();
            }

            playerMesh.position.copy(movementComponent.targetPosition);
            movementComponent.isMoving = false;
            movementComponent.targetPosition = null;
          }

          const targetRotation = Math.atan2(direction.x, direction.z);
          const currentRotationY = playerMesh.rotation.y;

          let diference = targetRotation - currentRotationY;
          if (diference > Math.PI) diference -= Math.PI * 2;
          if (diference < -Math.PI) diference += Math.PI * 2;

          const smoothAngle = currentRotationY + diference * 10 * delta;

          playerMesh.rotation.y =
            THREE.MathUtils.euclideanModulo(smoothAngle + Math.PI, Math.PI * 2) - Math.PI;
        }

        animationComponent.mixer.update(delta);
      }
    });
  }
}
