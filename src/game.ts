import { ECSYThreeWorld, WebGLRendererComponent, WebGLRendererSystem } from "ecsy-three";
import * as THREE from "three";
import { Constants } from "./constants";
import { SocketSystemV2 } from "./systems/socket.system-v2";
import { TerrainComponent } from "./components/terrain.component";
import { PlayerInputSystem } from "./systems/player-input.system";
import { PlayerComponent } from "./components/player.component";
import { PlayerAnimationComponent } from "./components/player-animation.component";
import { MovementComponent } from "./components/movement.component";
import Stats from "stats.js";
import { CameraSystem } from "./systems/camera.system";
import { CommandSystem } from "./systems/command.system";
import { AnimationSystem } from "./systems/animation.system";
import { MouseLocationSystem } from "./systems/mouse-location.system";
import { MovementSystem } from "./systems/movement.system";

export class Game {
  private world: ECSYThreeWorld;
  private rendererEntity: any;

  constructor() {
    this.world = new ECSYThreeWorld();
    this.world
      .registerComponent(WebGLRendererComponent)
      .registerComponent(TerrainComponent)
      .registerComponent(PlayerComponent)
      .registerComponent(PlayerAnimationComponent)
      .registerComponent(MovementComponent)
      // Register V2 systems with prediction support
      .registerSystem(SocketSystemV2, { priority: 0 })
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
      Constants.CAMERA_FAR_VIEW,
    );

    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    const stats = new Stats();
    stats.showPanel(0);

    // Show stats for debugging network performance
    document.body.appendChild(stats.dom);
    document.body.appendChild(renderer.domElement);

    // Add performance monitoring
    this.setupPerformanceMonitoring();

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

    // Enhanced lighting for better visuals
    this.setupLighting(scene);

    // Add camera to scene
    scene.add(camera);
  }

  private setupLighting(scene: THREE.Scene): void {
    // Directional lights for shadows
    const directionalLight_1 = new THREE.DirectionalLight(0xffffff, 1);
    const directionalLight_2 = new THREE.DirectionalLight(0xffffff, 0.5);

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);

    // Hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6);

    directionalLight_1.position.set(10, 10, 10);
    directionalLight_2.position.set(-10, 10, -10);
    directionalLight_1.castShadow = true;
    directionalLight_2.castShadow = true;

    // Configure shadow properties for better quality
    directionalLight_1.shadow.mapSize.width = 2048;
    directionalLight_1.shadow.mapSize.height = 2048;
    directionalLight_1.shadow.camera.near = 0.5;
    directionalLight_1.shadow.camera.far = 50;
    directionalLight_1.shadow.camera.left = -20;
    directionalLight_1.shadow.camera.right = 20;
    directionalLight_1.shadow.camera.top = 20;
    directionalLight_1.shadow.camera.bottom = -20;

    scene.add(directionalLight_1);
    scene.add(directionalLight_2);
    scene.add(ambientLight);
    scene.add(hemisphereLight);

    // Enable shadows on renderer
    const renderer = this.rendererEntity.getComponent(WebGLRendererComponent).renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupPerformanceMonitoring(): void {
    // Add network stats display
    const networkStatsDiv = document.createElement("div");
    networkStatsDiv.id = "network-stats";
    networkStatsDiv.style.position = "absolute";
    networkStatsDiv.style.top = "10px";
    networkStatsDiv.style.right = "10px";
    networkStatsDiv.style.color = "white";
    networkStatsDiv.style.fontFamily = "monospace";
    networkStatsDiv.style.fontSize = "12px";
    networkStatsDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
    networkStatsDiv.style.padding = "10px";
    networkStatsDiv.style.borderRadius = "5px";
    networkStatsDiv.innerHTML = `
      <div>Server: V2 (Authoritative)</div>
      <div>Prediction: Enabled</div>
      <div>Ping: <span id="ping">--</span>ms</div>
      <div>Reconciliations: <span id="reconciliations">0</span></div>
      <div>Input Buffer: <span id="input-buffer">0</span></div>
    `;
    document.body.appendChild(networkStatsDiv);

    // Update network stats periodically
    setInterval(() => {
      this.updateNetworkStats();
    }, 1000);
  }

  private updateNetworkStats(): void {
    // These would be updated by the socket system
    const pingElement = document.getElementById("ping");
    const reconciliationsElement = document.getElementById("reconciliations");
    const inputBufferElement = document.getElementById("input-buffer");

    if (pingElement) {
      pingElement.textContent = ((window as any).networkStats?.ping || 0).toString();
    }
    if (reconciliationsElement) {
      reconciliationsElement.textContent = ((window as any).networkStats?.reconciliations || 0).toString();
    }
    if (inputBufferElement) {
      inputBufferElement.textContent = ((window as any).networkStats?.inputBufferSize || 0).toString();
    }
  }

  setupLobby() {
    console.log("V2 lobby initialized with client-side prediction");

    // Add instructions for V2 features
    const instructionsDiv = document.createElement("div");
    instructionsDiv.style.position = "absolute";
    instructionsDiv.style.bottom = "10px";
    instructionsDiv.style.left = "10px";
    instructionsDiv.style.color = "white";
    instructionsDiv.style.fontFamily = "Arial, sans-serif";
    instructionsDiv.style.fontSize = "14px";
    instructionsDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
    instructionsDiv.style.padding = "15px";
    instructionsDiv.style.borderRadius = "5px";
    instructionsDiv.style.maxWidth = "300px";
    instructionsDiv.innerHTML = `
      <h3 style="margin-top: 0;">Game V2 Features:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Server-authoritative gameplay</li>
        <li>Client-side prediction</li>
        <li>Lag compensation</li>
        <li>Fast-paced combat ready</li>
        <li>60Hz server tick rate</li>
      </ul>
      <p style="margin-bottom: 0;"><strong>Controls:</strong> Click to move, Shift+Click to dash</p>
    `;
    document.body.appendChild(instructionsDiv);
  }
}
