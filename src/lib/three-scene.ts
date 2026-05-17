import * as THREE from 'three';

export interface ThreeSceneConfig {
  backgroundColor: string;
  particleColor: string;
  bubbleWidthPercent: number;
}

const DEFAULT_CONFIG: ThreeSceneConfig = {
  backgroundColor: '#201d1d',
  particleColor: '#9a9898',
  bubbleWidthPercent: 0.15,
};

export function initThreeScene(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  config: Partial<ThreeSceneConfig> = {},
): () => void {
  const settings = { ...DEFAULT_CONFIG, ...config };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(settings.backgroundColor);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const bubble = createBubble();
  scene.add(bubble);

  const surfaceGeometry = bubble.geometry;
  const originalPositions = new Float32Array(surfaceGeometry.attributes.position.array);

  const particles = createParticles(settings.particleColor);
  scene.add(particles);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
  pointLight.position.set(3, 3, 4);
  scene.add(pointLight);

  let isDragging = false;
  let targetRotation = { x: 0, y: 0 };
  let isRunning = true;

  let bubbleTargetPos = new THREE.Vector3(0, 0, 0);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  const cursorWorldPos = new THREE.Vector3();
  let hasCursor = false;
  let cursorForce = new THREE.Vector3();

  const currentPositions = new Float32Array(originalPositions);
  const velocities = new Float32Array(originalPositions.length);

  function updateMouse(event: MouseEvent | Touch) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function getWorldPoint(event: MouseEvent | Touch): THREE.Vector3 | null {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(bubble);
    if (intersects.length > 0) {
      return intersects[0].point.clone();
    }
    return null;
  }

  function updateCursorDeformation() {
    const positions = surfaceGeometry.attributes.position.array as Float32Array;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      vertex.set(
        originalPositions[i],
        originalPositions[i + 1],
        originalPositions[i + 2],
      );

      let targetX = originalPositions[i];
      let targetY = originalPositions[i + 1];
      let targetZ = originalPositions[i + 2];

      if (hasCursor) {
        const dist = vertex.distanceTo(cursorWorldPos);
        const radius = 2.5;

        if (dist < radius) {
          const influence = Math.pow(1 - dist / radius, 2);
          const direction = vertex.clone().sub(cursorWorldPos).normalize();

          const pushStrength = isDragging ? 1.2 : 0.6;
          const pullStrength = isDragging ? 0.8 : 0.3;

          targetX += direction.x * influence * pushStrength + cursorForce.x * influence * pullStrength;
          targetY += direction.y * influence * pushStrength + cursorForce.y * influence * pullStrength;
          targetZ += direction.z * influence * pushStrength + cursorForce.z * influence * pullStrength;
        }
      }

      const springK = 0.03;
      const damping = 0.92;

      velocities[i] += (targetX - currentPositions[i]) * springK;
      velocities[i + 1] += (targetY - currentPositions[i + 1]) * springK;
      velocities[i + 2] += (targetZ - currentPositions[i + 2]) * springK;

      velocities[i] *= damping;
      velocities[i + 1] *= damping;
      velocities[i + 2] *= damping;

      currentPositions[i] += velocities[i];
      currentPositions[i + 1] += velocities[i + 1];
      currentPositions[i + 2] += velocities[i + 2];

      positions[i] = currentPositions[i];
      positions[i + 1] = currentPositions[i + 1];
      positions[i + 2] = currentPositions[i + 2];
    }

    surfaceGeometry.attributes.position.needsUpdate = true;
    surfaceGeometry.computeVertexNormals();
  }

  function updateColor(currentTime: number) {
    const hue = (Math.sin(currentTime * 0.0003) + 1) / 2;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
    (bubble.material as THREE.MeshPhysicalMaterial).color.copy(color);
  }

  const onMouseMove = (event: MouseEvent) => {
    updateMouse(event);

    if (isDragging) {
      const deltaX = event.clientX - (event as any).previousX || 0;
      const deltaY = event.clientY - (event as any).previousY || 0;
      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;
    }

    (event as any).previousX = event.clientX;
    (event as any).previousY = event.clientY;

    const worldPoint = getWorldPoint(event);
    if (worldPoint) {
      hasCursor = true;
      cursorWorldPos.copy(worldPoint);
      cursorForce.set(
        event.movementX * 0.005,
        -event.movementY * 0.005,
        0,
      );
    } else {
      hasCursor = false;
      cursorForce.set(0, 0, 0);
    }
  };

  const onMouseDown = (event: MouseEvent) => {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(bubble);

    if (intersects.length > 0) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    canvas.style.cursor = 'default';
  };

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    updateBubbleSize();
  };

  function updateBubbleSize() {
    const fovRad = camera.fov * (Math.PI / 180);
    const visibleHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const targetRadius = (visibleWidth * settings.bubbleWidthPercent) / 2;
    bubble.scale.setScalar(targetRadius);
  }

  updateBubbleSize();

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const worldPoint = getWorldPoint(touch);
      if (worldPoint) {
        isDragging = true;
        hasCursor = true;
        cursorWorldPos.copy(worldPoint);
        (event as any).previousX = touch.clientX;
        (event as any).previousY = touch.clientY;
      }
    }
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const prevX = (event as any).previousX || touch.clientX;
      const prevY = (event as any).previousY || touch.clientY;
      const deltaX = touch.clientX - prevX;
      const deltaY = touch.clientY - prevY;

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;

      (event as any).previousX = touch.clientX;
      (event as any).previousY = touch.clientY;

      const worldPoint = getWorldPoint(touch);
      if (worldPoint) {
        hasCursor = true;
        cursorWorldPos.copy(worldPoint);
        cursorForce.set(deltaX * 0.005, -deltaY * 0.005, 0);
      }
    }
  };

  const onTouchEnd = () => {
    isDragging = false;
    hasCursor = false;
    cursorForce.set(0, 0, 0);
  };

  const onBubbleHover = (event: Event) => {
    const section = (event as CustomEvent).detail;
    const sectionMap: Record<string, THREE.Vector3> = {
      'About': new THREE.Vector3(-0.7, 0.5, 0),
      'Skills': new THREE.Vector3(0.7, 0.5, 0),
      'Experience': new THREE.Vector3(-0.85, 0, 0),
      'Projects': new THREE.Vector3(0.85, 0, 0),
      'Contact': new THREE.Vector3(0, -0.7, 0),
    };
    if (sectionMap[section]) {
      bubbleTargetPos.copy(sectionMap[section]);
    }
  };

  const onBubbleHoverEnd = () => {
    bubbleTargetPos.set(0, 0, 0);
  };

  function animate() {
    if (!isRunning) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();

    bubble.rotation.x += (targetRotation.x - bubble.rotation.x) * 0.05;
    bubble.rotation.y += (targetRotation.y - bubble.rotation.y) * 0.05;

    bubble.position.x += (bubbleTargetPos.x - bubble.position.x) * 0.05;
    bubble.position.y += (bubbleTargetPos.y - bubble.position.y) * 0.05;
    bubble.position.z += (bubbleTargetPos.z - bubble.position.z) * 0.05;

    if (!isDragging) {
      bubble.rotation.x += 0.001;
      bubble.rotation.y += 0.002;
    }

    updateCursorDeformation();
    updateColor(currentTime);

    const particlePositions = particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i] += Math.sin(currentTime * 0.001 + i) * 0.0002;
      particlePositions[i + 1] += Math.cos(currentTime * 0.001 + i) * 0.0002;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', onResize);
  window.addEventListener('bubble-hover', onBubbleHover);
  window.addEventListener('bubble-hover-end', onBubbleHoverEnd);

  animate();

  return () => {
    isRunning = false;
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('bubble-hover', onBubbleHover);
    window.removeEventListener('bubble-hover-end', onBubbleHoverEnd);
    renderer.dispose();
  };
}

function createBubble(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x007aff,
    transparent: true,
    opacity: 0.85,
    metalness: 0.3,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function createParticles(color: string): THREE.Points {
  const count = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
  });

  return new THREE.Points(geometry, material);
}
