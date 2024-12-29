import { Box3, Color, Mesh, MeshToonMaterial, RepeatWrapping, Shape, ShapeGeometry, TextureLoader } from 'three';
import { TerrainMesh } from '../common/types';

export class TerrainEntity {
  public mesh: TerrainMesh;
  public collision: Box3;

  constructor(config: any) {
    const textureLoader = new TextureLoader();
    const woodFloorTexture = textureLoader.load('/textures/hardwood.jpg');
    woodFloorTexture.wrapS = RepeatWrapping;
    woodFloorTexture.wrapT = RepeatWrapping;
    woodFloorTexture.repeat.set(1, 1);

    const shape = new Shape(config.points);
    const geometry = new ShapeGeometry(shape);
    const material = new MeshToonMaterial({ map: woodFloorTexture, side: 2, color: new Color(0xffffff) });

    this.mesh = new Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.rotation.x = config.rotation;

    this.collision = new Box3().setFromObject(this.mesh);
  }
}
