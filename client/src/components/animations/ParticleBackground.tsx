// src/components/animations/ParticleBackground.tsx
import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Use loadSlim instead of loadFull
import type { Engine } from "tsparticles-engine"; // Keep this import for Particles component

type ParticleBackgroundProps = {
  density?: 'low' | 'medium' | 'high';
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  density = 'low' // Default to low density for subtlety
}) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Initialize tsParticles engine with slim capabilities
    await loadSlim(engine);
  }, []);

  // Determine particle count based on density
  const getParticleCount = () => {
    switch (density) {
      case 'low': return 40;
      case 'medium': return 80;
      case 'high': return 150;
      default: return 80;
    }
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 z-0" // Position behind other content, ensure above gradient bg
      options={{
        background: { // Re-add explicit transparent background
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60, // Limit FPS for performance
        particles: {
          color: {
            value: ["#ffffff", "#93c5fd", "#60a5fa", "#3b82f6", "#0077cc", "#0051a3"], // Added white, reordered blues
          },
          links: {
            color: "#60a5fa", // Link color (lighter blue for visibility on dark bg)
            distance: 150,
            enable: true,
            opacity: 0.2, // Reduced link opacity
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.05
            }
          },
          move: {
            enable: true,
            random: false, // Consistent movement
            speed: 0.2,    // Reduced speed for hypnotic effect
            straight: false,
            direction: "none",
            outModes: {
              default: "bounce", // Bounce off edges
            },
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            },
            trail: {
              enable: true,
              length: 3,
              fillColor: "#f8fafc"
            }
          },
          number: {
            density: {
              enable: true,
              area: 800, // Density area
            },
            value: getParticleCount(), // Dynamic based on density prop
          },
          opacity: {
            value: { min: 0.1, max: 0.4 }, // Reduced particle opacity range
            animation: {
              enable: true,
              speed: 0.8, // Slow down opacity animation
              minimumValue: 0.1, // Match new min opacity
              sync: false
            }
          },
          shape: {
            type: ["circle", "triangle", "square"], // Multiple shapes for visual interest
          },
          size: {
            value: { min: 1, max: 8 }, // Increased particle size range
            random: true, // Random sizes
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.5,
              sync: false
            }
          },
        },
        shadow: { // Add shadow for "glow" effect
          blur: 5,
          color: {
            value: "#ffffff",
          },
          enable: true,
          offset: {
            x: 0,
            y: 0
          }
        },
        detectRetina: false, // Disabled retina detection as a test
      }}
    />
  );
};

export default ParticleBackground;
