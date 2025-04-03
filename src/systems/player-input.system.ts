import * as THREE from 'three';
import {
  ECSYThreeEntity,
  ECSYThreeSystem,
  MeshTagComponent,
  Object3DComponent,
  WebGLRendererComponent,
} from 'ecsy-three';
import { GameStore } from '@root/stores/game.store';
import { TerrainComponent } from '@root/components/terrain.component';
import { PlayerComponent } from '@root/components/player.component';
import { MovementComponent } from '@root/components/movement.component';

/**
 * System responsible for handling player input and movement
 */
export class PlayerInputSystem extends ECSYThreeSystem {
  private static readonly RAYCASTER = new THREE.Raycaster();
  private static readonly POINTER_DURATION = 1;
  private static readonly POINTER_RADIUS = 0.1;
  private static readonly POINTER_SEGMENTS = 15;
  private static readonly POINTER_COLOR = 0x00ff00;
  private static readonly POINTER_OFFSET = 0.01;

  private clickPointer: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null = null;
  private clickPointerTimer: number = 0;

  static queries = {
    terrain: { components: [TerrainComponent, Object3DComponent, MeshTagComponent] },
    renderer: { components: [WebGLRendererComponent] },
    players: { components: [PlayerComponent, MovementComponent] },
  };

  init(): void {
    window.addEventListener('contextmenu', this.onRightClick.bind(this));
  }

  execute(delta: number, _time: number): void {
    const scene = this.getScene();
    if (!scene || !this.clickPointer) return;

    this.clickPointerTimer -= delta;
    if (this.clickPointerTimer <= 0) {
      this.hideClickPointer(scene);
    } else {
      this.clickPointer.material.opacity = Math.max(
        0,
        this.clickPointerTimer / PlayerInputSystem.POINTER_DURATION
      );
    }
  }

  /**
   * Handles right-click events for player movement
   */
  private onRightClick(e: MouseEvent): void {
    e.preventDefault();

    const playerEntity = this.getCurrentPlayerEntity();
    if (!playerEntity) return;

    const { camera, terrain, scene } = this.getSceneComponents();
    if (!camera || !terrain || !scene) return;

    const intersectionPoint = this.getTerrainIntersection(e, camera, terrain);
    if (!intersectionPoint) return;

    this.updatePlayerMovement(playerEntity, intersectionPoint);
    this.updateClickPointer(scene, intersectionPoint);
  }

  /**
   * Retrieves the current player entity
   */
  private getCurrentPlayerEntity(): ECSYThreeEntity | null {
    const userId = GameStore.getState().user?.id;
    if (!userId) {
      console.warn('No user ID found in game store');
      return null;
    }

    const playerEntityId = GameStore.getState().mappedPlayers[userId];
    if (!playerEntityId) {
      console.warn('No player entity ID found for user:', userId);
      return null;
    }

    const playerEntity = this.queries.players.results.find(
      (entity) => entity.id === playerEntityId
    );
    if (!playerEntity) {
      console.warn('Player entity not found with ID:', playerEntityId);
      return null;
    }

    return playerEntity;
  }

  /**
   * Retrieves the scene from the renderer component
   */
  private getScene(): THREE.Scene | null {
    const rendererComponent =
      this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent);
    return rendererComponent?.scene.getObject3D<THREE.Scene>() ?? null;
  }

  /**
   * Retrieves the camera, terrain, and scene components
   */
  private getSceneComponents(): {
    camera: THREE.PerspectiveCamera | null;
    terrain: THREE.Mesh | null;
    scene: THREE.Scene | null;
  } {
    const rendererComponent =
      this.queries.renderer.results[0]?.getComponent(WebGLRendererComponent);
    const terrainEntity = this.queries.terrain.results[0];

    return {
      camera: rendererComponent?.camera.getObject3D<THREE.PerspectiveCamera>() ?? null,
      terrain: terrainEntity?.getObject3D<THREE.Mesh>() ?? null,
      scene: rendererComponent?.scene.getObject3D<THREE.Scene>() ?? null,
    };
  }

  /**
   * Calculates the intersection point with the terrain
   */
  private getTerrainIntersection(
    event: MouseEvent,
    camera: THREE.PerspectiveCamera,
    terrain: THREE.Mesh
  ): THREE.Vector3 | null {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    PlayerInputSystem.RAYCASTER.setFromCamera(mouse, camera);
    const intersects = PlayerInputSystem.RAYCASTER.intersectObject(terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0;
      return point;
    }

    return null;
  }

  /**
   * Updates the player's movement target
   */
  private updatePlayerMovement(playerEntity: ECSYThreeEntity, targetPosition: THREE.Vector3): void {
    GameStore.update('targetPosition', {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
    });

    const movementComponent = playerEntity.getMutableComponent(MovementComponent);
    if (movementComponent) {
      movementComponent.targetPosition = targetPosition;
      movementComponent.isMoving = true;
    }
  }

  /**
   * Updates the click pointer visualization
   */
  private updateClickPointer(scene: THREE.Scene, position: THREE.Vector3): void {
    this.hideClickPointer(scene);
    this.showClickPointer(scene, position);
  }

  /**
   * Creates and shows the click pointer at the specified position
   */
  private showClickPointer(scene: THREE.Scene, position: THREE.Vector3): void {
    const geometry = new THREE.CircleGeometry(
      PlayerInputSystem.POINTER_RADIUS,
      PlayerInputSystem.POINTER_SEGMENTS
    );
    const material = new THREE.MeshBasicMaterial({
      color: PlayerInputSystem.POINTER_COLOR,
      opacity: 1,
      transparent: true,
      side: 2,
    });

    this.clickPointer = new THREE.Mesh(geometry, material);
    this.clickPointer.position.set(
      position.x,
      position.y + PlayerInputSystem.POINTER_OFFSET,
      position.z
    );
    this.clickPointer.rotation.x = -Math.PI / 2;
    scene.add(this.clickPointer);
    this.clickPointerTimer = PlayerInputSystem.POINTER_DURATION;
  }

  /**
   * Hides and removes the click pointer
   */
  private hideClickPointer(scene: THREE.Scene): void {
    if (this.clickPointer) {
      scene.remove(this.clickPointer);
      this.clickPointer = null;
      this.clickPointerTimer = 0;
    }
  }
}
