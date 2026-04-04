import * as THREE from "three/webgpu";
import { assert, targetsMainCanvas } from "@shared/utils";
import { GameStore, ConsoleStore } from "@shared/stores";
import { Player } from "@objects/player";

import {
  INPUT_POINTER_COLOR,
  INPUT_POINTER_DURATION,
  INPUT_POINTER_OFFSET,
  INPUT_POINTER_RADIUS,
  INPUT_POINTER_SEGMENTS,
  PLAYER_DASH_DELAY,
  PLAYER_DASH_DURATION,
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
    if (!this.clickPointer) return;

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

  private leftClickHandler(event: MouseEvent): void {
    if (!targetsMainCanvas(event.target)) {
      return;
    }
  }

  private rightClickHandler(event: MouseEvent): void {
    try {
      event.preventDefault();
      // Ignore clicks outside the main canvas
      if (!targetsMainCanvas(event.target)) return;
      // If the player is dashing we don't want to allow them to set a new target position until the dash is complete
      if (this.mainPlayer.isDashing) return;

      const intersectionPoint = this.getTerrainIntersection(this.terrain);
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
      // Add click pointer visual
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
    const keyPressed = event.key.toLowerCase();
    const consoleFocused = document.activeElement?.tagName === "WEB-CONSOLE";

    switch (keyPressed) {
      // PLAYER DASH
      case "w": {
        try {
          if (consoleFocused) return;
          // Prevent spamming dash and ensure player can only dash again after the delay
          const lastDashTimestamp = GameStore.getState().lastDashTime;
          if (this.dashCooldownActive(lastDashTimestamp)) return;

          const intersectionPoint = this.getTerrainIntersection(this.terrain);
          assert(intersectionPoint, "intersectionPoint");
          // Calculate dash direction from player to mouse position
          const dashDirection = new THREE.Vector3()
            .subVectors(intersectionPoint, this.mainPlayer.getPosition())
            .normalize();
          // Set up dash properties, clear target position and stop normal movement
          this.mainPlayer.isDashing = true;
          this.mainPlayer.dashDirection = dashDirection;
          this.mainPlayer.dashTimer = PLAYER_DASH_DURATION;
          this.mainPlayer.isMoving = false;
          this.mainPlayer.targetPosition = null;
          // Store the last dash time to enforce delay between dashes
          GameStore.update("lastDashTime", Date.now());
        } catch {} // Silently fail
        return;
      }
      // CONSOLE
      case "`": {
        try {
          event.preventDefault();

          ConsoleStore.update("isOpen", !ConsoleStore.getState().isOpen);

          const container = document.getElementById("web-console-container");
          assert(container, "container", true);

          ConsoleStore.getState().isOpen
            ? container.appendChild(document.createElement("web-console"))
            : (container.innerHTML = "");
        } catch {} // Silently fail
        return;
      }
    }
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

  private getTerrainIntersection(terrain: THREE.Mesh): THREE.Vector3 | null {
    const mouseLocation = GameStore.getState().mouseLocation;

    this.raycaster.setFromCamera(mouseLocation, this.camera);
    const intersects = this.raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0;

      return point;
    }

    return null;
  }

  private dashCooldownActive(timestamp: number): boolean {
    return timestamp > Date.now() - PLAYER_DASH_DELAY;
  }
}
