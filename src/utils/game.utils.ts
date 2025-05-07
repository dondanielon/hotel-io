import { GameStore } from "@root/stores/game.store";
import { PlayerAnimations } from "@root/types/game.types";
import * as THREE from "three";

export class GameUtils {
  public static createTerrain(
    points: Array<THREE.Vector2>,
    position: THREE.Vector3,
  ) {
    const terrainShape = new THREE.Shape(points);
    const terrainGeometry = new THREE.ExtrudeGeometry(terrainShape, {
      steps: 2,
      depth: -0.1,
      bevelEnabled: false,
    });
    const terrainMaterial = new THREE.MeshToonMaterial({
      side: 1,
      color: new THREE.Color(0x3a3a3a),
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.receiveShadow = true;
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.copy(position);

    return terrainMesh;
  }

  public static setupPlayerAnimations(
    mixer: THREE.AnimationMixer,
    animations: THREE.AnimationClip[],
  ): PlayerAnimations {
    return {
      idle: mixer.clipAction(animations.find((x) => x.name === "idle")!),
      run: mixer.clipAction(animations.find((x) => x.name === "fast-run")!),
      tpose: mixer.clipAction(animations.find((x) => x.name === "tpose")!),
      walk: mixer.clipAction(animations.find((x) => x.name === "walk")!),
      /*
      dash: mixer.clipAction(animations.find((x) => x.name === "dash")!),
      swordAttack: mixer.clipAction(
        animations.find((x) => x.name === "sword-attack")!,
      ),
      */
    };
  }

  public static getMainPlayerEntityId(): number | undefined {
    return GameStore.getState().mappedPlayers[
      GameStore.getState().user?.id ?? ""
    ];
  }
}
