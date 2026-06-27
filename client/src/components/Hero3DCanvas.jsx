import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// Lazy-load Canvas and Drei components to keep bundle size small on initial paint
const Canvas = React.lazy(() => import("@react-three/fiber").then(m => ({ default: m.Canvas })));
const useFrame = (...args) => {
  const [frameHook, setFrameHook] = useState(null);
  useEffect(() => {
    import("@react-three/fiber").then(m => setFrameHook(() => m.useFrame));
  }, []);
  return frameHook ? frameHook(...args) : null;
};

// Fabric ribbon mesh deformed dynamically inside WebGL loop
const FabricRibbon = ({ color, speed = 0.4, amplitude = 0.35, frequency = 0.7, offset = 0, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], R3F }) => {
  const meshRef = useRef();
  
  // Cache base coordinates
  const initialPositions = useMemo(() => {
    const tempGeom = new THREE.PlaneGeometry(8, 3, 64, 32);
    const pos = tempGeom.attributes.position.clone();
    tempGeom.dispose();
    return pos;
  }, []);

  R3F.useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speed + offset;
    const geom = meshRef.current.geometry;
    const posAttr = geom.attributes.position;
    
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(initialPositions, i);
      
      // Undulate along length (x) and width (y) using sine/cosine curves
      const waveZ = Math.sin(v.x * frequency + time) * amplitude * Math.cos(v.y * 0.4 - time * 0.5);
      const waveY = Math.sin(v.x * (frequency * 0.6) - time * 0.7) * (amplitude * 0.3);
      
      posAttr.setZ(i, v.z + waveZ);
      posAttr.setY(i, v.y + waveY);
    }
    
    posAttr.needsUpdate = true;
    geom.computeVertexNormals();
    
    // Idle rotation
    meshRef.current.rotation.y = rotation[1] + Math.sin(time * 0.08) * 0.04;
    meshRef.current.rotation.x = rotation[0] + Math.cos(time * 0.05) * 0.03;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <planeGeometry args={[8, 3, 64, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.3}
        metalness={0.05}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
        sheen={1.0}
        sheenRoughness={0.4}
        sheenColor="#DFCDAB"
        side={THREE.DoubleSide}
        flatShading={false}
      />
    </mesh>
  );
};

// Floating background geometry drifting with scroll and mouse movement
const FloatingBackground = ({ mouseX, mouseY, R3F }) => {
  const groupRef = useRef();
  
  const shapes = useMemo(() => {
    const temp = [];
    const colors = ["#C8A97E", "#DFCDAB", "#B69466", "#FAF8F5"];
    for (let i = 0; i < 12; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          -4 - Math.random() * 5,
        ],
        scale: 0.2 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.6 ? "torus" : Math.random() > 0.3 ? "sphere" : "octahedron",
        speed: 0.15 + Math.random() * 0.25,
        rotSpeed: 0.1 + Math.random() * 0.2,
      });
    }
    return temp;
  }, []);

  R3F.useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Parallax mouse follow
    const targetX = mouseX.current * 0.08;
    const targetY = mouseY.current * 0.08;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);

    groupRef.current.children.forEach((child, idx) => {
      const shape = shapes[idx];
      if (!shape) return;
      
      // Floating sinusoidal sway
      child.position.y = shape.position[1] + Math.sin(time * shape.speed + idx) * 0.4;
      child.position.x = shape.position[0] + Math.cos(time * (shape.speed * 0.7) + idx) * 0.3;
      
      // Idle rotate
      child.rotation.x += shape.rotSpeed * 0.005;
      child.rotation.y += shape.rotSpeed * 0.008;
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, idx) => (
        <mesh key={idx} position={shape.position} scale={shape.scale}>
          {shape.type === "torus" ? (
            <torusGeometry args={[1, 0.3, 12, 24]} />
          ) : shape.type === "sphere" ? (
            <sphereGeometry args={[1, 16, 16]} />
          ) : (
            <octahedronGeometry args={[1]} />
          )}
          <meshPhysicalMaterial
            color={shape.color}
            roughness={0.4}
            metalness={0.1}
            transmission={0.4}
            thickness={0.5}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Lights that track the pointer coordinates smoothly
const MouseFollowLight = ({ mouseX, mouseY, R3F }) => {
  const lightRef = useRef();

  R3F.useFrame(() => {
    if (!lightRef.current) return;
    const targetX = mouseX.current * 5;
    const targetY = mouseY.current * 4;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.05);
    lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.05);
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 4.5]}
      color="#C8A97E"
      intensity={7.0}
      distance={9}
      decay={1.8}
    />
  );
};

