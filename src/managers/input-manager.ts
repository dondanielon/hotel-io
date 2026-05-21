import * as THREE from "three/webgpu";
import { assert, removeObjectContextMenuIfPresent, targetsMainCanvas, removeOrAppendConsole } from "@shared/utils";
import { GameStore } from "@shared/stores";
import { Player } from "@objects/player";
import { ContextMenuAction, UIObjectContextMenu } from "@ui/object-context-menu";
import { Action, KeyPressed } from "@shared/enums";

import {
  INPUT_POINTER_COLOR,
  INPUT_POINTER_DURATION,
  INPUT_POINTER_OFFSET,
  INPUT_POINTER_RADIUS,
  INPUT_POINTER_SEGMENTS,
  PLAYER_DASH_DELAY,
  PLAYER_DASH_DURATION,
  UI_CONSOLE_TAG_NAME,
  UI_OBJECT_CONTEXT_MENU_TAG_NAME,
} from "@root/shared/constants";

export class InputManager {
  private clickPointer: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null;
  private clickPointerTimer: number;
  private raycaster: THREE.Raycaster;

  constructor(
    private renderer: THREE.WebGPURenderer,
    private camera: THREE.PerspectiveCamera,
    private scene: THREE.Scene,
    private mainPlayer: Player,
    private terrain: THREE.Mesh,
  ) {
    this.clickPointer = null;
    this.clickPointerTimer = 0;
    this.raycaster = new THREE.Raycaster();

    window.addEventListener("click", this.leftClickHandler.bind(this));
    window.addEventListener("contextmenu", this.rightClickHandler.bind(this));
    window.addEventListener("keypress", this.keyPressHandler.bind(this));
    window.addEventListener("mousemove", this.mouseMoveHandler.bind(this));
    window.addEventListener("resize", this.resizeHandler.bind(this));
  }

  public update(delta: number, _elapsed: number): void {
    this.handleClickPointer(delta);
    this.handleObjectEditorLocation();
  }

  private leftClickHandler(event: MouseEvent): void {
    try {
      // Ignore clicks outside the main canvas
      if (!targetsMainCanvas(event.target)) return;
      // Ignore clicks if main player is in movement
      if (this.mainPlayer.isMoving || this.mainPlayer.isDashing) return;

      const currAction = GameStore.getState().action;

      if (currAction === Action.Default) {
        const sceneIntersectionPoint = this.getSceneIntersection();
        assert(sceneIntersectionPoint, "sceneIntersectionPoint");

        const objectContextMenu = document.createElement(UI_OBJECT_CONTEXT_MENU_TAG_NAME) as UIObjectContextMenu;
        objectContextMenu.setPosition(event.clientX, event.clientY);
        objectContextMenu.onAction((action: ContextMenuAction) => {
          console.log("Action:", action, "on object:", sceneIntersectionPoint.object);
          // handle actions here
        });
        document.body.appendChild(objectContextMenu);
      }

      if (currAction === Action.EditorPlacingItem) {
        GameStore.update("objectToPlace", null);
        GameStore.update("action", Action.Default);
      }
    } catch {} // Silently fail
    return;
  }

  private rightClickHandler(event: MouseEvent): void {
    try {
      event.preventDefault();
      // Ignore clicks outside the main canvas
      if (!targetsMainCanvas(event.target)) return;
      // Don't allow to set a new target position until the dash is complete
      if (this.mainPlayer.isDashing) return;

      removeObjectContextMenuIfPresent();

      const intersectionPoint = this.getTerrainIntersection();
      assert(intersectionPoint, "intersectionPoint");

      this.mainPlayer.targetPosition = intersectionPoint;
      this.mainPlayer.isMoving = true;

      // Clean up previous click indicator before placing a new one
      if (this.clickPointer) {
        this.clickPointer.clear();
        this.scene.remove(this.clickPointer);
        this.clickPointer = null;
        this.clickPointerTimer = 0;
      }

      const geometry = new THREE.CircleGeometry(INPUT_POINTER_RADIUS, INPUT_POINTER_SEGMENTS);
      const material = new THREE.MeshBasicMaterial({
        color: INPUT_POINTER_COLOR,
        opacity: 1,
        transparent: true,
        side: 2,
      });
      this.clickPointerTimer = INPUT_POINTER_DURATION;
      this.clickPointer = new THREE.Mesh(geometry, material);
      this.clickPointer.rotation.x = -Math.PI / 2;
      this.clickPointer.position.set(
        intersectionPoint.x,
        intersectionPoint.y + INPUT_POINTER_OFFSET,
        intersectionPoint.z,
      );

      this.scene.add(this.clickPointer);
    } catch {} // Silently fail
    return;
  }

