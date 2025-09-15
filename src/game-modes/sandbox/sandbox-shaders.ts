import * as THREE from "three";

export const toonShader = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color(0xff6600) },
    uOutlineColor: { value: new THREE.Color(0x000000) },
    uLightPosition: { value: new THREE.Vector3(10, 10, 10) },
    uViewPosition: { value: new THREE.Vector3(0, 0, 0) },
    uTime: { value: 0 },
    uOutlineWidth: { value: 0.02 },
    uCelLevels: { value: 4.0 },
  },
  vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vViewDirection = normalize(-viewPosition.xyz);
            
            gl_Position = projectionMatrix * viewPosition;
        }
    `,
  fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uOutlineColor;
        uniform vec3 uLightPosition;
        uniform vec3 uViewPosition;
        uniform float uTime;
        uniform float uOutlineWidth;
        uniform float uCelLevels;
        
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;
        
        void main() {
            vec3 normal = normalize(vNormal);
            vec3 lightDirection = normalize(uLightPosition - vWorldPosition);
            vec3 viewDirection = normalize(uViewPosition - vWorldPosition);
            
            float NdotL = max(dot(normal, lightDirection), 0.0);
            float celShade = floor(NdotL * uCelLevels) / uCelLevels;
            
            celShade = smoothstep(0.0, 1.0, celShade);
            
            float fresnel = 1.0 - max(dot(normal, viewDirection), 0.0);
            float outline = smoothstep(1.0 - uOutlineWidth, 1.0, fresnel);
            
            vec3 baseColor = uColor * (0.3 + celShade * 0.7);
            
            vec3 finalColor = mix(baseColor, uOutlineColor, outline);
            
            float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
            finalColor = mix(vec3(luminance), finalColor, 1.4);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
});
