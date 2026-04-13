import * as THREE from "three/webgpu";

export class EditorManager {
  private selectedObject: THREE.Object3D | null = null;
  private selectionHelper: THREE.BoxHelper | null = null;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    private terrain: THREE.Mesh,
  ) {}

  public update(_delta: number, _elapsed: number): void {
    // Reserved for future preview/animation updates
  }

  public handleLeftClick(
    event: MouseEvent,
    raycaster: THREE.Raycaster,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    terrain: THREE.Mesh,
  ): void {
    try {
      // Use mouse position from global store via raycaster origin (caller already set mouse via GameStore)
      raycaster.setFromCamera((<any>window).mouseLocation || new THREE.Vector2(), camera);

      // First, check for objects selectable in the scene (exclude terrain)
      const selectableObjects = scene.children.filter((c) => c !== terrain && c.type !== "PerspectiveCamera");
      const intersects = raycaster.intersectObjects(selectableObjects, true);

      if (intersects.length > 0) {
        const picked = intersects[0].object;

        // If clicked on already selected object, deselect
        if (this.selectedObject === picked) {
          this.clearSelection();
          return;
        }

        // Select the picked object
        this.selectObject(picked);
        return;
      }

      // If no object picked, check terrain intersection to place or move object
      const terrainIntersects = raycaster.intersectObject(terrain);
      if (terrainIntersects.length > 0) {
        const point = terrainIntersects[0].point;

        if (this.selectedObject) {
          // Move selected object to clicked point
          this.selectedObject.position.set(point.x, 0, point.z);
          this.clearSelection();
        } else {
          // Create a simple box as a new object and mark selectable
          const geom = new THREE.BoxGeometry(1, 1, 1);
          const mat = new THREE.MeshStandardMaterial({ color: 0x8fbcd4 });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(point.x, 0.5, point.z);
          // Mark as selectable
          (mesh as any).userData.selectable = true;
          scene.add(mesh);
        }
      }
    } catch (e) {
      // Fail silently for editor clicks
    }
  }

  private selectObject(obj: THREE.Object3D): void {
    this.clearSelection();
    this.selectedObject = obj;
    try {
      this.selectionHelper = new THREE.BoxHelper(this.selectedObject, 0xffff00);
      this.scene.add(this.selectionHelper);
    } catch (e) {
      this.selectionHelper = null;
    }
  }

  private clearSelection(): void {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper = null;
    }
    this.selectedObject = null;
  }
}
