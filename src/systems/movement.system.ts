import * as THREE from 'three';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';
import { PlayerComponent } from '@root/components/player.component';
import { ECSYThreeEntity, ECSYThreeSystem } from 'ecsy-three';
import { Vector3 } from 'three';
import { Constants } from '@root/constants';

/**
 * System responsible for handling player movement and animations
 */
export class MovementSystem extends ECSYThreeSystem {
  static queries = {
    players: {
      components: [PlayerComponent, MovementComponent, PlayerAnimationComponent],
    },
  };

  execute(delta: number, _time: number): void {
    this.queries.players.results.forEach((entity) => {
      this.updatePlayerMovement(entity, delta);
    });
  }

  private updatePlayerMovement(entity: ECSYThreeEntity, delta: number): void {
    const playerMesh = entity.getObject3D<THREE.Mesh>();
    const movementComponent = entity.getMutableComponent(MovementComponent);
    const animationComponent = entity.getComponent(PlayerAnimationComponent);

    if (!this.validateComponents(playerMesh, movementComponent, animationComponent)) {
      return;
    }

    this.updatePlayerPosition(playerMesh!, movementComponent!, animationComponent!, delta);
  }

  private validateComponents(
    playerMesh?: THREE.Mesh,
    movementComponent?: MovementComponent,
    animationComponent?: PlayerAnimationComponent
  ): boolean {
    if (!playerMesh || !movementComponent || !animationComponent) {
      console.error('Required component or mesh not found');
      return false;
    }
    return true;
  }

  private updatePlayerPosition(
    playerMesh: THREE.Mesh,
    movementComponent: MovementComponent,
    animationComponent: PlayerAnimationComponent,
    delta: number
  ): void {
    animationComponent.mixer.update(delta);

    if (!movementComponent!.isMoving || !movementComponent!.targetPosition) {
      return;
    }

    const direction = new Vector3()
      .subVectors(movementComponent.targetPosition, playerMesh.position)
      .normalize();
    const distance = movementComponent.speed * delta;
    const step = direction.multiplyScalar(distance);

    if (playerMesh.position.distanceTo(movementComponent.targetPosition) > distance) {
      this.handleMovingState(animationComponent);
      playerMesh.position.add(step);
    } else {
      this.handleStoppedState(animationComponent);
      playerMesh.position.copy(movementComponent.targetPosition);
      movementComponent.isMoving = false;
      movementComponent.targetPosition = null;
    }

    playerMesh.rotation.y = this.calculateRotationY(playerMesh.rotation.y, direction, delta);
  }

  private handleMovingState(animationComponent: PlayerAnimationComponent): void {
    if (!animationComponent.walk.isRunning()) {
      animationComponent.idle.fadeOut(Constants.PLAYER_ANIMATION_FADE_DURATION);
      animationComponent.walk.reset().fadeIn(Constants.PLAYER_ANIMATION_FADE_DURATION).play();
    }
  }

  private handleStoppedState(animationComponent: PlayerAnimationComponent): void {
    if (animationComponent.walk.isRunning()) {
      animationComponent.walk.fadeOut(Constants.PLAYER_ANIMATION_FADE_DURATION);
      animationComponent.idle.reset().fadeIn(Constants.PLAYER_ANIMATION_FADE_DURATION).play();
    }
  }

  private calculateRotationY(currentRotationY: number, direction: Vector3, delta: number): number {
    const targetRotation = Math.atan2(direction.x, direction.z);
    let rotationDifference = targetRotation - currentRotationY;

    // Normalize rotation difference to [-PI, PI]
    if (rotationDifference > Math.PI) rotationDifference -= Math.PI * 2;
    if (rotationDifference < -Math.PI) rotationDifference += Math.PI * 2;

    const smoothAngle = currentRotationY + Constants.PLAYER_ROTATION_SPEED * delta + Math.PI;
    return THREE.MathUtils.euclideanModulo(smoothAngle, Math.PI * 2) - Math.PI;
  }
}
