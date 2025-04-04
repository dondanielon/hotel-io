import * as THREE from 'three';
import { MovementComponent } from '@root/components/movement.component';
import { PlayerAnimationComponent } from '@root/components/player-animation.component';
import { PlayerComponent } from '@root/components/player.component';
import { ECSYThreeEntity, ECSYThreeSystem } from 'ecsy-three';
import { Vector3 } from 'three';

/**
 * System responsible for handling player movement and animations
 */
export class MovementSystem extends ECSYThreeSystem {
  private static readonly ROTATION_SPEED = 10;
  private static readonly ANIMATION_FADE_DURATION = 0.2;

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

    const direction = this.calculateMovementDirection(
      playerMesh.position,
      movementComponent.targetPosition
    );
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

  private calculateMovementDirection(currentPosition: Vector3, targetPosition: Vector3): Vector3 {
    return new Vector3().subVectors(targetPosition, currentPosition).normalize();
  }

  private handleMovingState(animationComponent: PlayerAnimationComponent): void {
    if (!animationComponent.walk.isRunning()) {
      animationComponent.idle.fadeOut(MovementSystem.ANIMATION_FADE_DURATION);
      animationComponent.walk.reset().fadeIn(MovementSystem.ANIMATION_FADE_DURATION).play();
    }
  }

  private handleStoppedState(animationComponent: PlayerAnimationComponent): void {
    if (animationComponent.walk.isRunning()) {
      animationComponent.walk.fadeOut(MovementSystem.ANIMATION_FADE_DURATION);
      animationComponent.idle.reset().fadeIn(MovementSystem.ANIMATION_FADE_DURATION).play();
    }
  }

  private calculateRotationY(currentRotationY: number, direction: Vector3, delta: number): number {
    const targetRotation = Math.atan2(direction.x, direction.z);
    let rotationDifference = targetRotation - currentRotationY;

    // Normalize rotation difference to [-PI, PI]
    if (rotationDifference > Math.PI) rotationDifference -= Math.PI * 2;
    if (rotationDifference < -Math.PI) rotationDifference += Math.PI * 2;

    const smoothAngle =
      currentRotationY + rotationDifference * MovementSystem.ROTATION_SPEED * delta + Math.PI;
    return THREE.MathUtils.euclideanModulo(smoothAngle, Math.PI * 2) - Math.PI;
  }
}
