import React, { useEffect, useState } from 'react';

export default function Background3D({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [activeElement, setActiveElement] = useState<number | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to center of screen from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setCoords({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate some persistent 3D nodes that slide across the background
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; size: number; speed: number; color: string }[]>([]);

  useEffect(() => {
    const initialNodes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 10,
      speed: Math.random() * 0.05 + 0.01,
      color: isLight
        ? (i % 3 === 0 ? 'rgba(59, 130, 246, 0.12)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.10)' : 'rgba(16, 185, 129, 0.10)')
        : (i % 3 === 0 ? 'rgba(59, 130, 246, 0.15)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.12)' : 'rgba(236, 72, 153, 0.08)')
    }));
    setNodes(initialNodes);

    let animationId: number;
    const update = () => {
      setNodes((prev) =>
        prev.map((node) => {
          let newX = node.x + node.speed;
          if (newX > 105) newX = -5;
          return { ...node, x: newX };
        })
      );
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [isLight]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500 ${isLight ? 'bg-slate-100' : 'bg-[#030712]'}`}>
      {/* Dynamic 3D Grid Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isLight ? '#cbd5e1' : '#1f2937'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isLight ? '#cbd5e1' : '#1f2937'} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `perspective(800px) rotateX(60deg) translateY(-100px) translateZ(-150px) translate3d(${coords.x * -20}px, ${coords.y * -20}px, 0px)`,
          transformOrigin: 'center top',
          transition: 'transform 0.1s ease-out',
          opacity: isLight ? 0.4 : 0.1
        }}
      />

      {/* Floating 3D Orbs with Mouse Lag */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-gradient-to-tr from-blue-400 to-indigo-600"
        style={{
          transform: `translate3d(${coords.x * 50}px, ${coords.y * 50}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)',
          opacity: isLight ? 0.18 : 0.1
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-purple-400 to-pink-500"
        style={{
          transform: `translate3d(${coords.x * -70}px, ${coords.y * -70}px, 0)`,
          transition: 'transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)',
          opacity: isLight ? 0.18 : 0.1
        }}
      />

      {/* Glowing Mesh Nodes in Perspective */}
      <div 
        className="absolute inset-0 perspective-1000 transform-style-3d flex items-center justify-center"
        style={{
          transform: `rotateX(${coords.y * -8}deg) rotateY(${coords.x * 8}deg)`,
          transition: 'transform 0.15s ease-out',
          opacity: isLight ? 0.25 : 0.1
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute rounded-lg border backdrop-blur-md flex items-center justify-center p-2 text-[10px] font-mono select-none ${
              isLight ? 'border-slate-300/80' : 'border-white/5'
            }`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size * 2}px`,
              height: `${node.size * 1.5}px`,
              backgroundColor: node.color,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
              transform: `translateZ(${node.size}px)`,
              transition: 'all 0.3s ease',
              borderLeft: node.id % 2 === 0 ? '2px solid rgba(59, 130, 246, 0.4)' : '2px solid rgba(139, 92, 246, 0.4)'
            }}
          >
            <div className={`flex flex-col items-start gap-1 overflow-hidden pointer-events-auto cursor-pointer ${
              isLight ? 'text-slate-700 font-semibold' : 'text-white/20'
            }`}
                 onClick={() => setActiveElement(node.id)}>
              <span className="text-blue-600 font-bold">SWANAYA_SYS_{node.id}</span>
              <span className="opacity-80 scale-90 origin-left">PERSIST: {Math.round(node.size)}%</span>
              <span className="text-emerald-600 font-bold">ONLINE</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle bottom scanline gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-90 ${
        isLight ? 'from-slate-100' : 'from-[#030712]'
      }`} />
    </div>
  );
}
