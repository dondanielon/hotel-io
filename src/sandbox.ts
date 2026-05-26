import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { assert, printInfoMessage } from "@shared/utils";
import { GameStore } from "@shared/stores";
import { Player } from "@objects/player";
import { InputManager } from "@managers/input-manager";
import { CameraManager } from "./managers/camera-manager";
import { EditorManager } from "./managers/editor-manager";

import {
  CAMERA_ASPECT_RATIO,
  CAMERA_FAR_VIEW,
  CAMERA_FOV,
  CAMERA_NEAR_VIEW,
  SETTING_SANDBOX_MAIN_CANVAS_ID,
  TERRAIN_DEFAULT_SANDBOX_SHAPE_POINTS,
  UI_TOP_MENU_TAG_NAME,
} from "@shared/constants";
import { ObjectMovementManager } from "./managers/object-movement-manager";

export class Sandbox {
  private camera: THREE.PerspectiveCamera;
  private mainPlayer: Player | null;
  private players: Map<string, Player>;
  private renderer: THREE.WebGPURenderer;
  private scene: THREE.Scene;
  private terrain: THREE.Mesh | null;
  private timer: THREE.Timer;
  private glftLoader: GLTFLoader;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT_RATIO, CAMERA_NEAR_VIEW, CAMERA_FAR_VIEW);
    this.mainPlayer = null;
    this.players = new Map();
    this.renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL: true });
    this.scene = new THREE.Scene();
    this.terrain = null;
    this.timer = new THREE.Timer();
    this.glftLoader = new GLTFLoader();
  }

  public async init(): Promise<void> {
    GameStore.update("scene", this.scene);
    GameStore.update("gameMode", "sandbox");
    printInfoMessage();
    // Sync/Async core setup
    this.setupRenderer();
    this.setupCamera();
    this.setupSceneLighting();
    this.setupTerrain();
    this.setupUI();
    await Promise.all([this.renderer.init(), this.setupPlayer()]);

    assert(this.mainPlayer, "mainPlayer");
    assert(this.terrain, "terrain");
    // Initialize managers after core setup
    const inputManager = new InputManager(this.renderer, this.camera, this.scene, this.mainPlayer, this.terrain);
    const editorManager = new EditorManager(this.scene, this.camera, this.terrain);
    const cameraManager = new CameraManager(this.camera, this.mainPlayer);
    const objectMovementManager = new ObjectMovementManager(this.players);
    // Use of the Page Visibility API to avoid large time delta values when the app is inactive
    this.timer.connect(document);

    this.renderer.setAnimationLoop((time, _frame) => {
      this.timer.update(time);

      const delta = this.timer.getDelta();
      const elapsed = this.timer.getElapsed();

      inputManager.update(delta, elapsed);
      editorManager.update(delta, elapsed);
      cameraManager.update(delta, elapsed);
      objectMovementManager.update(delta, elapsed);
      // Render at the end of the loop to ensure all updates are applied before rendering
      this.renderer.render(this.scene, this.camera);
    });
  }

  private setupRenderer(): void {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.id = SETTING_SANDBOX_MAIN_CANVAS_ID;
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);
  }

  private setupCamera(): void {
    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  private setupSceneLighting(): void {
    const directionalLight_1 = new THREE.DirectionalLight(0xffffff, 1);
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6);

    directionalLight_1.position.set(10, 10, 10);
    directionalLight_1.castShadow = true;
    directionalLight_1.shadow.mapSize.width = 2048;
    directionalLight_1.shadow.mapSize.height = 2048;
    directionalLight_1.shadow.camera.near = 0.5;
    directionalLight_1.shadow.camera.far = 50;
    directionalLight_1.shadow.camera.left = -20;
    directionalLight_1.shadow.camera.right = 20;
    directionalLight_1.shadow.camera.top = 20;
    directionalLight_1.shadow.camera.bottom = -20;

    this.scene.add(directionalLight_1);
    this.scene.add(ambientLight);
    this.scene.add(hemisphereLight);
  }

  private setupTerrain(): void {
    const shape = new THREE.Shape(TERRAIN_DEFAULT_SANDBOX_SHAPE_POINTS);
    const geometry = new THREE.ExtrudeGeometry(shape, { steps: 2, depth: -0.1, bevelEnabled: false });
    const material = new THREE.MeshToonMaterial({ side: THREE.DoubleSide, color: new THREE.Color(0x3a3a3a) });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0, 0);

    this.terrain = mesh;
    this.scene.add(mesh);
  }

  private async setupPlayer(): Promise<void> {
    const model = await this.glftLoader.loadAsync("/models/basic_male.glb");
    const player = new Player(model, model.scene);
    // const playerWireframe = player.getWireframe();

    this.mainPlayer = player;
    this.players.set(player.id, player);
    this.scene.add(model.scene);
    // this.scene.add(playerWireframe);

    // GameStore.update("wireframeMesh", playerWireframe);
    GameStore.update("mainPlayerId", player.id);
  }

  private setupUI(): void {
    const topmenu = document.createElement(UI_TOP_MENU_TAG_NAME);
    document.body.append(topmenu);
  }
}
