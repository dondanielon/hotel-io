import {
  ECSYThreeEntity,
  ECSYThreeWorld,
  WebGLRendererComponent,
  WebGLRendererSystem,
} from 'ecsy-three';
import * as THREE from 'three';
import { Constants } from './constants';
import { SocketSystem } from './systems/socket.system';
import { TerrainComponent } from './components/terrain.component';
import { PlayerInputSystem } from './systems/player-input.system';
import { PlayerComponent } from './components/player.component';
import { PlayerAnimationComponent } from './components/player-animation.component';
import { MovementComponent } from './components/movement.component';
import Stats from 'stats.js';
import { MovementSystem } from './systems/movement.system';
import { CameraSystem } from './systems/camera.system';
import { CommandSystem } from './systems/command.system';
import { AnimationSystem } from './systems/animation.system';
import { MouseLocationSystem } from './systems/mouse-location.system';

export class Game {
  private world: ECSYThreeWorld;
  private rendererEntity: ECSYThreeEntity;

  constructor() {
    this.world = new ECSYThreeWorld();
    this.world
      .registerComponent(WebGLRendererComponent)
      .registerComponent(TerrainComponent)
      .registerComponent(PlayerComponent)
      .registerComponent(PlayerAnimationComponent)
      .registerComponent(MovementComponent)
      .registerSystem(SocketSystem, { priority: 0 })
      .registerSystem(CameraSystem)
      .registerSystem(MouseLocationSystem)
      .registerSystem(MovementSystem)
      .registerSystem(AnimationSystem)
      .registerSystem(PlayerInputSystem)
      .registerSystem(CommandSystem)
      .registerSystem(WebGLRendererSystem, { priority: 999 });

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      Constants.CAMERA_FOV,
      Constants.CAMERA_ASPECT_RATIO,
      Constants.CAMERA_NEAR_VIEW,
      Constants.CAMERA_FAR_VIEW
    );

    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    const stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.dom);
    document.body.appendChild(renderer.domElement);

    renderer.setAnimationLoop(() => {
      stats.begin();
      this.world.execute(clock.getDelta(), clock.elapsedTime);
      stats.end();
    });

    const sceneEntity = this.world.createEntity().addObject3DComponent(scene);
    const cameraEntity = this.world.createEntity().addObject3DComponent(camera, sceneEntity);

    this.rendererEntity = this.world.createEntity().addComponent(WebGLRendererComponent, {
      scene: sceneEntity,
      camera: cameraEntity,
      renderer,
    });

    const directionalLight_1 = new THREE.DirectionalLight(0xffffff, 1);
    const directionalLight_2 = new THREE.DirectionalLight(0xffffff, 1);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);

    directionalLight_1.position.set(0, 10, 10);
    directionalLight_2.position.set(0, 10, -10);
    directionalLight_1.castShadow = true;
    directionalLight_2.castShadow = true;

    scene.add(camera);
    scene.add(directionalLight_1);
    scene.add(directionalLight_2);

    scene.add(ambientLight);
  }

  setupLobby() {
    console.log('lobby initialized');
  }
}
