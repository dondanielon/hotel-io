import { PlaneGeometry, type BoxGeometry, type Mesh, type MeshToonMaterial, type Object3DEventMap } from 'three';

export type PlayerMesh = Mesh<BoxGeometry, MeshToonMaterial, Object3DEventMap>;
export type TerrainMesh = Mesh<PlaneGeometry, MeshToonMaterial, Object3DEventMap>;
