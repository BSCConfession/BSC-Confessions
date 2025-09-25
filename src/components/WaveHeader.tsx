import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function WaveHeader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waveGeometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const waveMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const waveRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    sceneRef.current = new THREE.Scene();
    
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    cameraRef.current = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    cameraRef.current.position.set(0, 0, 2);

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Even wider geometry with more segments for smoother waves
    waveGeometryRef.current = new THREE.PlaneGeometry(12, 0.2, 600, 1);

    const vertexShader = `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;

      // Improved wave function with multiple frequencies
      float wave(float x, float t) {
        // Base wave
        float wave1 = sin(x * 2.0 + t) * 0.15;
        
        // Fast ripples
        float wave2 = sin(x * 8.0 - t * 2.0) * 0.05;
        
        // Slow undulation
        float wave3 = sin(x * 0.5 - t * 0.5) * 0.1;
        
        // Digital glitch effect
        float glitch = step(0.98, sin(t * 10.0)) * sin(x * 50.0) * 0.02;
        
        return wave1 + wave2 + wave3 + glitch;
      }

      void main() {
        vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        float t = uTime * 0.8;
        float x = modelPosition.x;
        float elevation = wave(x, t);
        
        modelPosition.y += elevation;
        vElevation = elevation;

        gl_Position = projectionMatrix * viewMatrix * modelPosition;
      }
    `;

    const fragmentShader = `
      varying float vElevation;
      uniform float uTime;
      
      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }
      
      void main() {
        float intensity = smoothstep(0.0, 0.01, abs(vElevation));
        vec3 color = palette(vElevation + uTime * 0.1);
        float alpha = intensity * 0.8;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    waveMaterialRef.current = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    waveRef.current = new THREE.Mesh(waveGeometryRef.current, waveMaterialRef.current);
    sceneRef.current.add(waveRef.current);

    let animationFrameId: number;
    const animate = (time: number) => {
      if (waveMaterialRef.current) {
        waveMaterialRef.current.uniforms.uTime.value = time / 1000;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const newAspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.aspect = newAspect;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-40" />;
}