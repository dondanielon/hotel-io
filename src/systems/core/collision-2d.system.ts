import * as THREE from "three";
import { ECSYThreeEntity, ECSYThreeSystem, Object3DComponent } from "ecsy-three";
import { Collision2DComponent } from "@components/collision-2d.component";
import { CollisionShape2D } from "@shared/enums/game.enums";
import { SpatialHashGrid } from "@libs/physics";
import { MathUtils } from "@root/shared/utils/math.utils";

/**
 * System responsible for handling collision detection
 */
export class CollisionSystem extends ECSYThreeSystem {
  static queries = {
    colliders: {
      components: [Collision2DComponent, Object3DComponent],
    },
  };

  private spatialGrid = new SpatialHashGrid(20);

  execute(_delta: number, _time: number): void {
    const entities = this.queries.colliders.results;

    this.handleCollisions(entities);
    this.updateCollisionStates(entities);
  }

  private handleCollisions(entities: ECSYThreeEntity[]): void {
    this.spatialGrid.clear();

    for (const entity of entities) {
      const collider = entity.getComponent(Collision2DComponent)!;
      if (collider.isActive) {
        this.spatialGrid.insert(entity);
      }
    }

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
    const distance = MathUtils.distance2D(posA.x, posA.z, posB.x, posB.z);

    if (colliderA.shape === CollisionShape2D.CIRCLE && colliderB.shape === CollisionShape2D.CIRCLE) {
      return distance < colliderA.radius + colliderB.radius;
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

          const distance = MathUtils.distance2D(
            object.position.x,
            object.position.z,
            otherObject.position.x,
            otherObject.position.z,
          );

          const isColliding = distance < collider.radius + otherCollider.radius;

          if (!isColliding) {
            collider.collidingEntities.delete(otherEntity);
            console.log(`${entity.id} not colliding with ${otherEntity.id}`);
          }
        });
      }
    }
  }
}
