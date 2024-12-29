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

  const playerEntities = await setupPlayers();
  const terrain = await setupTerrain();
  const directionalLight = setupLighting();

  /**
   * The id is hardcoded for now, in the future we will get the
   * id somehow with the yet to be made authentication system. LOL
   *
   * Also the main player can be handled in the movement system passing the id
   * once we handle the movement for all players in the terrain.
   * (For now we only handle the main player).
   */
  const id = 'c7fed61a-d869-4a51-bf18-51281121d13c';
  const player = playerEntities.find((x) => x.id === id)!;

  const cameraSystem = new CameraSystem(camera, player);
  const movementSystem = new MovementSystem(player, camera, terrain);

  scene.add(cameraSystem.camera);
  scene.add(terrain.mesh);
  scene.add(directionalLight);

  for (const p of playerEntities) {
    scene.add(p.mesh);
  }

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
