import * as THREE from 'three';
import {
  ECSYThreeSystem,
  MeshTagComponent,
  Object3DComponent,
  WebGLRendererComponent,
} from 'ecsy-three';
import { GameStore } from '@root/stores/game.store';
import { TerrainComponent } from '@root/components/terrain.component';
import { PlayerComponent } from '@root/components/player.component';
import { MovementComponent } from '@root/components/movement.component';
import { Constants } from '@root/constants';
import { GameUtils } from '@root/utils/game.utils';

/**
 * System responsible for handling player input and movement
 */
export class PlayerInputSystem extends ECSYThreeSystem {
  private clickPointer: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null = null;
  private clickPointerTimer: number = 0;
  private raycaster = new THREE.Raycaster();

  static queries = {
    terrain: { components: [TerrainComponent, Object3DComponent, MeshTagComponent] },
    renderer: { components: [WebGLRendererComponent] },
    players: { components: [PlayerComponent, MovementComponent] },
  };

  init(): void {
    window.addEventListener('contextmenu', this.onRightClick.bind(this));
    window.addEventListener('keypress', this.onKeyDown.bind(this));
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
      const opacity = Math.max(0, this.clickPointerTimer / Constants.POINTER_DURATION);
      this.clickPointer.material.opacity = opacity;
    }
  }

  private onRightClick(e: MouseEvent): void {
    e.preventDefault();

    const playerEntityId = GameUtils.getMainPlayerEntityId();
    const playerEntity = this.queries.players.results.find(
      (entity) => entity.id === playerEntityId
    );

    if (!playerEntity) {
      console.warn('Main player entity not found');
      return;
    }

    const { camera, terrain, scene } = this.getSceneElements();
    const intersectionPoint = this.getTerrainIntersection(camera, terrain);
    if (!intersectionPoint) return; // Clicked outside of the terrain

    GameStore.update('targetPosition', intersectionPoint);

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

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case 'w': {
        const playerEntityId = GameUtils.getMainPlayerEntityId();
        const playerEntity = this.queries.players.results.find(
          (entity) => entity.id === playerEntityId
        );

        if (!playerEntity) {
          console.warn('Main player entity not found');
          return;
        }

        const { camera, terrain, scene } = this.getSceneElements();
        const mouseLocation = GameStore.getState().mouseLocation;
        this.raycaster.setFromCamera(mouseLocation, camera);
        const intersects = this.raycaster.intersectObject(terrain);

        if (intersects.length > 0) {
          const playerMesh = playerEntity.getObject3D<THREE.Mesh>()!;
          const movementComponent = playerEntity.getMutableComponent(MovementComponent)!;

          // Calculate dash direction from player to mouse position
          const mousePoint = intersects[0].point;
          const dashDirection = new THREE.Vector3()
            .subVectors(mousePoint, playerMesh.position)
            .normalize();

          // Set up dash properties
          movementComponent.isDashing = true;
          movementComponent.dashDirection = dashDirection;
          movementComponent.dashTimer = Constants.PLAYER_DASH_DURATION;

          // Clear target position and stop normal movement
          // movementComponent.isMoving = false;
          // movementComponent.targetPosition = null;
          // GameStore.update('targetPosition', null);
        }
        break;
      }
    }
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
    terrain: THREE.Mesh
  ): THREE.Vector3 | null {
    const mouseLocation = GameStore.getState().mouseLocation;
    this.raycaster.setFromCamera(mouseLocation, camera);
    const intersects = this.raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0;
      return point;
    }

    return null;
  }

  private addClickPointer(scene: THREE.Scene, position: THREE.Vector3): void {
    const geometry = new THREE.CircleGeometry(Constants.POINTER_RADIUS, Constants.POINTER_SEGMENTS);
    const material = new THREE.MeshBasicMaterial({
      color: Constants.POINTER_COLOR,
      opacity: 1,
      transparent: true,
      side: 2,
    });

    this.clickPointerTimer = Constants.POINTER_DURATION;
    this.clickPointer = new THREE.Mesh(geometry, material);
    this.clickPointer.position.set(position.x, position.y + Constants.POINTER_OFFSET, position.z);
    this.clickPointer.rotation.x = -Math.PI / 2;

    scene.add(this.clickPointer);
  }
}
