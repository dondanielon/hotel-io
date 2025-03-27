// import { System } from 'ecsy';
// import { SceneComponent } from '../components/SceneComponent';
// import { CameraComponent } from '../components/CameraComponent';
// import { Raycaster, Vector2 } from 'three';
// import { Model3DComponent } from '../components/Model3DComponent';

// export class PlayerInputSystem extends System {
//   private raycaster = new Raycaster();
//   static queries = {
//     scene: { components: [SceneComponent] },
//     camera: { components: [CameraComponent] },
//     terrain: { components: [Model3DComponent] },
//   };

//   init(): void {
//     window.addEventListener('contextmenu', this.onRightClick.bind(this));
//   }

//   execute(_delta: number, _time: number): void {}

//   private onRightClick(e: MouseEvent): void {
//     e.preventDefault();

//     const cameraComponent = this.queries.camera.results[0].getComponent(CameraComponent);
//     const sceneComponent = this.queries.scene.results[0].getComponent(SceneComponent);
//     const terrainComponent = this.queries.terrain.results.find(
//       (entity) => entity. === 'terrain'
//     );

//     if (!cameraComponent || !sceneComponent) return;

//     const camera = cameraComponent.camera;
//     const scene = sceneComponent.scene;

//     const mouse = new Vector2(
//       (e.clientX / window.innerWidth) * 2 - 1,
//       -(e.clientY / window.innerHeight) * 2 + 1
//     );
// //
//     this.raycaster.setFromCamera(mouse, camera);

//     const intersects = this.raycaster.intersectObject();
//   }
// }
