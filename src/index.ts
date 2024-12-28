import './style.css';
import { Clock, DirectionalLight, Scene, WebGLRenderer } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { TerrainEntity } from './entities/TerrainEntity';
import { PlayerEntity } from './entities/PlayerEntity';
import { CameraSystem } from './systems/CameraSystem';
import { MovementSystem } from './systems/MovementSystem';

function bootstrap(): void {
  const htmlDiv = document.querySelector<HTMLDivElement>('#app');

  if (!htmlDiv) {
    throw new Error('HTML <div id="app"> not found.');
  }

  const scene = new Scene();
  const rederer = new WebGLRenderer();

  rederer.setSize(window.innerWidth, window.innerHeight);
  rederer.shadowMap.enabled = true;
  htmlDiv.appendChild(rederer.domElement);

  const terrain = new TerrainEntity({
    width: 100,
    height: 100,
    color: 0x808080,
    rotation: -Math.PI / 2,
  });

  const player = new PlayerEntity({
    color: 0xff0000,
    debug: true,
    depth: 1,
    position: { x: 0, y: 1, z: 0 },
    height: 2,
    width: 1,
  });

  /**
   * Here we initialize all the required systems
   * we do it in order because we have systems that
   * depend on other systems (dependency injection).
   */
  const cameraSystem = new CameraSystem(player.mesh);
  const movementSystem = new MovementSystem(cameraSystem.camera, player.mesh, terrain.mesh);

  /**
   * TODO: Implement ModelLoaderSystem
   *
   * For now we only load a single character model
   * is easier to test stuff out during development this way.
   * (I really have hueva de implement the system) <- some really fun spanglish
   */
  const loader = new GLTFLoader();
  // Helper functions for loading models
  const onLoad = (glft: GLTF) => {
    const models = glft.scene.children;
    console.log(models[0]);
    const selectedModel = models[0];
    selectedModel.position.set(0, 0, 0);
    player.mesh.add(selectedModel);
    selectedModel.visible = true;
  };

  const onProgress = (event: ProgressEvent) => {
    console.clear();
    console.log((event.loaded / event.total) * 100 + '% loaded');
  };

  const onError = (err: unknown) => {
    console.error('error paso aqui');
    console.error(err);
  };

  loader.load('/models/allcartoon.glb', onLoad, onProgress, onError);

  // Scene Lighting
  const directionalLight = new DirectionalLight(0xffffff, 1);
  const shadowCamera = directionalLight.shadow.camera;

  directionalLight.position.set(0, 10, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  shadowCamera.left = -50;
  shadowCamera.right = 50;
  shadowCamera.top = 50;
  shadowCamera.bottom = -50;
  shadowCamera.near = 0.1;
  shadowCamera.far = 100;

  scene.add(cameraSystem.camera);
  scene.add(terrain.mesh);
  scene.add(player.mesh);
  scene.add(directionalLight);

  const clock = new Clock();
  const animationLoop = () => {
    requestAnimationFrame(animationLoop);
    const delta = clock.getDelta();

    player.update(delta);
    cameraSystem.update(delta);
    movementSystem.update(delta);

    rederer.render(scene, cameraSystem.camera);
  };

  animationLoop();
}

bootstrap();
