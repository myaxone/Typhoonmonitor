import React, { useRef, useEffect } from 'react';

interface LiveMapProps {
  width?: number;
  height?: number;
  windSpeeds?: number[]; // array of recent wind speeds
  windDirs?: number[]; // array of recent wind directions (degrees)
  precipitation?: number[]; // precipitation intensity
}

// A simplified animated canvas that shows wind vectors and precipitation pulses.
const LiveMap: React.FC<LiveMapProps> = ({ width = 600, height = 300, windSpeeds = [], windDirs = [], precipitation = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const localCtx = ctx as CanvasRenderingContext2D;

    let raf = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

    function spawnRain() {
      const count = 8;
      for (let i = 0; i < count; i++) {
        particles.push({ x: Math.random() * width, y: -10, vx: (Math.random() - 0.5) * 0.5, vy: 1 + Math.random() * 2, life: 100 });
      }
    }

    function precipitationColor(mm: number) {
      // color ramp similar to radar: light cyan -> blue -> green -> yellow -> orange -> red -> purple
      if (mm <= 0) return 'rgba(0,0,0,0)';
      if (mm < 0.5) return 'rgba(173,235,255,0.6)';
      if (mm < 1) return 'rgba(102,204,255,0.6)';
      if (mm < 2) return 'rgba(0,170,255,0.6)';
      if (mm < 5) return 'rgba(0,200,120,0.6)';
      if (mm < 10) return 'rgba(255,220,0,0.6)';
      if (mm < 25) return 'rgba(255,140,0,0.7)';
      if (mm < 50) return 'rgba(255,60,60,0.75)';
      return 'rgba(180,0,180,0.8)';
    }

    function draw() {
  localCtx.clearRect(0, 0, width, height);
      // background subtle
  localCtx.fillStyle = '#0b1013';
  localCtx.fillRect(0, 0, width, height);

      // draw circular radar ring in center-left
      const centerX = Math.floor(width * 0.45);
      const centerY = Math.floor(height * 0.5);
      const radius = Math.min(width, height) * 0.42;

  localCtx.save();
  localCtx.beginPath();
  localCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  localCtx.fillStyle = 'rgba(10,16,20,0.6)';
  localCtx.fill();
  localCtx.lineWidth = 1;
  localCtx.strokeStyle = 'rgba(100,120,130,0.25)';
  localCtx.stroke();

      // smoother gridded heatmap: draw a low-res precipitation grid to an offscreen canvas,
      // blur it and then scale it into the radar circle so it appears as soft blobs.
      if ((precipitation || []).length > 0) {
        const gridN = 64; // low-res grid
        const tmp = document.createElement('canvas');
        tmp.width = gridN;
        tmp.height = gridN;
        const tctx = tmp.getContext('2d');
        if (tctx) {
          tctx.clearRect(0, 0, gridN, gridN);
          // fill grid cells based on precipitation samples
          for (let gy = 0; gy < gridN; gy++) {
            for (let gx = 0; gx < gridN; gx++) {
              // map grid position to a sample index
              const u = gx / (gridN - 1);
              const v = gy / (gridN - 1);
              // combine u,v to pick a sample across the precipitation array
              const idx = Math.floor(((u + (1 - v)) / 2) * (precipitation.length || 1));
              const sample = precipitation[Math.min(idx, precipitation.length - 1)] || 0;
              const col = precipitationColor(sample);
              // small alpha for gradual blending
              tctx.fillStyle = col.replace(/rgba\(([^,]+),([^,]+),([^,]+),/, 'rgba($1,$2,$3,0.');
              tctx.fillRect(gx, gy, 1, 1);
            }
          }

          // draw blurred scaled image into radar circle
          const clipX = centerX - radius;
          const clipY = centerY - radius;
          const clipW = radius * 2;
          const clipH = radius * 2;

          localCtx.save();
          localCtx.beginPath();
          localCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          localCtx.clip();

          // apply blur filter for smooth blobs
          localCtx.filter = 'blur(8px)';
          localCtx.globalCompositeOperation = 'lighter';
          // draw the tiny canvas scaled up to the radar circle
          localCtx.drawImage(tmp, clipX, clipY, clipW, clipH);
          // reset filters
          localCtx.filter = 'none';
          localCtx.globalCompositeOperation = 'source-over';
          localCtx.restore();
        }
      } else {
        // fallback to radial sectors if no precipitation array
        const steps = 36;
        for (let i = 0; i < steps; i++) {
          const angle0 = (i / steps) * Math.PI * 2;
          const angle1 = ((i + 1) / steps) * Math.PI * 2;
          const midAngle = (angle0 + angle1) / 2;
          const sample = precipitation[Math.floor((i / steps) * (precipitation.length || 1))] || 0;
          const col = precipitationColor(sample);
          const segRadius = radius * 0.9;
          const gx = centerX + Math.cos(midAngle) * segRadius * 0.6;
          const gy = centerY + Math.sin(midAngle) * segRadius * 0.6;
          const grad = localCtx.createRadialGradient(gx, gy, segRadius * 0.05, gx, gy, segRadius);
          grad.addColorStop(0, col);
          grad.addColorStop(0.6, col.replace(/rgba\(([^,]+),([^,]+),([^,]+),/, 'rgba($1,$2,$3,0.'));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          localCtx.beginPath();
          localCtx.moveTo(centerX, centerY);
          localCtx.arc(centerX, centerY, radius, angle0, angle1);
          localCtx.closePath();
          localCtx.fillStyle = grad as unknown as string;
          localCtx.fill();
        }
      }

      // faint concentric circles
      for (let r = radius; r > radius * 0.1; r -= radius * 0.25) {
  localCtx.beginPath();
  localCtx.arc(centerX, centerY, r, 0, Math.PI * 2);
  localCtx.strokeStyle = 'rgba(120,140,150,0.06)';
  localCtx.stroke();
      }

  localCtx.restore();

      // draw wind vector arrow using latest wind values
      const latestWind = windSpeeds[windSpeeds.length - 1] || 2;
      const latestDir = windDirs[windDirs.length - 1] || 180;
      const ax = centerX + radius * 0.6;
      const ay = centerY - radius * 0.6;

  localCtx.save();
  localCtx.translate(ax, ay);
  localCtx.rotate((-latestDir + 180) * Math.PI / 180);
  localCtx.strokeStyle = '#10b981';
  localCtx.lineWidth = 3;
  localCtx.beginPath();
  localCtx.moveTo(-40, 0);
  localCtx.lineTo(40, 0);
  localCtx.stroke();
  localCtx.beginPath();
  localCtx.moveTo(30, -8);
  localCtx.lineTo(40, 0);
  localCtx.lineTo(30, 8);
  localCtx.stroke();
  localCtx.restore();

      // particles for light motion (subtle)
      particles.forEach((p) => {
        localCtx.beginPath();
        localCtx.strokeStyle = 'rgba(200,220,255,0.8)';
        localCtx.lineWidth = 1;
        localCtx.moveTo(p.x, p.y);
        localCtx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        localCtx.stroke();
        p.x += p.vx + (latestWind || 0) * 0.01;
        p.y += p.vy + (latestWind || 0) * 0.02;
        p.life -= 1;
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].y > height + 10 || particles[i].life <= 0) particles.splice(i, 1);
      }

      if (Math.random() < 0.12) spawnRain();

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [windSpeeds, windDirs, precipitation, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#061018' }} />;
};

export default LiveMap;
