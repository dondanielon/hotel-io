import * as THREE from "three";
import { ECSYThreeWorld, WebGLRendererComponent } from "ecsy-three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { TerrainConstants } from "@shared/constants/terrain.constants";
import { CameraConstants } from "@shared/constants/camera.constants";
import {
  setupCamera,
  setupComponents,
  setupPlayer,
  setupRenderer,
  setupSceneLighting,
  setupStats,
  setupSystems,
  setupTerrain,
} from "./sandbox-setup";

export class Sandbox {
  private world: ECSYThreeWorld;

  constructor() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const gltfLoader = new GLTFLoader();
    const camera = new THREE.PerspectiveCamera(
      CameraConstants.FOV,
      CameraConstants.ASPECT_RATIO,
      CameraConstants.NEAR_VIEW,
      CameraConstants.FAR_VIEW,
    );

    this.world = new ECSYThreeWorld();

    const stats = setupStats(true);

    renderer.setAnimationLoop(() => {
      stats?.begin();
      this.world.execute(clock.getDelta(), clock.elapsedTime);
      stats?.end();
    });

    setupComponents(this.world);
    setupSystems(this.world);
    setupCamera(camera, scene);
    setupRenderer(renderer);
    setupSceneLighting(scene);

    // Setup main world entities
    const sceneEntity = this.world.createEntity().addObject3DComponent(scene);
    const cameraEntity = this.world.createEntity().addObject3DComponent(camera, sceneEntity);

    this.world.createEntity().addComponent(WebGLRendererComponent, {
      renderer,
      camera: cameraEntity,
      scene: sceneEntity,
    });

    setupPlayer(this.world, gltfLoader, scene);
    setupTerrain(this.world, {
      sceneEntity,
      terrain: {
        points: TerrainConstants.DEFAULT_SANDBOX_POINTS,
        position: new THREE.Vector3(0, 0, 0),
      },
    });

    console.log("==============");
    console.log(THREE.WebGPUCoordinateSystem);
  }
}
