import { GameStore } from "@root/shared/stores/game.store";
import { System } from "ecsy";
import * as THREE from "three";

export class MouseLocationSystem extends System {
  execute(_delta: number, _time: number): void {}

  init(): void {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    const positionX = (event.clientX / window.innerWidth) * 2 - 1;
    const positionY = -(event.clientY / window.innerHeight) * 2 + 1;

    GameStore.update("mouseLocation", new THREE.Vector2(positionX, positionY));
  }
}
