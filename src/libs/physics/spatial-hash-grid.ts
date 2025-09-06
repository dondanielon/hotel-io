import { Collision2DComponent } from "@root/components/collision-2d.component";
import { ECSYThreeEntity } from "ecsy-three";

export class SpatialHashGrid {
  private grid: Map<string, ECSYThreeEntity[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number = 20) {
    this.cellSize = cellSize;
  }

  public insert(entity: ECSYThreeEntity): void {
    const collider = entity.getComponent(Collision2DComponent)!;
    const object = entity.getObject3D()!;
    const pos = object.position;
    const radius = collider.radius || 1;

    const minX = Math.floor((pos.x - radius) / this.cellSize);
    const maxX = Math.floor((pos.x + radius) / this.cellSize);
    const minY = Math.floor((pos.z - radius) / this.cellSize);
    const maxY = Math.floor((pos.z + radius) / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;

        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(entity);
      }
    }
  }

  public getNearbyEntities(entity: ECSYThreeEntity): ECSYThreeEntity[] {
    const collider = entity.getComponent(Collision2DComponent)!;
    const object = entity.getObject3D()!;
    const pos = object.position;
    const radius = collider.radius || 1;

    const minX = Math.floor((pos.x - radius) / this.cellSize);
    const maxX = Math.floor((pos.x + radius) / this.cellSize);
    const minY = Math.floor((pos.z - radius) / this.cellSize);
    const maxY = Math.floor((pos.z + radius) / this.cellSize);

    const nearbyEntities: ECSYThreeEntity[] = [];
    const processedEntities = new Set<ECSYThreeEntity>();

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        const cellEntities = this.grid.get(key) || [];

        for (const otherEntity of cellEntities) {
          if (otherEntity !== entity && !processedEntities.has(otherEntity)) {
            processedEntities.add(otherEntity);
            nearbyEntities.push(otherEntity);
          }
        }
      }
    }

    return nearbyEntities;
  }

  public clear(): void {
    this.grid.clear();
  }

  public getStats(): { totalCells: number; totalEntities: number; avgEntitiesPerCell: number } {
    const totalCells = this.grid.size;
    let totalEntities = 0;

    for (const entities of this.grid.values()) {
      totalEntities += entities.length;
    }

    return {
      totalCells,
      totalEntities,
      avgEntitiesPerCell: totalCells > 0 ? totalEntities / totalCells : 0,
    };
  }
}
