'use client';

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(-15px); }
          50% { transform: translateY(30px) translateX(15px); }
          75% { transform: translateY(15px) translateX(-15px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          25% { transform: translateY(-25px) rotateZ(45deg); }
          50% { transform: translateY(-50px) rotateZ(90deg); }
          75% { transform: translateY(-25px) rotateZ(135deg); }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,212,255,0.6); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .floating-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          animation: float-slow 20s ease-in-out infinite;
        }

        .blob-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0,100,200,0.1) 0%, transparent 70%);
          bottom: 100px;
          left: -50px;
          animation: float-medium 25s ease-in-out infinite;
        }

        .blob-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%);
          top: 50%;
          right: 10%;
          animation: float-fast 30s ease-in-out infinite;
        }
      `}</style>

      <div className="floating-blob blob-1" />
      <div className="floating-blob blob-2" />
      <div className="floating-blob blob-3" />
    </>
  );
}
