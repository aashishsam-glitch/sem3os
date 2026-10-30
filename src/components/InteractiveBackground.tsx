import React, { useEffect, useRef } from 'react';
import { useDisk } from '../context/DiskContext';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useDisk();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    const particleCount = reducedMotion ? 20 : 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(138, 43, 226, ',
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep cyber background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(10, 22, 45, 0.6)');
      bgGrad.addColorStop(0.5, 'rgba(7, 12, 26, 0.9)');
      bgGrad.addColorStop(1, 'rgba(4, 7, 15, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient 3D Rotating Platter Wireframe (top right / center background)
      if (!reducedMotion) {
        angle += 0.003;
      }

      ctx.save();
      const centerX = width > 1024 ? width * 0.78 : width * 0.5;
      const centerY = width > 1024 ? height * 0.35 : height * 0.25;
      const radiusX = Math.min(width * 0.28, 280);
      const radiusY = radiusX * 0.45; // 3D tilt

      // Outer platter rings
      for (let r = 0.3; r <= 1.0; r += 0.18) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX * r, radiusY * r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 242, 254, ${0.04 + r * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spindle center hub
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX * 0.14, radiusY * 0.14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rotating radial sector spokes
      const spokeCount = 12;
      for (let i = 0; i < spokeCount; i++) {
        const theta = angle + (i * Math.PI * 2) / spokeCount;
        const x1 = centerX + Math.cos(theta) * (radiusX * 0.14);
        const y1 = centerY + Math.sin(theta) * (radiusY * 0.14);
        const x2 = centerX + Math.cos(theta) * radiusX;
        const y2 = centerY + Math.sin(theta) * radiusY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(79, 172, 254, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Simulated actuator arm pivot
      const pivotX = centerX + radiusX * 1.05;
      const pivotY = centerY + radiusY * 1.1;
      const armAngle = Math.sin(angle * 1.5) * 0.25 - 0.4;
      const armLength = radiusX * 0.85;
      const headX = pivotX - Math.cos(armAngle) * armLength;
      const headY = pivotY - Math.sin(armAngle) * (armLength * 0.6);

      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(headX, headY);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Arm head point
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Floating ambient particles
      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
    </div>
  );
};
