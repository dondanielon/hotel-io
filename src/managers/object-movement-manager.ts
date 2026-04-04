import * as THREE from "three/webgpu";
import { Player } from "@objects/player";
import { PLAYER_DASH_ROTATION_SPEED, PLAYER_DASH_SPEED, PLAYER_ROTATION_SPEED } from "@shared/constants";

export class ObjectMovementManager {
  constructor(private players: Map<string, Player>) {}

  public update(delta: number, _elapsed: number): void {
    for (const [_playerId, player] of this.players) {
      this.handlePlayerDash(player, delta);
      this.handlePlayerNormalMovement(player, delta);
    }
  }

  private handlePlayerDash(player: Player, delta: number): void {
    if (!player.isDashing || !player.dashDirection) return;

    player.dashTimer -= delta;

    if (player.dashTimer <= 0) {
      player.isDashing = false;
      player.dashDirection = null;
      player.dashTimer = 0;
    } else {
      const step = player.dashDirection.clone().multiplyScalar(PLAYER_DASH_SPEED * delta);
      player.mesh.position.add(step);
      player.mesh.rotation.y = this.calculatePlayerRotationY(
        player.mesh.rotation.y,
        player.dashDirection,
        PLAYER_DASH_ROTATION_SPEED,
        delta,
      );
    }
  }

  private handlePlayerNormalMovement(player: Player, delta: number): void {
    if (!player.isMoving || !player.targetPosition) return;

    const distance = player.speed * delta;
    const direction = new THREE.Vector3().subVectors(player.targetPosition, player.mesh.position).normalize();
    const step = direction.multiplyScalar(distance);

    if (player.mesh.position.distanceTo(player.targetPosition) > distance) {
      player.mesh.position.add(step);
    } else {
      player.mesh.position.copy(player.targetPosition);
      player.isMoving = false;
      player.targetPosition = null;
    }

    player.mesh.rotation.y = this.calculatePlayerRotationY(
      player.mesh.rotation.y,
      direction,
      PLAYER_ROTATION_SPEED,
      delta,
    );
  }

  private calculatePlayerRotationY(
    currentRotationY: number,
    direction: THREE.Vector3,
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
