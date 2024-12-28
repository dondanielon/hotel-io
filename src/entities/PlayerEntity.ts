import { AxesHelper, Box3, BoxGeometry, Mesh, MeshToonMaterial } from 'three';
import { PlayerMesh } from '../common/types';
import { DEBUG_AXES_SIZE } from '../common/constants';

export class PlayerEntity {
  public mesh: PlayerMesh;
  public collision: Box3;

  constructor(config: any) {
    const { width, height, position, depth, color, debug } = config;

    const geometry = new BoxGeometry(width, height, depth);
    const material = new MeshToonMaterial({ color });

    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;

    if (debug) {
      this.mesh.add(new AxesHelper(DEBUG_AXES_SIZE));
    }

    this.collision = new Box3().setFromObject(this.mesh);
  }

  update(_delta: number): void {
    this.collision.setFromObject(this.mesh);
  }
}
