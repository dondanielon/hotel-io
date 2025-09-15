import * as THREE from "three";
import Stats from "stats.js";
import { ECSYThreeEntity, ECSYThreeWorld, WebGLRendererComponent, WebGLRendererSystem } from "ecsy-three";
import { TerrainComponent } from "@components/terrain.component";
import { PlayerComponent } from "@components/player.component";
import { PlayerAnimationComponent } from "@components/player-animation.component";
import { MovementComponent } from "@components/movement.component";
import { CameraSystem } from "@root/systems/gameplay/camera.system";
import { MouseLocationSystem } from "@root/systems/core/mouse-location.system";
import { MovementSystem } from "@systems/gameplay/movement.system";
import { AnimationSystem } from "@systems/core/animation.system";
import { PlayerInputSystem } from "@root/systems/gameplay/player-input.system";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { PlayerConstants } from "@shared/constants/player.constants";
import { GameStore } from "@shared/stores/game.store";
import { Collision2DComponent } from "@root/components/collision-2d.component";
import { CollisionSystem } from "@root/systems/core/collision-2d.system";
import { CollisionLayer, CollisionShape2D } from "@root/shared/enums/game.enums";
import { CollisionConstants } from "@root/shared/constants/collision.constants";
import { TerrainEditorSystem } from "@root/systems/gameplay/terrain-editor.system";
//import { toonShader } from "./sandbox-shaders";

interface ISetupTerrainConfig {
  terrain: any;
  sceneEntity: ECSYThreeEntity;
}

export function setupComponents(world: ECSYThreeWorld): void {
  world
    .registerComponent(WebGLRendererComponent)
    .registerComponent(TerrainComponent)
    .registerComponent(PlayerComponent)
    .registerComponent(PlayerAnimationComponent)
    .registerComponent(MovementComponent)
    .registerComponent(Collision2DComponent);
}

export function setupSystems(world: ECSYThreeWorld): void {
  world
    .registerSystem(CameraSystem)
    .registerSystem(MouseLocationSystem)
    .registerSystem(MovementSystem)
    .registerSystem(AnimationSystem)
    .registerSystem(PlayerInputSystem)
    .registerSystem(CollisionSystem)
    .registerSystem(TerrainEditorSystem)
    .registerSystem(WebGLRendererSystem, { priority: 999 });
  // Multiplayer in future version
  // .registerSystem(SocketSystemV2, { priority: 0 })
}

export function setupStats(enable: boolean): Stats | undefined {
  if (enable) {
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    return stats;
  }
}

export function setupCamera(camera: THREE.PerspectiveCamera, scene: THREE.Scene): void {
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  scene.add(camera);
}

export function setupRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
}

export function setupSceneLighting(scene: THREE.Scene): void {
  // Directional lights for shadows
  const directionalLight_1 = new THREE.DirectionalLight(0xffffff, 1);
  //const directionalLight_2 = new THREE.DirectionalLight(0xffffff, 0.5);

  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);

  // Hemisphere light for more natural lighting
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6);

  directionalLight_1.position.set(10, 10, 10);
  //directionalLight_2.position.set(-10, 10, -10);
  directionalLight_1.castShadow = true;
  //directionalLight_2.castShadow = true;

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
  //scene.add(directionalLight_2);
  scene.add(ambientLight);
  scene.add(hemisphereLight);
}

export function setupTerrain(world: ECSYThreeWorld, config: ISetupTerrainConfig): void {
  const terrainShape = new THREE.Shape(config.terrain.points);
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
  terrainMesh.position.copy(config.terrain.position);

  world.createEntity().addObject3DComponent(terrainMesh, config.sceneEntity).addComponent(TerrainComponent);
}

