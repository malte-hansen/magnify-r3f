import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import FXAAShaderFrag from "./shaders/FXAAShaderFrag.glsl";
import FXAAShaderVert from "./shaders/FXAAShaderVert.glsl";
import MagnifyingShaderFrag from "./shaders/MagnifyingShaderFrag.glsl";
import MagnifyingShaderVert from "./shaders/MagnifyingShaderVert.glsl";

export interface MagnifyProps {
  /** Position of the magnifying glass in client coordinates. If null, magnification is disabled */
  position?: { x: number; y: number } | null;
  /** Zoom factor of the magnifying glass. Default: 2.0 */
  zoom?: number;
  /** Exponent used to calculate the glass' shape. Higher exp value means flatter glass shape. Default: 35.0 */
  exp?: number;
  /** Radius of the magnifying glass in pixels. Default: 100.0 */
  radius?: number;
  /** Color of the glass' outline. Default: 0xcccccc */
  outlineColor?: number;
  /** Thickness of the glass' outline in pixels. Can be set to 0. Default: 8.0 */
  outlineThickness?: number;
  /** Whether to add an antialiasing pass or not. Default: true */
  antialias?: boolean;
  /** Enable/disable the magnifying effect. Default: true */
  enabled?: boolean;
}

/**
 * Magnify component for React Three Fiber
 *
 * This component creates a magnifying glass effect that follows the mouse position
 * and renders a zoomed view of the scene underneath.
 *
 * @example
 * ```tsx
 * import { Magnify } from 'magnify-r3f';
 *
 * function Scene() {
 *   const [mousePos, setMousePos] = useState(null);
 *
 *   useEffect(() => {
 *     const handleMouseMove = (e) => {
 *       setMousePos({ x: e.clientX, y: window.innerHeight - e.clientY });
 *     };
 *     window.addEventListener('mousemove', handleMouseMove);
 *     return () => window.removeEventListener('mousemove', handleMouseMove);
 *   }, []);
 *
 *   return (
 *     <Canvas>
 *       <mesh>
 *         <boxGeometry />
 *         <meshNormalMaterial />
 *       </mesh>
 *       <Magnify position={mousePos} zoom={3} radius={120} />
 *     </Canvas>
 *   );
 * }
 * ```
 */