// Container for the 3D Canvas Scene
const Scene = ({ mouseX, mouseY, R3F, Drei }) => {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} color="#FAF8F5" />
      <directionalLight 
        position={[5, 8, 3]} 
        color="#C8A97E" 
        intensity={1.8} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, -2, -1]} color="#DFCDAB" intensity={0.5} />
      
      {/* Interactive mouse light */}
      <MouseFollowLight mouseX={mouseX} mouseY={mouseY} R3F={R3F} />

      {/* Floating particles */}
      {Drei && (
        <Drei.Sparkles
          count={40}
          scale={10}
          size={1.5}
          speed={0.3}
          color="#C8A97E"
          opacity={0.5}
        />
      )}

      {/* Main woven silk fabric ribbons */}
      <FabricRibbon 
        color="#FAF8F5" 
        speed={0.35} 
        amplitude={0.35} 
        frequency={0.75} 
        offset={0} 
        position={[0, 0.3, 0]}
        rotation={[0.1, 0.3, 0.05]}
        R3F={R3F}
      />
      <FabricRibbon 
        color="#C8A97E" 
        speed={0.28} 
        amplitude={0.3} 
        frequency={0.6} 
        offset={Math.PI} 
        position={[0.3, -0.4, -0.6]}
        rotation={[-0.15, -0.2, -0.08]}
        R3F={R3F}
      />

      {/* Drifting shapes */}
      <FloatingBackground mouseX={mouseX} mouseY={mouseY} R3F={R3F} />
    </>
  );
};

// 2D Premium Fallback (Low-power / Mobile / Non-WebGL)
const FallbackBackground = () => {
  const images = useMemo(() => [
    "https://res.cloudinary.com/de424yeri/image/upload/v1782326103/florinaa/cgwkv8vi5ibpp2wbkgw2.png",
    "https://res.cloudinary.com/de424yeri/image/upload/v1782323977/FFD2F591-76F6-478D-A3C0-3F02C1818EC5_pbsynv.png",
    "https://res.cloudinary.com/de424yeri/image/upload/v1782323645/702afbec-bc66-42f9-9c14-39959f898290_mymt9m.jpg",
    "https://res.cloudinary.com/de424yeri/image/upload/v1782323187/BA63DEF0-AD5F-4DD0-94F4-82862167A52A_xuquc3.png"
  ], []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 bg-primary overflow-hidden">
      {/* Sliding Images Container */}
      <div
        className="flex w-[400%] h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${index * 25}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="w-1/4 h-full relative">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover object-center brightness-[0.45] contrast-[1.05]"
            />
          </div>
        ))}
      </div>

      {/* Decorative overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/30 to-black/40 pointer-events-none" />

      {/* Floating ambient particles for depth */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[80px] top-[10%] left-[20%] animate-pulse duration-[8s] pointer-events-none" />
      <div className="absolute w-[50vw] h-[50vw] rounded-full bg-accent-light/5 blur-[100px] bottom-[15%] right-[15%] animate-pulse duration-[12s] delay-1000 pointer-events-none" />
    </div>
  );
};

// Unified Hero3D Component with Lazy loading & fallback check
export default function Hero3DCanvas({ mouseX, mouseY }) {
  const [isSupported, setIsSupported] = useState(null);
  const [R3FModules, setR3FModules] = useState(null);
  const [DreiModules, setDreiModules] = useState(null);

  // Check features on mount
  useEffect(() => {
    const hasWebGL = () => {
      try {
        const c = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
      } catch (e) {
        return false;
      }
    };

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasWebGL() || isMobile || reducedMotion) {
      setIsSupported(false);
    } else {
      // Import three-fiber and drei in background
      Promise.all([
        import("@react-three/fiber"),
        import("@react-three/drei")
      ]).then(([r3f, drei]) => {
        setR3FModules(r3f);
        setDreiModules(drei);
        setIsSupported(true);
      }).catch((err) => {
        console.error("Failed to load 3D engine:", err);
        setIsSupported(false);
      });
    }
  }, []);

  // WebGL loader screen
  if (isSupported === null) {
    return <FallbackBackground />;
  }

  // Fallback if not supported
  if (!isSupported || !R3FModules) {
    return <FallbackBackground />;
  }

  return (
    <div className="absolute inset-0 z-0">
      <Suspense fallback={<FallbackBackground />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
        >
          <Scene mouseX={mouseX} mouseY={mouseY} R3F={R3FModules} Drei={DreiModules} />
        </Canvas>
      </Suspense>
    </div>
  );
}
