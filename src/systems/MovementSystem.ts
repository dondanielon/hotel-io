import { type PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import { InputState } from '../common/states';
import { type PlayerMesh, type TerrainMesh } from '../common/types';
import { MOVEMENT_SYSTEM_PLAYER_SPEED } from '../common/constants';

export class MovementSystem {
  private mouseRightClick: Vector2;
  private raycaster: Raycaster;
  private targetPosition: Vector3;

  constructor(private camera: PerspectiveCamera, private player: PlayerMesh, private terrain: TerrainMesh) {
    this.mouseRightClick = new Vector2();
    this.raycaster = new Raycaster();
    this.targetPosition = new Vector3();
    this.addEventListeners();
  }

  private addEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      InputState[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      InputState[e.key.toLowerCase()] = false;
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      this.mouseRightClick.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseRightClick.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseRightClick, this.camera);

      const intersects = this.raycaster.intersectObject(this.terrain);

      if (intersects.length > 0) {
        this.targetPosition.copy(intersects[0].point);
        this.targetPosition.y = 1;
        InputState.isMoving = true;
      }
    });
  }

  public update(delta: number): void {
    if (InputState.isMoving) {
      const direction = new Vector3().subVectors(this.targetPosition, this.player.position).normalize();
      const distance = MOVEMENT_SYSTEM_PLAYER_SPEED * delta;
      const step = direction.multiplyScalar(distance); // Calculates displacement based on speed and elapsed time

      if (this.player.position.distanceTo(this.targetPosition) > distance) {
        this.player.position.add(step);
      } else {
        this.player.position.copy(this.targetPosition);
        InputState.isMoving = false;
      }
    }

    // Debug only
    if (InputState.arrowup) {
      this.player.position.y += 0.1;
    }
    if (InputState.arrowdown) {
      const newPos = this.player.position.y - 0.1;
      this.player.position.y = Math.max(newPos, 1);
    }
    if (InputState.arrowleft) {
      this.player.rotation.y += 0.05;
    }
    if (InputState.arrowright) {
      this.player.rotation.y -= 0.05;
    }
  }
}
