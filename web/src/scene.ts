import {
  AxesHelper,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { viewportOf } from './viewport';

// Handle returned to the caller so it can stop rendering and free GPU resources.
export interface SceneView {
  dispose(): void;
}

// Mounts an empty 3D scene inside `container`: camera, lights, ground grid and axes.
// Lengths are in stitch widths (w = 1), like the solver; a 18-stitch round has r ≈ 2.9.
export function createScene(container: HTMLElement): SceneView {
  const scene = new Scene();
  scene.background = new Color(0xf4f4f4);

  // Sky/ground ambient light plus a directional "sun" for shading once meshes appear.
  scene.add(new HemisphereLight(0xffffff, 0x888888, 1.5));
  const sun = new DirectionalLight(0xffffff, 2);
  sun.position.set(5, 10, 7);
  scene.add(sun);

  // 20 × 20 stitch widths, one line per stitch width. Axes: X red, Y green, Z blue.
  scene.add(new GridHelper(20, 20, 0x999999, 0xcccccc));
  scene.add(new AxesHelper(5));

  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(12, 9, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ antialias: true });
  // Sharp on high-DPI screens, capped at 2 to keep the fill rate reasonable on mobile.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Keeps canvas size and camera ratio in sync with the panel, so nothing is stretched.
  const resize = () => {
    const { width, height, aspect } = viewportOf(container.clientWidth, container.clientHeight);
    renderer.setSize(width, height);
    camera.aspect = aspect;
    // Three.js caches the projection matrix: it must be rebuilt after changing aspect.
    camera.updateProjectionMatrix();
  };
  resize();

  // ResizeObserver watches the panel itself, not just the window: it also fires
  // when the layout changes (e.g. a future resizable split between panels).
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  // setAnimationLoop is driven by requestAnimationFrame: the browser pauses it
  // when the tab is in the background, so no CPU is spent there.
  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  return {
    dispose() {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
