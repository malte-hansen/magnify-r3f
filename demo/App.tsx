import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Magnify } from "magnify-r3f";

// Animated Box Component
function AnimatedBox({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotation;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[20, 20, 20]} />
      <meshNormalMaterial />
    </mesh>
  );
}

// Scene Component
function Scene() {
  return (
    <>
      {/* Set background color */}
      <color attach="background" args={["#ffffff"]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Objects */}
      <AnimatedBox position={[50, 0, 0]} rotation={0.01} />
      <AnimatedBox position={[-50, 0, 0]} rotation={-0.01} />
      <AnimatedBox position={[100, 0, 0]} rotation={0.015} />
      <AnimatedBox position={[-100, 0, 0]} rotation={-0.015} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshNormalMaterial />
      </mesh>

      <mesh position={[0, 50, 0]}>
        <torusKnotGeometry args={[8, 3, 100, 16]} />
        <meshNormalMaterial />
      </mesh>

      <mesh position={[0, -50, 0]}>
        <coneGeometry args={[10, 20, 32]} />
        <meshNormalMaterial />
      </mesh>

      {/* Camera Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}

// Main App Component
function App() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(2.0);
  const [exp, setExp] = useState(35.0);
  const [radius, setRadius] = useState(110);
  const [outlineThickness, setOutlineThickness] = useState(4);
  const [outlineColor, setOutlineColor] = useState("#555555");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (enabled) {
        setMousePos({ x: e.clientX, y: window.innerHeight - e.clientY });
      }
    };

    const handleMouseLeave = () => {
      setMousePos(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled]);

  const outlineColorHex = parseInt(outlineColor.replace("#", ""), 16);

  return (
    <>
      <Canvas camera={{ position: [0, 40, 250], fov: 45 }} gl={{ antialias: true }}>
        <Scene />
        <Magnify
          position={mousePos}
          zoom={zoom}
          exp={exp}
          radius={radius}
          outlineColor={outlineColorHex}
          outlineThickness={outlineThickness}
          antialias={true}
          enabled={enabled}
        />
      </Canvas>

      <div className="controls">
        <h3>Magnifying Glass Controls</h3>

        <div className="control-group">
          <label>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Enable
            Magnification
          </label>
        </div>

        <div className="control-group">
          <label>
            Radius: <span className="value">{radius}px</span>
          </label>
          <input type="range" min="10" max="500" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
        </div>

        <div className="control-group">
          <label>
            Zoom: <span className="value">{zoom.toFixed(1)}x</span>
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            Glass Shape (Exp): <span className="value">{exp.toFixed(0)}</span>
          </label>
          <input type="range" min="1" max="100" value={exp} onChange={(e) => setExp(Number(e.target.value))} />
        </div>

        <div className="control-group">
          <label>
            Outline Thickness: <span className="value">{outlineThickness}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={outlineThickness}
            onChange={(e) => setOutlineThickness(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Outline Color:</label>
          <input type="color" value={outlineColor} onChange={(e) => setOutlineColor(e.target.value)} />
        </div>
      </div>

      <div className="info">
        <p>
          <strong>How to use:</strong>
        </p>
        <p>• Move mouse to magnify</p>
        <p>• Drag to rotate camera</p>
        <p>• Scroll to zoom camera</p>
        <p>• Adjust controls on the right</p>
      </div>
    </>
  );
}

// Mount the app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
