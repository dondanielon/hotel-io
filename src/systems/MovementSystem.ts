import { PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';

import { PlayerEntity } from '../entities/PlayerEntity';
import { TerrainEntity } from '../entities/TerrainEntity';
import { MOVEMENT_SYSTEM_PLAYER_SPEED } from '../common/constants';

export class MovementSystem {
  private mouseRightClick: Vector2;
  private raycaster: Raycaster;
  private runAnimationWeight: number;
  private targetPosition: Vector3;
  private targetRotationY: number;

  public player: PlayerEntity;

  constructor(
    player: PlayerEntity,

    private camera: PerspectiveCamera,
    private terrain: TerrainEntity
  ) {
    this.mouseRightClick = new Vector2();
    this.raycaster = new Raycaster();
    this.targetPosition = new Vector3();
    this.targetRotationY = 0;
    this.runAnimationWeight = 0;

    this.addEventListeners();

    this.player = player;
  }

  public update(delta: number): void {
    if (this.player.isMoving) {
      const direction = new Vector3()
        .subVectors(this.targetPosition, this.player.mesh.position)
        .normalize();
      const distance = MOVEMENT_SYSTEM_PLAYER_SPEED * delta;
      const step = direction.multiplyScalar(distance); // Calculates displacement based on speed and elapsed time

      this.targetRotationY = Math.atan2(direction.x, direction.z);
      this.runAnimationWeight = Math.min(this.runAnimationWeight + delta * 2, 1);

      if (this.player.mesh.position.distanceTo(this.targetPosition) > distance) {
        this.player.mesh.position.add(step);
      } else {
        this.player.mesh.position.copy(this.targetPosition);
        this.player.isMoving = false;
        this.player.runAnimation.stop();
      }
    } else {
      this.runAnimationWeight = Math.max(this.runAnimationWeight - delta * 2, 0);
    }

    const deltaRotation =
      ((this.targetRotationY - this.player.mesh.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;

    this.player.boundingBox.setFromObject(this.player.mesh);
    this.player.mesh.rotation.y += deltaRotation * delta * 10;
    this.player.runAnimation.setEffectiveWeight(this.runAnimationWeight);
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
        this.targetPosition.copy(intersects[0].point);
        this.player.isMoving = true;

        this.player.runAnimation.play();
      }
    });
  }
}
