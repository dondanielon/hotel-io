import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DirectionalLight, Vector2 } from 'three';

import { PlayerEntity } from './entities/PlayerEntity';
import { GLTFile } from './common/types';
import { TerrainEntity } from './entities/TerrainEntity';
import {
  LIGHT_CAST_SHADOW,
  LIGHT_COLOR,
  LIGHT_INTENSITY,
  LIGHT_POSITION_X,
  LIGHT_POSITION_Y,
  LIGHT_POSITION_Z,
  LIGHT_SHADOW_CAMERA_BOTTOM,
  LIGHT_SHADOW_CAMERA_FAR,
  LIGHT_SHADOW_CAMERA_LEFT,
  LIGHT_SHADOW_CAMERA_NEAR,
  LIGHT_SHADOW_CAMERA_RIGHT,
  LIGHT_SHADOW_CAMERA_TOP,
  LIGHT_SHADOW_RESOLUTION,
  SYSTEM_DEFAULT_ENTITY_ROTATION,
  SYSTEM_PLAYERS_DEBUG,
} from './common/constants';

const terrainMetadata = {
  startPosition: { x: 0, y: 0, z: 0 },
  points: ['0:0', '10:0', '10:10', '20:10', '20:20', '0:20', '0:0'],
};

const playersList = [
  {
    id: 'c7fed61a-d869-4a51-bf18-51281121d13c',
    modelPath: '/models/female-warrior.glb',
  },
];

// In the future we will fetch the players list from a database
export async function setupPlayers(): Promise<PlayerEntity[]> {
  const loader = new GLTFLoader();
  const loadModel = (id: string, path: string) => {
    return new Promise<GLTFile>((resolve, reject) => {
      loader.load(
        path,
        (data) => resolve({ ...data, id }),
        undefined,
        (err) => reject(err)
      );
    });
  };

  /**
   * TODO: Check if there are duplicate model paths in
   * the player list, to prevent loading > 1 of the same model
   */
  const models = await Promise.all(
    playersList.map((player) => {
      return loadModel(player.id, player.modelPath);
    })
  );

  return models.map(
    (model) => new PlayerEntity(model, terrainMetadata.startPosition, SYSTEM_PLAYERS_DEBUG)
  );
}

export function setupTerrain(): Promise<TerrainEntity> {
  return Promise.resolve(
    new TerrainEntity({
      rotation: SYSTEM_DEFAULT_ENTITY_ROTATION,
      points: terrainMetadata.points.map((point) => {
        const [x, y] = point.split(':');
        return new Vector2(Number(x), Number(y));
      }),
    })
  );
}

export function setupLighting(): DirectionalLight {
  const directionalLight = new DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
  const shadowCamera = directionalLight.shadow.camera;

  directionalLight.position.set(LIGHT_POSITION_X, LIGHT_POSITION_Y, LIGHT_POSITION_Z);
  directionalLight.castShadow = LIGHT_CAST_SHADOW;
  directionalLight.shadow.mapSize.width = LIGHT_SHADOW_RESOLUTION;
  directionalLight.shadow.mapSize.height = LIGHT_SHADOW_RESOLUTION;
  shadowCamera.left = LIGHT_SHADOW_CAMERA_LEFT;
  shadowCamera.right = LIGHT_SHADOW_CAMERA_RIGHT;
  shadowCamera.top = LIGHT_SHADOW_CAMERA_TOP;
  shadowCamera.bottom = LIGHT_SHADOW_CAMERA_BOTTOM;
  shadowCamera.near = LIGHT_SHADOW_CAMERA_NEAR;
  shadowCamera.far = LIGHT_SHADOW_CAMERA_FAR;

  return directionalLight;
}
