import * as THREE from "three";
import { ECSYThreeEntity, ECSYThreeSystem, Object3DComponent } from "ecsy-three";
import { Collision2DComponent } from "@components/collision-2d.component";
import { CollisionShape2D } from "@shared/enums/game.enums";
import { SpatialHashGrid, CollisionUtils } from "@libs/physics";

/**
 * System responsible for handling collision detection
 */
export class CollisionSystem extends ECSYThreeSystem {
  static queries = {
    colliders: {
      components: [Collision2DComponent, Object3DComponent],
    },
  };

  private spatialGrid = new SpatialHashGrid(1);

  private performanceStats = {
    lastFrameTime: 0,
    totalFrames: 0,
    averageFrameTime: 0,
    peakFrameTime: 0,
  };

  execute(_delta: number, _time: number): void {
    const startTime = performance.now();
    const entities = this.queries.colliders.results;

    this.handleCollisions(entities);
    this.updateCollisionStates(entities);

    // Update performance stats
    const frameTime = performance.now() - startTime;
    this.updatePerformanceStats(frameTime);
  }

  private updatePerformanceStats(frameTime: number): void {
    this.performanceStats.lastFrameTime = frameTime;
    this.performanceStats.totalFrames++;
    this.performanceStats.averageFrameTime =
      (this.performanceStats.averageFrameTime * (this.performanceStats.totalFrames - 1) + frameTime) /
      this.performanceStats.totalFrames;
    this.performanceStats.peakFrameTime = Math.max(this.performanceStats.peakFrameTime, frameTime);
  }

  private handleCollisions(entities: ECSYThreeEntity[]): void {
    // Clear and rebuild spatial grid
    this.spatialGrid.clear();

    // Insert all entities into spatial grid
    for (const entity of entities) {
      const collider = entity.getComponent(Collision2DComponent)!;
      if (collider.isActive) {
        this.spatialGrid.insert(entity);
      }
    }

    // Check collisions using spatial grid
    for (const entity of entities) {
      const collider = entity.getComponent(Collision2DComponent)!;
      if (!collider.isActive) continue;

      const nearbyEntities = this.spatialGrid.getNearbyEntities(entity);

      for (const otherEntity of nearbyEntities) {
        const otherCollider = otherEntity.getComponent(Collision2DComponent)!;
        if (!otherCollider.isActive) continue;

        // Check if layers should collide (bitmask check)
        if (!(collider.collidesWith & otherCollider.layer) && !(otherCollider.collidesWith & collider.layer)) continue;

        this.checkCollision(entity, otherEntity);
      }
    }
  }

  private checkCollision(entityA: ECSYThreeEntity, entityB: ECSYThreeEntity): void {
    const colliderA = entityA.getComponent(Collision2DComponent)!;
    const colliderB = entityB.getComponent(Collision2DComponent)!;

    if (!colliderA.isActive || !colliderB.isActive) return;

    const objectA = entityA.getObject3D<THREE.Object3D>()!;
    const objectB = entityB.getObject3D<THREE.Object3D>()!;

    let isColliding = this.testCollision(objectA.position, colliderA, objectB.position, colliderB);

    if (isColliding) {
      this.handleCollision(entityA, entityB, colliderA, colliderB);
    }
  }

  private testCollision(
    posA: THREE.Vector3,
    colliderA: Collision2DComponent,
    posB: THREE.Vector3,
    colliderB: Collision2DComponent,
  ): boolean {
    if (colliderA.shape === CollisionShape2D.CIRCLE && colliderB.shape === CollisionShape2D.CIRCLE) {
      return CollisionUtils.testCircleCollision(posA, colliderA.radius, posB, colliderB.radius);
    }

    return false;
  }

  private handleCollision(
    entityA: ECSYThreeEntity,
    entityB: ECSYThreeEntity,
    colliderA: Collision2DComponent,
    colliderB: Collision2DComponent,
  ): void {
    const wasCollidingA = colliderA.collidingEntities.has(entityB);
    const wasCollidingB = colliderB.collidingEntities.has(entityA);

    if (!wasCollidingA) {
      colliderA.collidingEntities.add(entityB);
      console.log(`${entityA.id} colliding with ${entityB.id}`);
    }

    if (!wasCollidingB) {
      colliderB.collidingEntities.add(entityA);
      console.log(`${entityB.id} colliding with ${entityA.id}`);
    }
  }

  private updateCollisionStates(entities: ECSYThreeEntity[]): void {
    for (const entity of entities) {
      const collider = entity.getMutableComponent(Collision2DComponent)!;
      const object = entity.getObject3D<THREE.Object3D>()!;

      if (collider.collidingEntities && collider.collidingEntities.forEach) {
        collider.collidingEntities.forEach((otherEntity: ECSYThreeEntity) => {
          const otherCollider = otherEntity.getComponent(Collision2DComponent);
          const otherObject = otherEntity.getObject3D<THREE.Object3D>();

          if (!otherCollider || !otherObject || !otherCollider.isActive) {
            collider.collidingEntities.delete(otherEntity);
            return;
          }

          const isColliding = CollisionUtils.testCircleCollision(
            object.position,
            collider.radius,
            otherObject.position,
            otherCollider.radius,
          );

          if (!isColliding) {
            collider.collidingEntities.delete(otherEntity);
            console.log(`${entity.id} not colliding with ${otherEntity.id}`);
          }
        });
      }
    }
  }

  getPerformanceStats(): typeof this.performanceStats {
    return { ...this.performanceStats };
  }
}
