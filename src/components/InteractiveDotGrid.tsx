import React, { useEffect, useRef } from 'react';

const InteractiveDotGrid = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for pure black base optimization
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const spacing = 28;
    const dotRadius = 1;
    let points = [];
    
    let mouse = { x: -1000, y: -1000, active: false };
    
    const initGrid = () => {
      points = [];
      const cols = Math.floor(width / spacing) + 1;
      const rows = Math.floor(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const originX = offsetX + i * spacing;
          const originY = offsetY + j * spacing;
          points.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initGrid();
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let animationId;

    const render = () => {
      // Solid pure black base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      let isMoving = false;
      const influenceRadius = 120;
      const spring = 0.05;
      const friction = 0.8;

      points.forEach(p => {
        // Calculate distance from mouse
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (mouse.active && dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          const angle = Math.atan2(dy, dx);
          
          // Push outward away from cursor
          const pushX = Math.cos(angle) * force * 5;
          const pushY = Math.sin(angle) * force * 5;
          
          p.vx -= pushX;
          p.vy -= pushY;
        }

        // Return to home coordinate (elastic bounce)
        p.vx += (p.originX - p.x) * spring;
        p.vy += (p.originY - p.y) * spring;
        
        // Apply friction
        p.vx *= friction;
        p.vy *= friction;
        
        p.x += p.vx;
        p.y += p.vy;

        if (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01 || (mouse.active && dist < influenceRadius)) {
          isMoving = true;
        }
        
        // Intensity calculates how far the point is distorted
        const displacement = Math.sqrt(Math.pow(p.x - p.originX, 2) + Math.pow(p.y - p.originY, 2));
        const intensity = Math.min(1, displacement / 15);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotRadius + intensity * 0.5, 0, Math.PI * 2);
        
        if (intensity > 0.05) {
          // Subtle highlight for repelled dots
          ctx.fillStyle = `rgba(160, 196, 226, ${0.45 + intensity * 0.55})`; 
        } else {
          // Deep space blue for resting dots
          ctx.fillStyle = 'rgba(28, 48, 65, 0.45)'; 
        }
        
        ctx.fill();
      });

      // Simple optimization: only continuously request animation if points are active
      // Since it's a Hero canvas, we can afford continuous render, but pausing is cleaner
      if (isMoving) {
        animationId = requestAnimationFrame(render);
      } else {
        // Sleep until next mouse move awakens the grid
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});

InteractiveDotGrid.displayName = 'InteractiveDotGrid';

export default InteractiveDotGrid;
