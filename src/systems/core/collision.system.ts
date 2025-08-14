import * as THREE from "three";
import { ECSYThreeSystem } from "ecsy-three";
import { CollisionComponent } from "@components/collision.component";
import { MovementComponent } from "@components/movement.component";
import { PlayerComponent } from "@components/player.component";

/**
 * System responsible for handling collision detection and response
 */
export class CollisionSystem extends ECSYThreeSystem {
  private debugMeshes: Map<string, THREE.Mesh> = new Map();

  static queries = {
    collidableObjects: {
      components: [CollisionComponent],
    },
    movingPlayers: {
      components: [PlayerComponent, MovementComponent, CollisionComponent],
    },
  };

  execute(delta: number, _time: number): void {
    this.updateBoundingBoxes();
    this.handlePlayerCollisions();
    this.updateDebugVisualization();
  }

  /**
   * Update all bounding boxes based on current object positions
   */
  private updateBoundingBoxes(): void {
    for (const entity of this.queries.collidableObjects.results) {
      const collisionComponent = entity.getMutableComponent(CollisionComponent)!;
      const object3D = entity.getObject3D();

      if (!object3D) continue;

      if (collisionComponent.shapeType === "box") {
        // Update bounding box from the mesh geometry
        const box = new THREE.Box3().setFromObject(object3D);
        collisionComponent.boundingBox = box;
      } else if (collisionComponent.shapeType === "sphere") {
        // For sphere collision, create a bounding box around the sphere
        const center = object3D.position;
        const radius = collisionComponent.radius;
        collisionComponent.boundingBox = new THREE.Box3(
          new THREE.Vector3(center.x - radius, center.y - radius, center.z - radius),
          new THREE.Vector3(center.x + radius, center.y + radius, center.z + radius),
        );
      }
    }
  }

  /**
   * Handle collisions for moving players
   */
  private handlePlayerCollisions(): void {
    for (const playerEntity of this.queries.movingPlayers.results) {
      const playerMovement = playerEntity.getMutableComponent(MovementComponent)!;
      const playerMesh = playerEntity.getObject3D<THREE.Mesh>();

      if (!playerMesh || !playerMovement.isMoving || !playerMovement.targetPosition) continue;

      // Calculate the intended movement direction and distance
      const currentPosition = playerMesh.position.clone();
      const targetPosition = playerMovement.targetPosition.clone();
      const movementDirection = new THREE.Vector3().subVectors(targetPosition, currentPosition).normalize();
      const totalDistance = currentPosition.distanceTo(targetPosition);

      // Check for collisions along the path
      const collisionResult = this.checkPathCollision(currentPosition, targetPosition, playerEntity);

      if (collisionResult.hasCollision) {
        // Stop movement at collision point
        playerMovement.targetPosition = collisionResult.collisionPoint;

        // If we're very close to the collision point, stop moving entirely
        if (currentPosition.distanceTo(collisionResult.collisionPoint) < 0.1) {
          playerMovement.isMoving = false;
          playerMovement.targetPosition = null;
        }
      }
    }
  }

  /**
   * Check for collisions along a movement path
   */
  private checkPathCollision(
    start: THREE.Vector3,
    end: THREE.Vector3,
    movingEntity: any,
  ): { hasCollision: boolean; collisionPoint: THREE.Vector3 } {
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const distance = start.distanceTo(end);
    const stepSize = 0.1; // Check collision every 10cm
    const playerRadius = 0.5; // Player collision radius

    for (let i = 0; i <= distance; i += stepSize) {
      const testPoint = start.clone().add(direction.clone().multiplyScalar(i));

      // Create a bounding box for the player at this test point
      const playerBox = new THREE.Box3(
        new THREE.Vector3(testPoint.x - playerRadius, testPoint.y - playerRadius, testPoint.z - playerRadius),
        new THREE.Vector3(testPoint.x + playerRadius, testPoint.y + playerRadius, testPoint.z + playerRadius),
      );

      // Check collision with all blocking objects
      for (const entity of this.queries.collidableObjects.results) {
        if (entity === movingEntity) continue; // Don't collide with self

        const collisionComponent = entity.getComponent(CollisionComponent)!;
        if (!collisionComponent.blocking || !collisionComponent.boundingBox) continue;

        if (playerBox.intersectsBox(collisionComponent.boundingBox)) {
          // Found collision, return the point just before collision
          const safeDistance = Math.max(0, i - stepSize);
          const collisionPoint = start.clone().add(direction.clone().multiplyScalar(safeDistance));
          return { hasCollision: true, collisionPoint };
        }
      }
    }

    return { hasCollision: false, collisionPoint: end };
  }

  /**
   * Update debug visualization for collision boxes
   */
  private updateDebugVisualization(): void {
    // Remove old debug meshes
    this.debugMeshes.forEach((mesh, entityId) => {
      const scene = mesh.parent;
      if (scene) scene.remove(mesh);
    });
    this.debugMeshes.clear();

    // Add new debug meshes for objects with showDebug enabled
    for (const entity of this.queries.collidableObjects.results) {
      const collisionComponent = entity.getComponent(CollisionComponent)!;

      if (!collisionComponent.showDebug || !collisionComponent.boundingBox) continue;

      const box = collisionComponent.boundingBox;
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Create wireframe box
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshBasicMaterial({
        color: collisionComponent.blocking ? 0xff0000 : 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });

      const debugMesh = new THREE.Mesh(geometry, material);
      debugMesh.position.copy(center);

      // Add to scene
      const object3D = entity.getObject3D();
      if (object3D && object3D.parent) {
        object3D.parent.add(debugMesh);
        this.debugMeshes.set(entity.id, debugMesh);
      }
    }
  }

  /**
   * Utility method to check if two bounding boxes intersect
   */
  public static boxesIntersect(box1: THREE.Box3, box2: THREE.Box3): boolean {
    return box1.intersectsBox(box2);
  }

  /**
   * Utility method to check if a point is inside a bounding box
   */
  public static pointInBox(point: THREE.Vector3, box: THREE.Box3): boolean {
    return box.containsPoint(point);
  }
}
