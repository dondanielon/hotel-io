import * as THREE from "three/webgpu";

export class GameObject {
  public mesh!: THREE.Mesh | THREE.Group;
  public name = "";

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }
}
