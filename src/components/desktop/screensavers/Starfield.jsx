import React, { useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Star configuration
    const numStars = 800; // Classic dense starfield
    const stars = [];
    const speed = 2; // Warp speed!
    
    // Initialize stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width * 2 - canvas.width,
            y: Math.random() * canvas.height * 2 - canvas.height,
            z: Math.random() * canvas.width, 
        });
    }

    const draw = () => {
      // Clear with slight trailing effect for motion blur
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        
        // Move star closer
        star.z -= speed;
        
        // Reset star if it passes the screen
        if (star.z <= 0) {
            star.x = Math.random() * canvas.width * 2 - canvas.width;
            star.y = Math.random() * canvas.height * 2 - canvas.height;
            star.z = canvas.width;
        }

        // Project 3D coordinates to 2D screen
        const k = 128.0 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        // Draw star if it's visible on screen
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            // Stars get bigger and brighter as they get closer
            const size = (1 - star.z / canvas.width) * 3;
            const brightness = Math.floor((1 - star.z / canvas.width) * 255);
            
            ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default Starfield;
