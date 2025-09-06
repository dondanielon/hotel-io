import { ECSYThreeEntity } from "ecsy-three";
import * as THREE from "three";

/**
 * Utility functions for collision detection
 */
export class CollisionUtils {
  /**
   * Calculate 2D distance between two points (ignoring Y axis)
   */
  static distance2D(x1: number, z1: number, x2: number, z2: number): number {
    const dx = x1 - x2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Check if two circles are colliding
   */
  static testCircleCollision(posA: THREE.Vector3, radiusA: number, posB: THREE.Vector3, radiusB: number): boolean {
    const distance = this.distance2D(posA.x, posA.z, posB.x, posB.z);
    return distance < radiusA + radiusB;
  }

  /**
   * Check if two AABBs are colliding
   */
  static testAABBCollision(
    posA: THREE.Vector3,
    sizeA: THREE.Vector2,
    posB: THREE.Vector3,
    sizeB: THREE.Vector2,
  ): boolean {
    return !(
      posA.x + sizeA.x / 2 < posB.x - sizeB.x / 2 ||
      posA.x - sizeA.x / 2 > posB.x + sizeB.x / 2 ||
      posA.z + sizeA.y / 2 < posB.z - sizeB.y / 2 ||
      posA.z - sizeA.y / 2 > posB.z + sizeB.y / 2
    );
  }

  /**
   * Get collision bounds for an entity
   */
  static getEntityBounds(entity: ECSYThreeEntity): { x: number; y: number; width: number; height: number } {
    const collider = entity.getComponent("Collision2DComponent" as any) as any;
    const object = entity.getObject3D()!;
    const pos = object.position;
    const radius = collider.radius || 1;

    return {
      x: pos.x - radius,
      y: pos.z - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  /**
   * Check if entity should collide with another based on layers
   */
  static shouldCollide(entityA: ECSYThreeEntity, entityB: ECSYThreeEntity): boolean {
    const colliderA = entityA.getComponent("Collision2DComponent" as any) as any;
    const colliderB = entityB.getComponent("Collision2DComponent" as any) as any;

    return (colliderA.collidesWith & colliderB.layer) !== 0 && (colliderB.collidesWith & colliderA.layer) !== 0;
  }
}