export function Magnify({
  position = null,
  zoom = 2.0,
  exp = 35.0,
  radius = 100.0,
  outlineColor = 0xcccccc,
  outlineThickness = 8.0,
  antialias = true,
  enabled = true,
}: MagnifyProps) {
  const { gl, scene, camera, size } = useThree();

  // Create render targets
  const defaultTarget = useRef<THREE.WebGLRenderTarget>();
  const zoomTarget = useRef<THREE.WebGLRenderTarget>();
  const fxaaTarget = useRef<THREE.WebGLRenderTarget>();

  // Create materials and scenes
  const magnifyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: MagnifyingShaderVert,
      fragmentShader: MagnifyingShaderFrag,
      uniforms: {
        zoomedTexture: { value: null },
        originalTexture: { value: null },
        pos: { value: new THREE.Vector2() },
        outlineColor: { value: new THREE.Vector3() },
        mag_resolution: { value: new THREE.Vector2() },
        resolution: { value: new THREE.Vector2() },
        zoom: { value: zoom },
        radius: { value: radius },
        outlineThickness: { value: outlineThickness },
        exp: { value: exp },
      },
      transparent: true,
    });
  }, []);

  const fxaaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FXAAShaderVert,
      fragmentShader: FXAAShaderFrag,
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() },
      },
      transparent: true,
    });
  }, []);

  const magnifyScene = useMemo(() => {
    const scene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), magnifyMaterial);
    scene.add(quad);
    return scene;
  }, [magnifyMaterial]);

  const fxaaScene = useMemo(() => {
    const scene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fxaaMaterial);
    scene.add(quad);
    return scene;
  }, [fxaaMaterial]);

  const orthoCamera = useMemo(() => {
    return new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }, []);

  const outlineColorObj = useMemo(() => new THREE.Color(), []);

  // Initialize render targets
  useEffect(() => {
    const pixelRatio = gl.getPixelRatio();
    const width = size.width * pixelRatio;
    const height = size.height * pixelRatio;

    // Create render targets with proper settings to preserve background
    const targetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    };

    defaultTarget.current = new THREE.WebGLRenderTarget(width, height, targetOptions);
    zoomTarget.current = new THREE.WebGLRenderTarget(width, height, targetOptions);
    fxaaTarget.current = new THREE.WebGLRenderTarget(width, height, targetOptions);

    return () => {
      defaultTarget.current?.dispose();
      zoomTarget.current?.dispose();
      fxaaTarget.current?.dispose();
    };
  }, [gl, size]);

  // Update render target sizes when window resizes
  useEffect(() => {
    if (!defaultTarget.current || !zoomTarget.current || !fxaaTarget.current) return;

    const pixelRatio = gl.getPixelRatio();
    const width = size.width * pixelRatio;
    const height = size.height * pixelRatio;

    defaultTarget.current.setSize(width, height);
    zoomTarget.current.setSize(width, height);
    fxaaTarget.current.setSize(width, height);
  }, [size, gl]);

  // Update uniforms when props change
  useEffect(() => {
    magnifyMaterial.uniforms.zoom.value = zoom;
    magnifyMaterial.uniforms.exp.value = exp;
  }, [magnifyMaterial, zoom, exp]);

  useFrame(() => {
    if (!enabled || !position || !defaultTarget.current || !zoomTarget.current || !fxaaTarget.current) {
      // When disabled, render the scene normally to screen
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    const pixelRatio = gl.getPixelRatio();
    const pos = {
      x: position.x * pixelRatio,
      y: position.y * pixelRatio,
    };

    let width = size.width * pixelRatio;
    let height = size.height * pixelRatio;

    const maxViewportWidth = gl.getContext().getParameter(gl.getContext().MAX_VIEWPORT_DIMS)[0];
    const maxViewportHeight = gl.getContext().getParameter(gl.getContext().MAX_VIEWPORT_DIMS)[1];

    // Calculate resolution for the zoomed render target
    // If zoomed dimensions exceed GPU limits, scale down appropriately
    let resWidth = width;
    let resHeight = height;

    const zoomedWidth = width * zoom;
    const zoomedHeight = height * zoom;

    if (zoomedWidth > maxViewportWidth || zoomedHeight > maxViewportHeight) {
      // Calculate scale factor to fit within GPU limits while maintaining aspect ratio
      const scaleX = maxViewportWidth / zoomedWidth;
      const scaleY = maxViewportHeight / zoomedHeight;
      const scale = Math.min(scaleX, scaleY);

      resWidth = width * scale;
      resHeight = height * scale;
    }

    // Update shader uniforms
    magnifyMaterial.uniforms.zoomedTexture.value = zoomTarget.current.texture;
    magnifyMaterial.uniforms.originalTexture.value = defaultTarget.current.texture;
    magnifyMaterial.uniforms.pos.value.set(pos.x, pos.y);
    magnifyMaterial.uniforms.outlineColor.value = outlineColorObj.set(outlineColor);
    magnifyMaterial.uniforms.mag_resolution.value.set(resWidth, resHeight);
    magnifyMaterial.uniforms.resolution.value.set(width, height);
    magnifyMaterial.uniforms.zoom.value = zoom;
    magnifyMaterial.uniforms.radius.value = radius * pixelRatio;
    magnifyMaterial.uniforms.outlineThickness.value = outlineThickness * pixelRatio;
    magnifyMaterial.uniforms.exp.value = exp;

    // Calculate zoomed viewport
    const zoomedViewport = [
      (-pos.x * (zoom - 1) * width) / resWidth,
      (-pos.y * (zoom - 1) * height) / resHeight,
      ((width * width) / resWidth) * zoom,
      ((height * height) / resHeight) * zoom,
    ];

    zoomTarget.current.viewport.set(zoomedViewport[0], zoomedViewport[1], zoomedViewport[2], zoomedViewport[3]);

    const autoClearBackup = gl.autoClear;
    gl.autoClear = true;

    // Store the original clear color and set the scene background or white
    const originalClearColor = gl.getClearColor(new THREE.Color());
    const originalClearAlpha = gl.getClearAlpha();

    // Get the scene's background color or default to white
    let clearColor: THREE.Color;
    if (scene.background instanceof THREE.Color) {
      clearColor = scene.background;
    } else {
      clearColor = new THREE.Color(0xffffff); // Default to white
    }
    gl.setClearColor(clearColor, 1.0);

    // Render original scene to default target
    gl.setRenderTarget(defaultTarget.current);
    gl.render(scene, camera);

    // Render zoomed scene to zoom target
    gl.setRenderTarget(zoomTarget.current);
    gl.render(scene, camera);

    // Restore original clear color
    gl.setClearColor(originalClearColor, originalClearAlpha);

    // Apply magnify effect (with optional FXAA)
    if (antialias) {
      fxaaMaterial.uniforms.tDiffuse.value = fxaaTarget.current.texture;
      fxaaMaterial.uniforms.resolution.value.set(1 / width, 1 / height);

      gl.setRenderTarget(fxaaTarget.current);
      gl.render(magnifyScene, orthoCamera);

      gl.setRenderTarget(null);
      gl.render(fxaaScene, orthoCamera);
    } else {
      gl.setRenderTarget(null);
      gl.render(magnifyScene, orthoCamera);
    }

    gl.autoClear = autoClearBackup;
  }, 1); // Priority 1 to render after the main scene

  return null;
}
