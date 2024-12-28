import { Box3, Mesh, MeshToonMaterial, PlaneGeometry } from 'three';
import { TerrainMesh } from '../common/types';

export class TerrainEntity {
  public mesh: TerrainMesh;
  public collision: Box3;

  constructor(config: any) {
    const { width, height, color, rotation } = config;

    const geometry = new PlaneGeometry(width, height);
    const material = new MeshToonMaterial({ color });

    this.mesh = new Mesh(geometry, material);
    this.mesh.rotation.x = rotation;
    this.mesh.receiveShadow = true;

    this.collision = new Box3().setFromObject(this.mesh);
  }
}