  private keyPressHandler(event: KeyboardEvent): void {
    try {
      const keyPressed = event.key.toLowerCase() as KeyPressed;
      const consoleFocused = document.activeElement?.tagName === UI_CONSOLE_TAG_NAME.toUpperCase();

      if (keyPressed === KeyPressed.Console) {
        event.preventDefault();
        removeOrAppendConsole();
        return;
      }

      if (GameStore.getState().action !== Action.Default) return;

      if (keyPressed === KeyPressed.PlayerDash) {
        if (consoleFocused) return;
        removeObjectContextMenuIfPresent();

        // Prevent spamming dash and ensure player can only dash again after the delay
        if (this.dashCooldownActive(GameStore.getState().lastDashTime)) return;

        const intersectionPoint = this.getTerrainIntersection();
        assert(intersectionPoint, "intersectionPoint");

        const dashDirection = new THREE.Vector3()
          .subVectors(intersectionPoint, this.mainPlayer.getPosition())
          .normalize();
        // Set up dash properties, clear target position and stop normal movement
        this.mainPlayer.isDashing = true;
        this.mainPlayer.dashDirection = dashDirection;
        this.mainPlayer.dashTimer = PLAYER_DASH_DURATION;
        this.mainPlayer.isMoving = false;
        this.mainPlayer.targetPosition = null;

        GameStore.update("lastDashTime", Date.now());
        return;
      }
    } catch {} // Silently fail
  }

  private resizeHandler(_event: UIEvent): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  private mouseMoveHandler(event: MouseEvent): void {
    const positionX = (event.clientX / window.innerWidth) * 2 - 1;
    const positionY = -(event.clientY / window.innerHeight) * 2 + 1;

    const mouseVec = new THREE.Vector2(positionX, positionY);
    // Update global store and expose to window for editor raycasting convenience
    GameStore.update("mouseLocation", mouseVec);
    (window as any).mouseLocation = mouseVec;
  }

  private getTerrainIntersection(): THREE.Vector3 | null {
    const mouseLocation = GameStore.getState().mouseLocation;

    this.raycaster.setFromCamera(mouseLocation, this.camera);
    const intersects = this.raycaster.intersectObject(this.terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0; // Set Y to 0 just to avoid issues :D
      return point;
    }

    return null;
  }

  private getSceneIntersection(): THREE.Intersection | null {
    const mouseLocation = GameStore.getState().mouseLocation;
    this.raycaster.setFromCamera(mouseLocation, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    return intersects.find((i) => i.object !== this.terrain && i.object !== this.clickPointer) ?? null;
  }

  private dashCooldownActive(timestamp: number): boolean {
    return timestamp > Date.now() - PLAYER_DASH_DELAY;
  }

  private handleClickPointer(delta: number): void {
    if (this.clickPointer) {
      this.clickPointerTimer -= delta;

      if (this.clickPointerTimer <= 0) {
        this.clickPointer.clear();
        this.scene.remove(this.clickPointer);
        this.clickPointer = null;
        this.clickPointerTimer = 0;
      } else {
        const opacity = Math.max(0, this.clickPointerTimer / INPUT_POINTER_DURATION);
        this.clickPointer.material.opacity = opacity;
      }
    }
  }

  private handleObjectEditorLocation(): void {
    try {
      const { objectToPlace, action } = GameStore.getState();
      if (objectToPlace && action === Action.EditorPlacingItem) {
        const intersectionPoint = this.getTerrainIntersection();
        assert(intersectionPoint, "intersectionPoint");

        objectToPlace.mesh.position.copy(intersectionPoint);
        objectToPlace.mesh.position.y = 1;
      }
    } catch {} // Silently fail
    return;
  }
}
