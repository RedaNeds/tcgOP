'use client';

import React, { useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  rarity?: 'SR' | 'SEC' | 'PARA' | 'DEFAULT';
}

export function HoloCard({ children, className = '', rarity = 'DEFAULT' }: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 150, damping: 20 });

  // Shine position based on cursor
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const shineOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to card center for tilt
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);

    // Calculate cursor position in percentage for shine
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    mouseX.set(px);
    mouseY.set(py);
    
    shineOpacity.set(1);
  }, [x, y, mouseX, mouseY, shineOpacity]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    shineOpacity.set(0);
  }, [x, y, shineOpacity]);

  // Glow color based on rarity
  const getGlowColor = () => {
    switch(rarity) {
      case 'SEC': return 'rgba(255, 0, 255, 0.15)';
      case 'SR': return 'rgba(245, 158, 11, 0.15)';
      case 'PARA': return 'rgba(34, 211, 238, 0.15)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative group ${className}`}
    >
      {/* Rarity Glow */}
      <div 
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-0 group-hover:opacity-100 blur-2xl pointer-events-none"
        style={{ backgroundColor: getGlowColor() }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 glass-card rounded-[inherit] overflow-hidden">
        {children}
        
        {/* Holographic Shine Overlay */}
        <motion.div 
          style={{
            opacity: shineOpacity,
            background: useTransform(
              [mouseX, mouseY],
              ([mx, my]: number[]) => `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%), 
                             linear-gradient(${(mx as number) + (my as number)}deg, transparent 0%, rgba(255,0,255,0.1) 20%, rgba(0,255,255,0.1) 40%, rgba(255,255,255,0.2) 50%, rgba(0,255,255,0.1) 60%, rgba(255,0,255,0.1) 80%, transparent 100%)`
            )
          }}
          className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
        />
      </div>
    </motion.div>
  );
}
