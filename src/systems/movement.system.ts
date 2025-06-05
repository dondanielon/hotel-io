import * as THREE from "three";
import { MovementComponent } from "@root/components/movement.component";
import { PlayerComponent } from "@root/components/player.component";
import { ECSYThreeSystem } from "ecsy-three";
import { Vector3 } from "three";
import { Constants } from "@root/constants";

/**
 * System responsible for handling player movement
 */
export class MovementSystem extends ECSYThreeSystem {
  static queries = {
    players: {
      components: [PlayerComponent, MovementComponent],
    },
  };

  execute(delta: number, _time: number): void {
    const entities = this.queries.players.results;

    for (const entity of entities) {
      const playerMesh = entity.getObject3D<THREE.Mesh>()!;
      const movementComponent = entity.getMutableComponent(MovementComponent)!;
      // const playerComponent = entity.getComponent(PlayerComponent)!;

      // Only apply movement to remote players (local player is handled by prediction)
      // if (!this.isLocalPlayer(playerComponent.id)) {
      this.handleDash(movementComponent, playerMesh, delta);
      this.handleNormalMovement(movementComponent, playerMesh, delta);
      // }
    }
  }

  private isLocalPlayer(playerId: string): boolean {
    // This should be set by the socket system
    return (window as any).localPlayerId === playerId;
  }

  private handleDash(component: MovementComponent, mesh: THREE.Mesh, delta: number): void {
    if (!component.isDashing || !component.dashDirection) return;

    component.dashTimer -= delta;

    if (component.dashTimer <= 0) {
      component.isDashing = false;
      component.dashDirection = null;
      component.dashTimer = 0;
    } else {
      const step = component.dashDirection.clone().multiplyScalar(Constants.PLAYER_DASH_SPEED * delta);
      mesh.position.add(step);
      mesh.rotation.y = this.calculateRotationY(
        mesh.rotation.y,
        component.dashDirection,
        Constants.PLAYER_DASH_ROTATION_SPEED,
        delta,
      );
    }
  }

  private handleNormalMovement(component: MovementComponent, mesh: THREE.Mesh, delta: number): void {
    if (!component.isMoving || !component.targetPosition) return;

    const distance = component.speed * delta;
    const direction = new Vector3().subVectors(component.targetPosition, mesh.position).normalize();
    const step = direction.multiplyScalar(distance);

    if (mesh.position.distanceTo(component.targetPosition) > distance) {
      mesh.position.add(step);
    } else {
      mesh.position.copy(component.targetPosition);
      component.isMoving = false;
      component.targetPosition = null;
    }

    mesh.rotation.y = this.calculateRotationY(mesh.rotation.y, direction, Constants.PLAYER_ROTATION_SPEED, delta);
  }

  private calculateRotationY(
    currentRotationY: number,
    direction: Vector3,
    rotationSpeed: number,
    delta: number,
  ): number {
    const targetRotation = Math.atan2(direction.x, direction.z);
    let rotationDifference = targetRotation - currentRotationY;

    // Normalize rotation difference to [-PI, PI]
    if (rotationDifference > Math.PI) rotationDifference -= Math.PI * 2;
    if (rotationDifference < -Math.PI) rotationDifference += Math.PI * 2;

    const smoothAngle = currentRotationY + rotationDifference * rotationSpeed * delta;

    return THREE.MathUtils.euclideanModulo(smoothAngle + Math.PI, Math.PI * 2) - Math.PI;
  }
}
