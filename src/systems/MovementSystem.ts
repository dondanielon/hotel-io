import {
  CircleGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3DEventMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from 'three';

import { PlayerEntity } from '../entities/PlayerEntity';
import { TerrainEntity } from '../entities/TerrainEntity';
import {
  MOVEMENT_SYSTEM_MOUSE_RIGHT_CLICK_EFFECT_DURATON,
  MOVEMENT_SYSTEM_PLAYER_RUNNING_SPEED,
  MOVEMENT_SYSTEM_PLAYER_WALKING_SPEED,
  SYSTEM_DEFAULT_ENTITY_ROTATION,
} from '../common/constants';

export class MovementSystem {
  private mouseRightClick: Vector2;
  private mouseRightClickEffect: Mesh<CircleGeometry, MeshBasicMaterial, Object3DEventMap> | null;
  private mouseRightClickEffectTimer: number;
  private raycaster: Raycaster;
  private targetPosition: Vector3;

  public player: PlayerEntity;

  constructor(
    player: PlayerEntity,

    private scene: Scene,
    private camera: PerspectiveCamera,
    private terrain: TerrainEntity
  ) {
    this.mouseRightClick = new Vector2();
    this.mouseRightClickEffect = null;
    this.mouseRightClickEffectTimer = 0;
    this.raycaster = new Raycaster();
    this.targetPosition = new Vector3();

    this.addEventListeners();

    this.player = player;
  }

  public update(delta: number): void {
    if (this.mouseRightClickEffect) {
      this.mouseRightClickEffectTimer -= delta;
      if (this.mouseRightClickEffectTimer <= 0) {
        this.scene.remove(this.mouseRightClickEffect);
        this.mouseRightClickEffect = null;
      } else {
        this.mouseRightClickEffect.material.opacity = Math.max(
          0,
          this.mouseRightClickEffectTimer / 1
        );
      }
    }

    if (this.player.isMoving) {
      const direction = new Vector3()
        .subVectors(this.targetPosition, this.player.mesh.position)
        .normalize();
      const distance = this.player.speed * delta;
      const step = direction.multiplyScalar(distance); // Calculates displacement based on speed and elapsed time

      if (this.player.mesh.position.distanceTo(this.targetPosition) > distance) {
        if (!this.player.selectedMoveAnimation.isRunning()) {
          this.player.idleAnimation.fadeOut(0.2);
          this.player.selectedMoveAnimation.reset().fadeIn(0.2).play();
        }
        this.player.mesh.position.add(step);
      } else {
        this.player.mesh.position.copy(this.targetPosition);
        this.player.isMoving = false;

        if (this.player.selectedMoveAnimation.isRunning()) {
          this.player.selectedMoveAnimation.fadeOut(0.2);
          this.player.idleAnimation.reset().fadeIn(0.2).play();
        }
      }

      const targetRotation = Math.atan2(direction.x, direction.z);
      const currentRotationY = this.player.mesh.rotation.y;
      let diference = targetRotation - currentRotationY;

      if (diference > Math.PI) diference -= Math.PI * 2;
      if (diference < -Math.PI) diference += Math.PI * 2;

      const smoothAngle = currentRotationY + diference * 10 * delta;

      // this.player.mesh.rotation.y = MathUtils.euclideanModulo(smoothAngle, Math.PI * 2);
      this.player.mesh.rotation.y =
        MathUtils.euclideanModulo(smoothAngle + Math.PI, Math.PI * 2) - Math.PI;
    }

    this.player.boundingBox.setFromObject(this.player.mesh);
    this.player.mixer.update(delta);
  }

  private addEventListeners(): void {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      this.mouseRightClick.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseRightClick.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseRightClick, this.camera);

      const intersects = this.raycaster.intersectObject(this.terrain.mesh);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        if (this.player.mesh.position.distanceTo(point) < 0.2) return;

        this.targetPosition.copy(point);
        this.player.isMoving = true;

        if (this.mouseRightClickEffect) {
          this.scene.remove(this.mouseRightClickEffect);
        }

        const geometry = new CircleGeometry(0.1, 15);
        const material = new MeshBasicMaterial({
          color: 0xff0000,
          opacity: 1,
          transparent: true,
        });

        this.mouseRightClickEffect = new Mesh(geometry, material);
        this.mouseRightClickEffect.position.set(point.x, 0 + 0.01, point.z);
        this.mouseRightClickEffect.rotation.x = SYSTEM_DEFAULT_ENTITY_ROTATION;
        this.scene.add(this.mouseRightClickEffect);

        this.mouseRightClickEffectTimer = MOVEMENT_SYSTEM_MOUSE_RIGHT_CLICK_EFFECT_DURATON;
      }
    });

    window.addEventListener('keypress', (e) => {
      if (this.player.isMoving) {
        if (e.key.toLowerCase() === ' ') {
          // TODO: Handle jump
        }

        return;
      }

      if (e.key.toLowerCase() === 'c') {
        const toggle = !this.player.toggleRun;
        if (toggle) {
          this.player.selectedMoveAnimation = this.player.runAnimation;
          this.player.speed = MOVEMENT_SYSTEM_PLAYER_RUNNING_SPEED;
        } else {
          this.player.selectedMoveAnimation = this.player.walkAnimation;
          this.player.speed = MOVEMENT_SYSTEM_PLAYER_WALKING_SPEED;
        }

        this.player.toggleRun = !this.player.toggleRun;
      }
    });
  }
}
