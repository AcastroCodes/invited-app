import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Move, RotateCw, Maximize, Target, RefreshCw, Box } from 'lucide-react';

interface ThreeDViewportCanvasProps {
  modelUrl: string;
  activeTab?: 'object' | 'pivot';
  // Objeto 3D (Posición, Rotación y Escala en la escena)
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;

  // Pivote (Origen Base, Rotación Base, Escala Base)
  pivotX: number;
  pivotY: number;
  pivotZ: number;
  baseRotX: number;
  baseRotY: number;
  baseRotZ: number;
  baseScale: number;

  // Callbacks de cambio
  onChangeOffset?: (x: number, y: number, z: number) => void;
  onChangeRotation?: (rx: number, ry: number, rz: number) => void;
  onChangeScale3D?: (sx: number, sy: number, sz: number) => void;
  onChangePivot: (x: number, y: number, z: number) => void;
  onChangeBaseRot: (rx: number, ry: number, rz: number) => void;
  onChangeBaseScale: (scale: number) => void;
}

export const ThreeDViewportCanvas: React.FC<ThreeDViewportCanvasProps> = ({
  modelUrl,
  activeTab = 'object',
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  pivotX,
  pivotY,
  pivotZ,
  baseRotX,
  baseRotY,
  baseRotZ,
  baseScale,
  onChangeOffset,
  onChangeRotation,
  onChangeScale3D,
  onChangePivot,
  onChangeBaseRot,
  onChangeBaseScale,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [loadingModel, setLoadingModel] = useState<boolean>(true);

  // Refs para mantener sincronizados valores React en listeners de Three.js
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const baseRotXRef = useRef(baseRotX); baseRotXRef.current = baseRotX;
  const baseRotYRef = useRef(baseRotY); baseRotYRef.current = baseRotY;
  const baseRotZRef = useRef(baseRotZ); baseRotZRef.current = baseRotZ;

  const rotationXRef = useRef(rotationX); rotationXRef.current = rotationX;
  const rotationYRef = useRef(rotationY); rotationYRef.current = rotationY;
  const rotationZRef = useRef(rotationZ); rotationZRef.current = rotationZ;

  // Refs de objetos Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const containerGroupRef = useRef<THREE.Group | null>(null);
  const pivotTargetRef = useRef<THREE.Group | null>(null);
  const modelMeshRef = useRef<THREE.Object3D | null>(null);

  // Drag flag para sincronización React <-> Three.js
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Escena Three.js con Fondo de Estudio Profesional
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.05);
    sceneRef.current = scene;

    // 2. Cámara Tridimensional
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 4);

    // 3. Renderer WebGL con sombras suaves
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Luces de Estudio 3D
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-5, 4, -5);
    scene.add(fillLight);

    // 5. Rejilla Infinita 3D y Ejes XYZ Guía
    const gridHelper = new THREE.GridHelper(20, 20, 0xf59e0b, 0x334155);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Controles de Cámara (Orbit Controls)
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.target.set(0, 0, 0);

    // 7. Grupo Contenedor Principal (Ubicado en Offset X,Y,Z de la escena)
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);
    containerGroupRef.current = containerGroup;

    // Target del Pivote (Ubicado exactamente en la coordenada del Pivote X,Y,Z)
    const pivotTarget = new THREE.Group();
    containerGroup.add(pivotTarget);
    pivotTargetRef.current = pivotTarget;

    // Marcador Visual del Pivote (Esfera Dorada + Ejes XYZ interactivos)
    const pivotVisualizer = new THREE.Group();
    const pivotSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8, emissive: 0xb45309 })
    );
    const pivotAxes = new THREE.AxesHelper(0.35);
    (pivotAxes.material as THREE.Material).depthTest = false;
    pivotAxes.renderOrder = 10;
    pivotVisualizer.add(pivotSphere);
    pivotVisualizer.add(pivotAxes);
    pivotTarget.add(pivotVisualizer);

    // 8. TransformControls (Gizmo 3D)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.85;
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Deshabilitar OrbitControls mientras se arrastra el Gizmo
    transformControls.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
      isDraggingRef.current = event.value;
    });

    // Evento objectChange cuando se manipula el Gizmo en tiempo real
    transformControls.addEventListener('objectChange', () => {
      if (!isDraggingRef.current) return;

      const currentTab = activeTabRef.current;

      if (currentTab === 'object') {
        // --- MODO OBJETO 3D: Mueve el Objeto 3D y su Pivote juntos ---
        if (transformControls.mode === 'translate' && containerGroupRef.current) {
          const ox = parseFloat(containerGroupRef.current.position.x.toFixed(2));
          const oy = parseFloat(containerGroupRef.current.position.y.toFixed(2));
          const oz = parseFloat(containerGroupRef.current.position.z.toFixed(2));
          onChangeOffset?.(ox, oy, oz);
        } else if (transformControls.mode === 'rotate' && containerGroupRef.current) {
          const rx = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.x) - baseRotXRef.current);
          const ry = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.y) - baseRotYRef.current);
          const rz = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.z) - baseRotZRef.current);
          onChangeRotation?.(rx, ry, rz);
        } else if (transformControls.mode === 'scale' && containerGroupRef.current) {
          const sx = parseFloat(containerGroupRef.current.scale.x.toFixed(2));
          const sy = parseFloat(containerGroupRef.current.scale.y.toFixed(2));
          const sz = parseFloat(containerGroupRef.current.scale.z.toFixed(2));
          onChangeScale3D?.(sx, sy, sz);
        }
      } else {
        // --- MODO PIVOTE: El Objeto se queda INMÓVIL en pantalla y SOLO se desplaza el Pivote ---
        if (transformControls.mode === 'translate' && pivotTargetRef.current) {
          const px = parseFloat(pivotTargetRef.current.position.x.toFixed(2));
          const py = parseFloat(pivotTargetRef.current.position.y.toFixed(2));
          const pz = parseFloat(pivotTargetRef.current.position.z.toFixed(2));
          onChangePivot(px, py, pz);
        } else if (transformControls.mode === 'rotate' && containerGroupRef.current) {
          const rx = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.x) - rotationXRef.current);
          const ry = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.y) - rotationYRef.current);
          const rz = Math.round(THREE.MathUtils.radToDeg(containerGroupRef.current.rotation.z) - rotationZRef.current);
          onChangeBaseRot(rx, ry, rz);
        } else if (transformControls.mode === 'scale' && containerGroupRef.current) {
          const sc = parseFloat(containerGroupRef.current.scale.x.toFixed(2));
          onChangeBaseScale(sc);
        }
      }
    });

    // 9. Cargar modelo 3D (GLTF / GLB)
    setLoadingModel(true);
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (modelMeshRef.current) {
          containerGroup.remove(modelMeshRef.current);
        }

        modelMeshRef.current = model;
        containerGroup.add(model);
        model.position.set(0, 0, 0);

        // Adjuntar Gizmo según pestaña activa
        if (activeTabRef.current === 'object') {
          transformControls.attach(containerGroup);
        } else {
          if (mode === 'translate') {
            transformControls.attach(pivotTarget);
          } else {
            transformControls.attach(containerGroup);
          }
        }

        setLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error('Error cargando modelo GLTF en Three.js:', err);
        setLoadingModel(false);
      }
    );

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    // Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      transformControls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Actualizar fijación del Gizmo según Tab Activo (Objeto vs Pivote) y Modo (Translate / Rotate / Scale)
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;

    tc.setMode(mode);

    if (activeTab === 'object') {
      if (containerGroupRef.current) tc.attach(containerGroupRef.current);
    } else {
      if (mode === 'translate') {
        if (pivotTargetRef.current) tc.attach(pivotTargetRef.current);
      } else {
        if (containerGroupRef.current) tc.attach(containerGroupRef.current);
      }
    }
  }, [mode, activeTab]);

  // Sincronizar Estado React -> Escena Three.js
  useEffect(() => {
    if (isDraggingRef.current) return;

    if (containerGroupRef.current) {
      containerGroupRef.current.position.set(offsetX, offsetY, offsetZ);
      containerGroupRef.current.rotation.set(
        THREE.MathUtils.degToRad(baseRotX + rotationX),
        THREE.MathUtils.degToRad(baseRotY + rotationY),
        THREE.MathUtils.degToRad(baseRotZ + rotationZ)
      );
      containerGroupRef.current.scale.set(
        baseScale * scaleX,
        baseScale * scaleY,
        baseScale * scaleZ
      );
    }

    if (pivotTargetRef.current) {
      pivotTargetRef.current.position.set(pivotX, pivotY, pivotZ);
    }
  }, [
    pivotX, pivotY, pivotZ,
    baseRotX, baseRotY, baseRotZ, baseScale,
    offsetX, offsetY, offsetZ,
    rotationX, rotationY, rotationZ,
    scaleX, scaleY, scaleZ
  ]);

  return (
    <div className="relative w-full h-full min-h-[450px] flex-1 overflow-hidden select-none">
      {/* Contenedor DOM Canvas Three.js */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Indicador de Carga con Identidad Corporativa */}
      {loadingModel && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30" style={{ color: 'var(--primary-accent)' }}>
          <RefreshCw size={28} className="animate-spin" />
          <span className="text-xs font-extrabold tracking-wider uppercase">Cargando Viewport 3D...</span>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS GIZMO 3D FLOTANTE - ÍCONOS CON TOOLTIPS E IDENTIDAD CORPORATIVA */}
      <div
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl border shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)',
        }}
      >
        {/* BOTÓN TRASLADAR / MOVER (SÓLO ÍCONO + TOOLTIP) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setMode('translate')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              mode === 'translate'
                ? 'shadow-lg scale-105 text-white'
                : 'opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            style={{
              backgroundColor: mode === 'translate' ? 'var(--primary-accent)' : 'transparent',
            }}
          >
            <Move size={17} />
          </button>
          <div
            className="absolute left-0 top-full mt-2 hidden group-hover:flex items-center whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-xl border z-50 pointer-events-none transition-all"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {activeTab === 'object' ? 'Mover Objeto (W)' : 'Mover Pivote (W)'}
          </div>
        </div>

        {/* BOTÓN ROTAR (SÓLO ÍCONO + TOOLTIP) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setMode('rotate')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              mode === 'rotate'
                ? 'shadow-lg scale-105 text-white'
                : 'opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            style={{
              backgroundColor: mode === 'rotate' ? 'var(--primary-accent)' : 'transparent',
            }}
          >
            <RotateCw size={17} />
          </button>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex items-center whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-xl border z-50 pointer-events-none transition-all"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {activeTab === 'object' ? 'Rotar Objeto (E)' : 'Rotar Pivote (E)'}
          </div>
        </div>

        {/* BOTÓN ESCALAR (SÓLO ÍCONO + TOOLTIP) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setMode('scale')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              mode === 'scale'
                ? 'shadow-lg scale-105 text-white'
                : 'opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            style={{
              backgroundColor: mode === 'scale' ? 'var(--primary-accent)' : 'transparent',
            }}
          >
            <Maximize size={17} />
          </button>
          <div
            className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-xl border z-50 pointer-events-none transition-all"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {activeTab === 'object' ? 'Escalar Objeto (R)' : 'Escalar Pivote (R)'}
          </div>
        </div>
      </div>

      {/* LEYENDA DE INSTRUCCIONES DEL VIEWPORT CON IDENTIDAD CORPORATIVA */}
      <div
        className="absolute bottom-4 left-4 z-20 pointer-events-none border px-3 py-2 rounded-xl backdrop-blur-md text-[10px] font-medium space-y-0.5 shadow-xl transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)',
        }}
      >
        <div className="flex items-center gap-2 font-extrabold" style={{ color: 'var(--primary-accent)' }}>
          {activeTab === 'object' ? <Box size={13} /> : <Target size={13} />}
          <span>
            {activeTab === 'object'
              ? 'Modo Objeto 3D: Mueve el objeto 3D y su pivote juntos'
              : 'Modo Pivote: Mueve los ejes del Pivote exactamente a donde lo sueltes'}
          </span>
        </div>
        <div className="opacity-75" style={{ color: 'var(--text-muted)' }}>
          🖱️ Arrastra las flechas del Gizmo para calibrar en pantalla | Orbitar vista con ratón
        </div>
      </div>
    </div>
  );
};
