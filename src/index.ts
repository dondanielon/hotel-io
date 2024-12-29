import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import './style.css';
import { CameraSystem } from './systems/CameraSystem';
import { MovementSystem } from './systems/MovementSystem';
import { setupLighting, setupPlayers, setupTerrain } from './setup';
import {
  CAMERA_ASPECT_RATIO,
  CAMERA_FAR_VIEW,
  CAMERA_FOV,
  CAMERA_NEAR_VIEW,
} from './common/constants';

async function bootstrap(): Promise<void> {
  const htmlDiv = document.querySelector<HTMLDivElement>('#app');

  if (!htmlDiv) {
    throw new Error('HTML <div id="app"> not found.');
  }

  const scene = new Scene();
  const rederer = new WebGLRenderer({ antialias: true });
  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    CAMERA_ASPECT_RATIO,
    CAMERA_NEAR_VIEW,
    CAMERA_FAR_VIEW
  );

  rederer.setSize(window.innerWidth, window.innerHeight);
  rederer.shadowMap.enabled = true;
  htmlDiv.appendChild(rederer.domElement);

  /**
   * Game setup
   *
   * The id is hardcoded for now, in the future we will get the
   * id somehow with the yet to be made authentication system. LOL
   */
  const id = 'c7fed61a-d869-4a51-bf18-51281121d13c';
  const playerEntities = await setupPlayers();
  const terrain = await setupTerrain();
  const directionalLight = setupLighting();

  const player = playerEntities.find((x) => x.id === id)!; // This should not fail for now
  console.log(player);

  /**
   * Here we initialize all the required systems
   * we do it in order because we have systems that
   * depend on other systems (dependency injection).
   */
  const cameraSystem = new CameraSystem(camera, player);
  const movementSystem = new MovementSystem(player, camera, terrain);

  scene.add(cameraSystem.camera);
  scene.add(terrain.mesh);
  scene.add(directionalLight);
  scene.add(player.mesh);

  const clock = new Clock();
  const animationLoop = () => {
    requestAnimationFrame(animationLoop);
    const delta = clock.getDelta();

    cameraSystem.update(delta);
    movementSystem.update(delta);

    rederer.render(scene, cameraSystem.camera);
  };

  animationLoop();
}

bootstrap();
