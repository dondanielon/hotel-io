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

const raycaster = new THREE.Raycaster();

export class PlayerInputSystem extends ECSYThreeSystem {
  private clickPointerTimer: number = 0;
  private clickPointer: THREE.Mesh<
    THREE.CircleGeometry,
    THREE.MeshBasicMaterial,
    THREE.Object3DEventMap
  > | null = null;
  static queries = {
    terrain: { components: [TerrainComponent, Object3DComponent, MeshTagComponent] },
    renderer: { components: [WebGLRendererComponent] },
    players: { components: [PlayerComponent, MovementComponent] },
  };

  init(): void {
    window.addEventListener('contextmenu', this.onRightClick.bind(this));
  }

  execute(delta: number, _time: number): void {
    const rendererComponent = this.queries.renderer.results[0].getComponent(WebGLRendererComponent);
    const scene = rendererComponent?.scene.getObject3D<THREE.Scene>();

    if (this.clickPointer && scene) {
      this.clickPointerTimer -= delta;
      if (this.clickPointerTimer <= 0) {
        scene.remove(this.clickPointer);
        this.clickPointer = null;
      } else {
        this.clickPointer.material.opacity = Math.max(0, this.clickPointerTimer / 1);
      }
    }
  }

  private onRightClick(e: MouseEvent): void {
    e.preventDefault();

    const user = GameStore.getState().user;

    if (!user) return;

    const playerEntityId = GameStore.getState().mappedPlayers[user.id];
    const playerEntity = this.queries.players.results.find((x) => x.id === playerEntityId);

    if (!playerEntity) return;

    const rendererComponent = this.queries.renderer.results[0].getComponent(WebGLRendererComponent);
    const terrainEntity = this.queries.terrain.results[0];

    const scene = rendererComponent?.scene.getObject3D<THREE.Scene>();
    const camera = rendererComponent?.camera.getObject3D<THREE.PerspectiveCamera>();
    const terrain = terrainEntity.getObject3D<THREE.Mesh>();

    if (!camera || !terrain || !scene) return;

    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y = 0;

      GameStore.update('targetPosition', { x: point.x, y: point.y, z: point.z });

      const movementComponent = playerEntity.getMutableComponent(MovementComponent)!;
      movementComponent.targetPosition = point;
      movementComponent.isMoving = true;

      if (this.clickPointer) {
        scene.remove(this.clickPointer);
      }

      const geometry = new THREE.CircleGeometry(0.1, 15);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 1,
        transparent: true,
        side: 2,
      });

      this.clickPointer = new THREE.Mesh(geometry, material);
      this.clickPointer.position.set(point.x, 0 + 0.01, point.z);
      this.clickPointer.rotation.x = -Math.PI / 2;
      scene.add(this.clickPointer);

      this.clickPointerTimer = 1;
    }
  }
}
