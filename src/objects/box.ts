import * as THREE from "three/webgpu";
import { GameObject } from "@objects/game-object";

export class Box extends GameObject {
  public geometry: THREE.BoxGeometry;
  public material: THREE.Material;

  constructor(geometryData?: { width?: number; height?: number; depth?: number }, material?: THREE.Material) {
    super();
    this.geometry = new THREE.BoxGeometry(
      geometryData?.width ?? 1,
      geometryData?.height ?? 1,
      geometryData?.depth ?? 1,
    );
    this.material = material ?? new THREE.MeshToonMaterial({ color: 0x58a6ff });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.castShadow = true;
  }
}
