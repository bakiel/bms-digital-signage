import React, { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

type ParticleBackgroundProps = {
  variant?: 'default' | 'light' | 'dark' | 'blue';
  density?: 'low' | 'medium' | 'high';
};

/**
 * Animated particle background component
 * Uses tsParticles to create an animated background with configurable options
 */
const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  variant = 'default',
  density = 'medium'
}) => {
  // Initialize the tsParticles instance
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Determine particle count based on density - increased for more visual impact
  const getParticleCount = () => {
    switch (density) {
      case 'low': return 40;
      case 'medium': return 80;
      case 'high': return 150;
      default: return 80;
    }
  };

  // Configure particle colors based on variant - enhanced with more vibrant colors
  const getParticleColors = () => {
    switch (variant) {
      case 'light': return ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#bfdbfe'];
      case 'dark': return ['#334155', '#475569', '#64748b', '#1e40af'];
      case 'blue': return ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];
      default: return ['#94a3b8', '#cbd5e1', '#e2e8f0', '#bfdbfe', '#93c5fd'];
    }
  };

  // Configure background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'light': return '#ffffff';
      case 'dark': return '#1e293b';
      case 'blue': return '#1e3a8a';
      default: return 'transparent';
    }
  };

  // Memoize the particle configuration to prevent unnecessary re-renders
  const options = useMemo(() => {
    return {
      background: {
        color: {
          value: getBackgroundColor(),
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: getParticleColors(),
        },
        links: {
          color: getParticleColors()[0],
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: true,
          speed: 1.5, // Slightly faster movement
          straight: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: getParticleCount(),
        },
        opacity: {
          value: { min: 0.2, max: 0.6 }, // Varied opacity for more depth
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
            sync: false
          }
        },
        shape: {
          type: ["circle", "triangle", "square"] as any, // Multiple shapes for visual interest
        },
        size: {
          value: { min: 1, max: 8 }, // Increased max size for more visual impact
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
            sync: false
          }
        },
      },
      detectRetina: true,
    };
  }, [variant, density]);

  return (
    <div className="absolute inset-0 -z-10">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={options}
      />
    </div>
  );
};

export default ParticleBackground;