'use client '

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Hammer, Lock, Zap, Terminal, Loader2, Database, Cloud, Globe } from 'lucide-react';
import Image from 'next/image'


/**
 * SHOCKED FUTURE - Under Construction Experience
 * * Tech Stack:
 * - React (UI Logic)
 * - Three.js (3D Galaxy Visualization - loaded via CDN)
 * - Tailwind CSS (Styling & Animation)
 */

// Declare THREE on the window object since we are loading it via script tag
declare global {
  interface Window {
    THREE: any;
  }
}

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  status: string;
  color: string;
}

export default function App() {
  const [threeLoaded, setThreeLoaded] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load Three.js dynamically
  useEffect(() => {
    if (window.THREE) {
      setThreeLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setThreeLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Galaxy Scene
  useEffect(() => {
    if (!threeLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    let scene: any, camera: any, renderer: any, particles: any, animationId: number;

    const init = () => {
      // Scene Setup
      scene = new THREE.Scene();
      // Add subtle fog for depth
      scene.fog = new THREE.FogExp2(0x000000, 0.001);

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 30;
      camera.position.y = 10;
      camera.lookAt(0, 0, 0);

      // Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Galaxy Parameters
      const parameters = {
        count: 15000,
        size: 0.05,
        radius: 40,
        branches: 5,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ff00ff', // Shocked Magenta
        outsideColor: '#00ffff' // Future Cyan
      };

      // Geometry & Material
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY; // Flattened galaxy
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation Loop
      const clock = new THREE.Clock();

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate Galaxy
        particles.rotation.y = elapsedTime * 0.05;
        
        // Gentle wave effect
        particles.position.y = Math.sin(elapsedTime * 0.2) * 1;

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };

      animate();
    };

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    init();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (scene) {
        scene.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
      }
    };
  }, [threeLoaded]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none">
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0 opacity-80"
      />
      
      {/* Overlay Gradient for readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 via-transparent to-black/80 z-0 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        
        {/* Loading State */}
        {!threeLoaded && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-cyan-400 font-mono tracking-widest text-sm">INITIALIZING GALAXY CORE...</p>
          </div>
        )}

        {/* Content Card */}
        <div className={`transition-all duration-1000 transform ${threeLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} max-w-4xl w-full`}>
          
          {/* Header Section: SVG Logo Area */}
          <div className="flex justify-center mb-12 relative group">
             <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            {/* SVG Logo Placeholder */}
            <div className="relative w-24 h-24 md:w-32 md:h-32">
               <Image src="/logo.svg" width={"527"} height={"93"} alt="Shocked Future Logo" />
            </div>
          </div>
          
          <div className="text-center mb-8">
             <p className="text-cyan-400 font-mono text-sm md:text-lg tracking-[0.3em] uppercase opacity-80 animate-pulse">
              System Rebuild Initiated
            </p>
          </div>

          {/* Main Glass Panel */}
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              
              {/* Left Column: Status Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-pink-500 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold tracking-wider text-xs uppercase">Critical Infrastructure Update</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  We are <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">evolving</span> the grid.
                </h2>
                
                <p className="text-gray-400 leading-relaxed">
                  Shocked Future is completely overhauling our digital infrastructure. All standard functionalities are temporarily suspended while we rebuild from the atom up.
                </p>

                {/* Tech Stack Integration Badge */}
                <div className="border-l-2 border-cyan-500/50 pl-4 py-2 mt-4">
                  <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2 font-mono">Powered by</p>
                  <div className="flex flex-wrap gap-3 text-gray-300 text-sm">
                    <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-green-400"/> Supabase</span>
                    <span className="flex items-center gap-1.5"><Cloud className="w-3 h-3 text-blue-400"/> Google Workspace</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-white"/> Vercel</span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-3 pt-4">
                  <StatusItem icon={<Lock className="w-4 h-4" />} label="Security Protocols" status="Upgrading..." color="text-yellow-400" />
                  <StatusItem icon={<Zap className="w-4 h-4" />} label="Core Systems" status="Offline" color="text-red-500" />
                  <StatusItem icon={<Hammer className="w-4 h-4" />} label="Reconstruction" status="In Progress" color="text-cyan-400" />
                </div>
              </div>

              {/* Right Column: Terminal Only (Expanded) */}
              <div className="space-y-6 flex flex-col justify-center h-full">
                
                {/* Mock Terminal */}
                <div className="bg-black/80 rounded-lg border border-white/10 p-5 font-mono text-xs md:text-sm h-full min-h-[250px] overflow-hidden relative shadow-inner flex flex-col">
                  <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2">
                    <Terminal className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">sys_admin@shocked_future:~/root</span>
                  </div>
                  <div className="space-y-3 text-gray-300 flex-grow">
                    <p><span className="text-green-500">➜</span> git remote set-url origin git@vercel:shocked-future</p>
                    <p className="opacity-75"><span className="text-blue-500">ℹ</span> [INFO] Initializing Supabase client...</p>
                    <p className="opacity-75 pl-4 text-green-400">✓ Database connection established</p>
                    <p className="opacity-75"><span className="text-blue-500">ℹ</span> [INFO] Syncing Google Workspace directories...</p>
                    <p className="opacity-75 pl-4 text-green-400">✓ Auth tokens verified</p>
                    <p className="opacity-75"><span className="text-yellow-500">⚠</span> [WARN] Public access restricted</p>
                    <p className="opacity-100"><span className="text-green-500">➜</span> deploying_new_era...</p>
                    <div className="flex items-center space-x-2 text-cyan-400 animate-pulse mt-2">
                      <span>_</span>
                    </div>
                  </div>
                  {/* Scanline effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 animate-scanline pointer-events-none"></div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 flex justify-between items-center text-xs text-gray-600 font-mono">
            <p>ID: SF-2025-V2</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Discord</a>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

const StatusItem: React.FC<StatusItemProps> = ({ icon, label, status, color }) => (
  <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2 border border-white/5">
    <div className="flex items-center space-x-3 text-gray-300">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-xs font-mono font-bold ${color} animate-pulse`}>
      [{status}]
    </span>
  </div>
);