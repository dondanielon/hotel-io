import * as THREE from "three/webgpu";

export const CAMERA_ASPECT_RATIO = window.innerWidth / window.innerHeight;
export const CAMERA_FAR_VIEW = 1000;
export const CAMERA_FOV = 40;
export const CAMERA_NEAR_VIEW = 0.1;
export const CAMERA_X_POSITION_ADD = 0;
export const CAMERA_Y_POSITION_ADD = 15;
export const CAMERA_Z_POSITION_ADD = 15;

export const COLLISION_RADIUS_PLAYER = 0.25;
export const COLLISION_RADIUS_S_ENEMY = 0.4;
export const COLLISION_RADIUS_M_ENEMY = 0.65;
export const COLLISION_RADIUS_L_ENEMY = 0.9;
export const COLLISION_RADIUS_PROJECTILE = 0.25;
export const COLLISION_MELEE_RANGE = 1.5;
export const COLLISION_ABILITY_RANGE_SHORT = 4;
export const COLLISION_ABILITY_RANGE_MEDIUM = 8;
export const COLLISION_ABILITY_RANGE_LONG = 12;
export const COLLISION_ABILITY_RANGE_ULTRA = 16;
export const COLLISION_ABILITY_DAMAGE_S_ENEMY = 10;
export const COLLISION_ABILITY_DAMAGE_M_ENEMY = 20;
export const COLLISION_ABILITY_DAMAGE_L_ENEMY = 30;
export const COLLISION_ABILITY_DAMAGE_ULTRA = 40;
export const COLLISION_PROJECTILE_SPEED = 20;
export const COLLISION_WORLD_BOUNDS_MIN_X = -5;
export const COLLISION_WORLD_BOUNDS_MAX_X = 5;
export const COLLISION_WORLD_BOUNDS_MIN_Z = -5;
export const COLLISION_WORLD_BOUNDS_MAX_Z = 5;

export const INPUT_POINTER_COLOR = 0x00ff00;
export const INPUT_POINTER_DURATION = 1;
export const INPUT_POINTER_OFFSET = 0.01;
export const INPUT_POINTER_RADIUS = 0.1;
export const INPUT_POINTER_SEGMENTS = 15;

export const PLAYER_ANIMATION_FADE_DURATION = 0.2;
export const PLAYER_DASH_DELAY = 500;
export const PLAYER_DASH_DURATION = 0.3;
export const PLAYER_DASH_ROTATION_SPEED = 20;
export const PLAYER_DASH_SPEED = 10;
export const PLAYER_ROTATION_SPEED = 10;
export const PLAYER_SPEED = 2;

export const SETTING_SANDBOX_MAIN_CANVAS_ID = "sandbox-main";
// prettier-ignore
export const TERRAIN_DEFAULT_SANDBOX_SHAPE_POINTS = [new THREE.Vector2(0, 0),new THREE.Vector2(40, 0),new THREE.Vector2(40, 40),new THREE.Vector2(0, 40),new THREE.Vector2(0, 0),]

export const UI_CONSOLE_TAG_NAME = "cx-console";
export const UI_OBJECT_CONTEXT_MENU_TAG_NAME = "object-context-menu";
