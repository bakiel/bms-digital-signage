import React from 'react';
import ParticleBackground from '../components/animations/ParticleBackground'; // Re-enabled particles
import SlideShow from '../components/SlideShow';

// This component now only sets up the animated gradient background 
// and renders the main SlideShow component, which handles the rest of the layout.
const Display: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-gradient-animated bg-400% animate-gradient"> {/* Apply custom gradient and animation */}
      {/* Gradient is now on body, removed redundant div */}
      
      {/* Particle Background */}
      <ParticleBackground density="low" /> {/* Reverted density back to low for subtlety */}
      
      {/* SlideShow handles the rest of the layout (header, content, footer) */}
      <SlideShow />
    </div>
  );
};

export default Display;
