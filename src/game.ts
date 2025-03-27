import {
  ECSYThreeEntity,
  ECSYThreeWorld,
  WebGLRendererComponent,
  WebGLRendererSystem,
} from 'ecsy-three';
import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Mesh,
  MeshToonMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  Vector2,
  WebGLRenderer,
} from 'three';
import { CAMERA_ASPECT_RATIO, CAMERA_FAR_VIEW, CAMERA_FOV, CAMERA_NEAR_VIEW } from './constants';
import { NetworkSystem } from './systems/network.system';
import { baseTerrainPoints } from './develop/fixtures';
import { TerrainComponent } from './components/terrain.component';

export class Game {
  private world: ECSYThreeWorld;
  private rendererEntity: ECSYThreeEntity;

  constructor() {
    this.world = new ECSYThreeWorld();
    this.world
      .registerComponent(WebGLRendererComponent)
      .registerComponent(TerrainComponent)
      .registerSystem(NetworkSystem, { priority: 0 })
      .registerSystem(WebGLRendererSystem, { priority: 999 });

    const renderer = new WebGLRenderer({ antialias: true });
    const clock = new Clock();
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      CAMERA_FOV,
      CAMERA_ASPECT_RATIO,
      CAMERA_NEAR_VIEW,
      CAMERA_FAR_VIEW
    );

    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    document.body.appendChild(renderer.domElement);
    renderer.setAnimationLoop(() => {
      this.world.execute(clock.getDelta(), clock.elapsedTime);
    });

    const sceneEntity = this.world.createEntity().addObject3DComponent(scene);
    const cameraEntity = this.world.createEntity().addObject3DComponent(camera, sceneEntity);

    this.rendererEntity = this.world.createEntity().addComponent(WebGLRendererComponent, {
      scene: sceneEntity,
      camera: cameraEntity,
      renderer,
    });

    console.log('=========================================');
    console.log(this.rendererEntity);
    console.log('=========================================');

    const directionalLight = new DirectionalLight(0xffffff, 1);
    const ambientLight = new AmbientLight(0x404040, 1);

    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;

    scene.add(camera);
    scene.add(directionalLight);
    scene.add(ambientLight);

    const extrudeSettings = {
      steps: 2, // Number of subdivisions
      depth: -0.1, // Depth of the extrusion (platform height)
      bevelEnabled: false, // Adds a bevel around the edges
    };

    const shape = new Shape(baseTerrainPoints.map((x) => new Vector2(x.x, x.y)));
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const material = new MeshToonMaterial({
      side: 1,
      color: new Color(0xffffff),
    });

    const terrainMesh = new Mesh(geometry, material);
    // terrainMesh.receiveShadow = true;
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.set(0, 0, 0);

    this.world
      .createEntity()
      .addObject3DComponent(terrainMesh, sceneEntity)
      .addComponent(TerrainComponent);

    scene.add(terrainMesh);
  }

  initializeLobby() {
    throw new Error('Not implemented');
  }
}