function createCustomAxesHelper(xSize: number, ySize: number, zSize: number) {
  const group = new THREE.Group();

  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, 0),
    new THREE.Vector3(xSize, 0.01, 0),
  ]);
  const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const xLine = new THREE.Line(xGeometry, xMaterial);
  group.add(xLine);

  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, 0),
    new THREE.Vector3(0, ySize, 0),
  ]);
  const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const yLine = new THREE.Line(yGeometry, yMaterial);
  group.add(yLine);

  const zGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, 0),
    new THREE.Vector3(0, 0.01, zSize),
  ]);
  const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const zLine = new THREE.Line(zGeometry, zMaterial);
  group.add(zLine);

  return group;
}

export function setupPlayer(world: ECSYThreeWorld, loader: GLTFLoader, scene: THREE.Scene): void {
  loader.load("/models/basic_male.glb", (model) => {
    model.scene.scale.set(1, 1, 1);
    model.scene.position.set(0, 0, 0);
    model.scene.castShadow = true;

    // Add debug axes to character
    const playerAxes = createCustomAxesHelper(1, 3, 1);
    playerAxes.visible = false;
    model.scene.add(playerAxes);
    GameStore.update("playerAxes", playerAxes);

    model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff6600 });
        const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

        wireframeMesh.position.copy(child.position);
        wireframeMesh.rotation.copy(child.rotation);
        wireframeMesh.scale.copy(child.scale);
        wireframeMesh.visible = false;

        const wireframeEntity = world.createEntity();
        wireframeEntity.addObject3DComponent(wireframeMesh);
        wireframeEntity.addComponent(MovementComponent, {
          speed: PlayerConstants.SPEED,
          isMoving: false,
          targetPosition: null,
          isDashing: false,
          dashDirection: null,
          dashTimer: 0,
        });

        GameStore.update("playerWireframe", wireframeEntity);

        //try {
        //  child.material = toonShader.clone();
        //
        //  if (child.material.uniforms && child.material.uniforms.uColor) {
        //    const originalColor = child.material.color;
        //    child.material.uniforms.uColor.value = originalColor;
        //  }
        //} catch (error) {
        //  console.error("Error adding shader to model: ", error);
        //}
        //
        scene.add(wireframeMesh);
      }
    });

    const playerEntity = world.createEntity();
    playerEntity.addObject3DComponent(model.scene);
    playerEntity.addComponent(PlayerComponent, { username: "ALPHA_TEST", id: crypto.randomUUID() });
    playerEntity.addComponent(MovementComponent, {
      speed: PlayerConstants.SPEED,
      isMoving: false,
      targetPosition: null,
      isDashing: false,
      dashDirection: null,
      dashTimer: 0,
    });
    playerEntity.addComponent(Collision2DComponent, {
      shape: CollisionShape2D.CIRCLE,
      radius: CollisionConstants.RADIUS_PLAYER,
      layer: CollisionLayer.PLAYER,
      collidesWith: CollisionLayer.TERRAIN | CollisionLayer.WALLS,
      isTrigger: false,
      isActive: true,
      collidingEntities: new Set(),
    });

    GameStore.update("playerEntity", playerEntity);

    scene.add(model.scene);
  });

  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
  const cylinderMaterial = new THREE.MeshToonMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.2 });
  const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinderMesh.position.set(2, 1, -2);
  cylinderMesh.castShadow = true;
  cylinderMesh.receiveShadow = true;

  const c2Geometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 10);
  const c2Material = new THREE.MeshToonMaterial({ color: 0xff6600 });
  const c2Mesh = new THREE.Mesh(c2Geometry, c2Material);
  c2Mesh.position.set(2, 1.5, -2);
  c2Mesh.castShadow = true;
  c2Mesh.receiveShadow = true;

  scene.add(cylinderMesh);
  scene.add(c2Mesh);

  world
    .createEntity()
    .addObject3DComponent(cylinderMesh)
    .addComponent(Collision2DComponent, {
      shape: CollisionShape2D.CIRCLE,
      radius: 0.5,
      layer: CollisionLayer.WALLS,
      collidesWith: CollisionLayer.PLAYER | CollisionLayer.ENEMY | CollisionLayer.PROJECTILE,
      isTrigger: false,
      isActive: true,
      collidingEntities: new Set(),
    });
}
