import {
  type Group,
  type BoxGeometry,
  type Mesh,
  type MeshToonMaterial,
  type Object3DEventMap,
} from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';

export type GLTFile = GLTF & { id: string };
export type PlayerMesh =
  | Group<Object3DEventMap>
  | Mesh<BoxGeometry, MeshToonMaterial, Object3DEventMap>;
export type TerrainMesh = Mesh<any, MeshToonMaterial, Object3DEventMap>;
