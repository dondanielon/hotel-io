import * as THREE from "three";
import { ECSYThreeSystem, MeshTagComponent, Object3DComponent, WebGLRendererComponent } from "ecsy-three";
import { GameStore } from "@root/shared/stores/game.store";
import { TerrainComponent } from "@root/components/terrain.component";
import { PlayerComponent } from "@root/components/player.component";
import { MovementComponent } from "@root/components/movement.component";
import { InputConstants } from "@shared/constants/input.constants";
import { PlayerConstants } from "@root/shared/constants/player.constants";

/**
 * System responsible for handling player input and movement
 */
export class PlayerInputSystem extends ECSYThreeSystem {
  private clickPointer: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null = null;
  private clickPointerTimer: number = 0;
  private dashDelay = 500;
  private raycaster = new THREE.Raycaster();

  static queries = {
    terrain: {
      components: [TerrainComponent, Object3DComponent, MeshTagComponent],
    },
    renderer: { components: [WebGLRendererComponent] },
    players: { components: [MovementComponent] },
  };

  init(): void {
    window.addEventListener("contextmenu", this.onRightClick.bind(this));
    window.addEventListener("keypress", this.onKeyDown.bind(this));
    window.addEventListener("touchstart", this.onTouchStart.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  execute(delta: number, _time: number): void {
    if (!this.clickPointer) return;

    this.clickPointerTimer -= delta;
    const scene = this.queries.renderer.results[0]
      ?.getComponent(WebGLRendererComponent)!
      .scene.getObject3D<THREE.Scene>()!;

    if (this.clickPointerTimer <= 0) {
      scene.remove(this.clickPointer);
      this.clickPointer = null;
      this.clickPointerTimer = 0;
    } else {
      const opacity = Math.max(0, this.clickPointerTimer / InputConstants.POINTER_DURATION);
      this.clickPointer.material.opacity = opacity;
    }
  }

  private onRightClick(e: MouseEvent): void {
    e.preventDefault();

    const playerEntity = GameStore.getState().playerEntity;
    const wireframeEntity = GameStore.getState().playerWireframe;
    if (!playerEntity || !wireframeEntity) {
      console.warn("Main player entity not found");
      return;
    }

    const { camera, terrain, scene } = this.getSceneElements();
    const mouseLocation = GameStore.getState().mouseLocation;

    const intersectionPoint = this.getTerrainIntersection(camera, terrain, mouseLocation);
    if (!intersectionPoint) return; // Clicked outside of the terrain

    // const playerMesh = playerEntity.getObject3D<THREE.Mesh>()!;
    // if (playerMesh.position.distanceTo(intersectionPoint) < 0.45) return;

    const movementComponent = playerEntity.getMutableComponent(MovementComponent)!;
    movementComponent.targetPosition = intersectionPoint;
    movementComponent.isMoving = true;
    movementComponent.isDashing = false;
    movementComponent.dashDirection = null;
    movementComponent.dashTimer = 0;

    const wireframeMovementComponent = wireframeEntity.getMutableComponent(MovementComponent)!;
    wireframeMovementComponent.targetPosition = intersectionPoint;
    wireframeMovementComponent.isMoving = true;
    wireframeMovementComponent.isDashing = false;
    wireframeMovementComponent.dashDirection = null;
    wireframeMovementComponent.dashTimer = 0;

    if (this.clickPointer) {
      scene.remove(this.clickPointer);
      this.clickPointer = null;
      this.clickPointerTimer = 0;
    }

    this.addClickPointer(scene, intersectionPoint);
  }

  private onKeyDown(event: KeyboardEvent): void {
    console.log(event.key.toLowerCase());
    switch (event.key.toLowerCase()) {
      case "w": {
        const lastDashTime = GameStore.getState().lastDashTime;
        if (lastDashTime > Date.now() - this.dashDelay) return;

        const playerEntity = GameStore.getState().playerEntity;
        const wireframeEntity = GameStore.getState().playerWireframe;
        if (!playerEntity || !wireframeEntity) {
          console.warn("Main player entity not found");
          return;
        }

        const { camera, terrain, scene } = this.getSceneElements();
        const mouseLocation = GameStore.getState().mouseLocation;
        const intersectionPoint = this.getTerrainIntersection(camera, terrain, mouseLocation);

        if (!intersectionPoint) return;

        const playerMesh = playerEntity.getObject3D<THREE.Mesh>()!;
        const movementComponent = playerEntity.getMutableComponent(MovementComponent)!;
        const wireframeMovementComponent = wireframeEntity.getMutableComponent(MovementComponent)!;

        // Calculate dash direction from player to mouse position
        const dashDirection = new THREE.Vector3().subVectors(intersectionPoint, playerMesh.position).normalize();

        // Set up dash properties
        movementComponent.isDashing = true;
        movementComponent.dashDirection = dashDirection;
        movementComponent.dashTimer = PlayerConstants.DASH_DURATION;
        wireframeMovementComponent.isDashing = true;
        wireframeMovementComponent.dashDirection = dashDirection;
        wireframeMovementComponent.dashTimer = PlayerConstants.DASH_DURATION;

        // Clear target position and stop normal movement
        movementComponent.isMoving = false;
        movementComponent.targetPosition = null;
        wireframeMovementComponent.isMoving = false;
        wireframeMovementComponent.targetPosition = null;
        GameStore.update("lastDashTime", Date.now());

        if (this.clickPointer) {
          scene.remove(this.clickPointer);
          this.clickPointer = null;
          this.clickPointerTimer = 0;
        }

        this.addClickPointer(scene, intersectionPoint);
        break;
      }
      case "`": {
        // open console
        break;
      }
      // For now I will use this key for toggle the wireframe and axes helper on objects
      case "+": {
        // This is only working with the main character wireframe for now
        // TODO: Let's add something to handle the wireframe on other objects
        const wireframeEntity = GameStore.getState().playerWireframe;
        if (!wireframeEntity) break;

        const wireframeMesh = wireframeEntity.getObject3D<THREE.Mesh>()!;
        wireframeMesh.visible = !wireframeMesh.visible;

        const axesGroup = GameStore.getState().playerAxes;
        if (axesGroup) {
          axesGroup.visible = !axesGroup.visible;
        }

        break;
      }
    }
  }

  private onTouchStart(event: TouchEvent): void {
    const playerEntity = GameStore.getState().playerEntity;
    if (!playerEntity) {
      console.warn("Main player entity not found");
      return;
    }

    const { camera, terrain, scene } = this.getSceneElements();
    const positionX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    const positionY = (event.touches[0].clientY / window.innerHeight) * 2 - 1;
    const fingerLocation = new THREE.Vector2(positionX, positionY);
    const intersectionPoint = this.getTerrainIntersection(camera, terrain, fingerLocation);
    if (!intersectionPoint) return; // Clicked outside of the terrain

    const movementComponent = playerEntity.getMutableComponent(MovementComponent)!;
    movementComponent.targetPosition = intersectionPoint;
    movementComponent.isMoving = true;

    if (this.clickPointer) {
      scene.remove(this.clickPointer);
      this.clickPointer = null;
      this.clickPointerTimer = 0;
    }

    this.addClickPointer(scene, intersectionPoint);
  }

  private onTouchMove(event: TouchEvent): void {
    console.info("on touch move not implemented", event.touches.length);
  }

  private onTouchEnd(event: TouchEvent): void {
    console.info("on touch end not implemented", event.touches.length);
  }

  private getSceneElements(): {
    camera: THREE.PerspectiveCamera;
    terrain: THREE.Mesh;
    scene: THREE.Scene;
  } {
    const renderer = this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent)!;
    const terrainEntity = this.queries.terrain.results[0];

    return {
      camera: renderer.camera.getObject3D<THREE.PerspectiveCamera>()!,
      terrain: terrainEntity?.getObject3D<THREE.Mesh>()!,
      scene: renderer.scene.getObject3D<THREE.Scene>()!,
    };
  }

  private getTerrainIntersection(
    camera: THREE.PerspectiveCamera,
    terrain: THREE.Mesh,
    location: THREE.Vector2,
  ): THREE.Vector3 | null {
    this.raycaster.setFromCamera(location, camera);
    const intersects = this.raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0;
      return point;
    }

    return null;
  }

  private addClickPointer(scene: THREE.Scene, position: THREE.Vector3): void {
    const geometry = new THREE.CircleGeometry(InputConstants.POINTER_RADIUS, InputConstants.POINTER_SEGMENTS);
    const material = new THREE.MeshBasicMaterial({
      color: InputConstants.POINTER_COLOR,
      opacity: 1,
      transparent: true,
      side: 2,
    });

    this.clickPointerTimer = InputConstants.POINTER_DURATION;
    this.clickPointer = new THREE.Mesh(geometry, material);
    this.clickPointer.position.set(position.x, position.y + InputConstants.POINTER_OFFSET, position.z);
    this.clickPointer.rotation.x = -Math.PI / 2;

    scene.add(this.clickPointer);
  }
}
