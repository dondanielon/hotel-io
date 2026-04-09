import * as THREE from "three/webgpu";
import { GameObject } from "@objects/game-object";

export class Cylinder extends GameObject {
  public geometry: THREE.CylinderGeometry;
  public material: THREE.Material;

  constructor(
    geometryData?: {
      radiusTop?: number;
      radiusBottom?: number;
      height?: number;
      radialSegments?: number;
    },
    material?: THREE.Material,
  ) {
    super();
    this.geometry = new THREE.CylinderGeometry(
      geometryData?.radiusTop ?? 0.5,
      geometryData?.radiusBottom ?? 0.5,
      geometryData?.height ?? 1,
      geometryData?.radialSegments ?? 32,
    );
    this.material = material ?? new THREE.MeshToonMaterial({ color: 0x58a6ff });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.castShadow = true;
  }
}
