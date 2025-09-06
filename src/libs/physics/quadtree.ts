// import { ECSYThreeEntity } from "ecsy-three";

// /**
//  * Bounds interface for spatial partitioning
//  */
// export interface Bounds {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// /**
//  * Quadtree implementation for efficient 2D collision detection
//  * Better for clustered entities and non-uniform distributions
//  */
// export class QuadtreeNode {
//   bounds: Bounds;
//   entities: ECSYThreeEntity[] = [];
//   children: QuadtreeNode[] = [];
//   maxEntities: number;
//   maxDepth: number;
//   depth: number;

//   constructor(bounds: Bounds, maxEntities: number = 4, maxDepth: number = 8, depth: number = 0) {
//     this.bounds = bounds;
//     this.maxEntities = maxEntities;
//     this.maxDepth = maxDepth;
//     this.depth = depth;
//   }

//   insert(entity: ECSYThreeEntity): boolean {
//     if (!this.containsEntity(entity)) return false;

//     if (this.children.length === 0 && (this.entities.length < this.maxEntities || this.depth >= this.maxDepth)) {
//       this.entities.push(entity);
//       return true;
//     }

//     if (this.children.length === 0) {
//       this.subdivide();
//     }

//     for (const child of this.children) {
//       if (child.insert(entity)) return true;
//     }

//     this.entities.push(entity);
//     return true;
//   }

//   query(bounds: Bounds): ECSYThreeEntity[] {
//     const result: ECSYThreeEntity[] = [];

//     if (!this.intersects(bounds)) return result;

//     for (const entity of this.entities) {
//       if (this.entityIntersectsBounds(entity, bounds)) {
//         result.push(entity);
//       }
//     }

//     for (const child of this.children) {
//       result.push(...child.query(bounds));
//     }

//     return result;
//   }

//   clear(): void {
//     this.entities = [];
//     for (const child of this.children) {
//       child.clear();
//     }
//     this.children = [];
//   }

//   getStats(): { totalNodes: number; totalEntities: number; maxDepth: number; avgEntitiesPerNode: number } {
//     let totalNodes = 1; // Count this node
//     let totalEntities = this.entities.length;
//     let maxDepth = this.depth;

//     for (const child of this.children) {
//       const childStats = child.getStats();
//       totalNodes += childStats.totalNodes;
//       totalEntities += childStats.totalEntities;
//       maxDepth = Math.max(maxDepth, childStats.maxDepth);
//     }

//     return {
//       totalNodes,
//       totalEntities,
//       maxDepth,
//       avgEntitiesPerNode: totalNodes > 0 ? totalEntities / totalNodes : 0,
//     };
//   }

//   private containsEntity(entity: ECSYThreeEntity): boolean {
//     const collider = entity.getComponent("Collision2DComponent" as any)!;
//     const object = entity.getObject3D()!;
//     const pos = object.position;

//     const radius = collider.radius || 1;
//     return (
//       pos.x - radius >= this.bounds.x &&
//       pos.x + radius <= this.bounds.x + this.bounds.width &&
//       pos.z - radius >= this.bounds.y &&
//       pos.z + radius <= this.bounds.y + this.bounds.height
//     );
//   }

//   private subdivide(): void {
//     const halfWidth = this.bounds.width / 2;
//     const halfHeight = this.bounds.height / 2;

//     this.children = [
//       new QuadtreeNode(
//         { x: this.bounds.x, y: this.bounds.y, width: halfWidth, height: halfHeight },
//         this.maxEntities,
//         this.maxDepth,
//         this.depth + 1,
//       ),
//       new QuadtreeNode(
//         { x: this.bounds.x + halfWidth, y: this.bounds.y, width: halfWidth, height: halfHeight },
//         this.maxEntities,
//         this.maxDepth,
//         this.depth + 1,
//       ),
//       new QuadtreeNode(
//         { x: this.bounds.x, y: this.bounds.y + halfHeight, width: halfWidth, height: halfHeight },
//         this.maxEntities,
//         this.maxDepth,
//         this.depth + 1,
//       ),
//       new QuadtreeNode(
//         { x: this.bounds.x + halfWidth, y: this.bounds.y + halfHeight, width: halfWidth, height: halfHeight },
//         this.maxEntities,
//         this.maxDepth,
//         this.depth + 1,
//       ),
//     ];
//   }

//   private intersects(bounds: Bounds): boolean {
//     return !(
//       bounds.x > this.bounds.x + this.bounds.width ||
//       bounds.x + bounds.width < this.bounds.x ||
//       bounds.y > this.bounds.y + this.bounds.height ||
//       bounds.y + bounds.height < this.bounds.y
//     );
//   }

//   private entityIntersectsBounds(entity: ECSYThreeEntity, bounds: Bounds): boolean {
//     const collider = entity.getComponent("Collision2DComponent")!;
//     const object = entity.getObject3D()!;
//     const pos = object.position;
//     const radius = collider.radius || 1;

//     return !(
//       pos.x + radius < bounds.x ||
//       pos.x - radius > bounds.x + bounds.width ||
//       pos.z + radius < bounds.y ||
//       pos.z - radius > bounds.y + bounds.height
//     );
//   }
// }
