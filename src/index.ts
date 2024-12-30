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
  CAMERA_SYSTEM_X_POSITION_ADD,
  CAMERA_SYSTEM_Y_POSITION_ADD,
  CAMERA_SYSTEM_Z_POSITION_ADD,
} from './common/constants';

const xRange = document.querySelector<HTMLInputElement>('#xRange')!;
const yRange = document.querySelector<HTMLInputElement>('#yRange')!;
const zRange = document.querySelector<HTMLInputElement>('#zRange')!;
const fovRange = document.querySelector<HTMLInputElement>('#fovRange')!;
const xValue = document.querySelector<HTMLInputElement>('#xValue')!;
const yValue = document.querySelector<HTMLInputElement>('#yValue')!;
const zValue = document.querySelector<HTMLInputElement>('#zValue')!;
const fovValue = document.querySelector<HTMLInputElement>('#fovValue')!;

xRange.value = `${CAMERA_SYSTEM_X_POSITION_ADD}`;
yRange.value = `${CAMERA_SYSTEM_Y_POSITION_ADD}`;
zRange.value = `${CAMERA_SYSTEM_Z_POSITION_ADD}`;
fovRange.value = `${CAMERA_FOV}`;
xValue.textContent = xRange.value;
yValue.textContent = yRange.value;
zValue.textContent = zRange.value;
fovValue.textContent = `${CAMERA_FOV}`;

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
  const { directionalLight, ambientLight } = setupLighting();

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
  const movementSystem = new MovementSystem(player, scene, camera, terrain);

  scene.add(camera);
  scene.add(terrain.mesh);
  scene.add(directionalLight);
  scene.add(ambientLight);

  for (const p of playerEntities) {
    scene.add(p.mesh);
  }

  xRange.addEventListener('input', () => updateCameraPosition(cameraSystem, camera));
  yRange.addEventListener('input', () => updateCameraPosition(cameraSystem, camera));
  zRange.addEventListener('input', () => updateCameraPosition(cameraSystem, camera));
  fovRange.addEventListener('input', () => updateCameraPosition(cameraSystem, camera));

  const clock = new Clock();
  const animationLoop = () => {
    requestAnimationFrame(animationLoop);
    const delta = clock.getDelta();

    cameraSystem.update(delta);
    movementSystem.update(delta);

    rederer.render(scene, camera);
  };

  animationLoop();
}

function updateCameraPosition(cameraSystem: CameraSystem, camera: PerspectiveCamera) {
  camera.fov = parseInt(fovRange.value, 10);
  camera.updateProjectionMatrix();
  cameraSystem.cX = parseInt(xRange.value, 10);
  cameraSystem.cY = parseInt(yRange.value, 10);
  cameraSystem.cZ = parseInt(zRange.value, 10);

  xValue.textContent = xRange.value;
  yValue.textContent = yRange.value;
  zValue.textContent = zRange.value;
  fovValue.textContent = camera.fov.toString();
}

bootstrap();
