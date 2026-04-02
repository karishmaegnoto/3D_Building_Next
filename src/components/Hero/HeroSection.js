
'use client';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Grid nodes for the network effect
    const nodes = [];
    const NODE_COUNT = 40;

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W(), H());

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W()) n.vx *= -1;
        if (n.y < 0 || n.y > H()) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, 0.35)`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initNodes();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initNodes();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="hero" id="home">
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true"></canvas>

      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__eyebrow">
            Next-Gen Structure Estimator
          </div>

          <h1 className="hero__title">
            <span className="hero__title-main">
              Build Your <span className="highlight">Future</span>
            </span>
            <span className="hero__title-sub">In 3D Reality</span>
          </h1>

          <p className="hero__description">
            Design and customize carports, barns, and commercial buildings with our
            cutting-edge 3D visualization technology. Get instant pricing and bring
            your vision to life.
          </p>

          <div className="hero__actions">
            <button className="hero__btn hero__btn--primary">
              <span className="btn-icon">🚀</span>
              Start Building
            </button>
            <button className="hero__btn hero__btn--secondary">
              <span className="btn-icon">▶️</span>
              Watch Demo
            </button>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <div className="hero__stat-value">2,400+</div>
              <div className="hero__stat-label">Structures Built</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-value">48hr</div>
              <div className="hero__stat-label">Avg. Quote Time</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-value">98%</div>
              <div className="hero__stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="building-scene">
            <div className="building-scene__ring building-scene__ring--1"></div>
            <div className="building-scene__ring building-scene__ring--2"></div>
            <div className="building-scene__glow"></div>

            <div className="building-3d">
              <div className="building-3d__structure">
                <div className="building-3d__roof"></div>
                <div className="building-3d__walls">
                  <div className="building-3d__door"></div>
                </div>
                <div className="building-3d__foundation"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}