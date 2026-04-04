import * as THREE from "three/webgpu";
import { GLTF } from "three/examples/jsm/Addons.js";
import { PLAYER_SPEED } from "@shared/constants";

export class Player {
  public dashDirection: THREE.Vector3 | null;
  public dashTimer: number;
  public id: string;
  public isDashing: boolean;
  public isMoving: boolean;
  public model: GLTF;
  public mesh: THREE.Group;
  public speed: number;
  public targetPosition: THREE.Vector3 | null;

  constructor(model: GLTF, mesh: THREE.Group) {
    this.dashDirection = null;
    this.dashTimer = 0;
    this.id = crypto.randomUUID();
    this.isDashing = false;
    this.isMoving = false;
    this.mesh = mesh;
    this.model = model;
    this.speed = PLAYER_SPEED;
    this.targetPosition = null;

    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.set(20, 0, -20);
    this.mesh.castShadow = true;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }

  public updatePosition(newPosition: THREE.Vector3): void {
    this.mesh.position.copy(newPosition);
  }

  public updateSpeed(newSpeed: number): void {
    this.speed = newSpeed;
  }

  public getWireframe(): THREE.Group {
    const groupMesh = new THREE.Group();
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff6600 });
        const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        wireframeMesh.position.copy(child.position);
        wireframeMesh.rotation.copy(child.rotation);
        wireframeMesh.scale.copy(child.scale);
        groupMesh.add(wireframeMesh);
      }
    });

    groupMesh.visible = false;

    return groupMesh;
  }
}
