'use client';

import { useEffect, useRef, useState } from 'react';

export default function MouseTracker() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;

      // Check if hovering over any interactive or clickable elements
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('interactive') ||
        target.getAttribute('role') === 'button';

      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
    };

    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        pointerEvents: 'none',
        zIndex: 999999,
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.05s ease-out',
      }}
    >
      {/* Outer Glowing Ring */}
      <div
        style={{
          position: 'absolute',
          width: isHovering ? 48 : isClicking ? 28 : 36,
          height: isHovering ? 48 : isClicking ? 28 : 36,
          border: `1.5px solid ${isHovering ? 'rgba(6, 182, 212, 0.9)' : 'rgba(6, 182, 212, 0.4)'}`,
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isHovering
            ? '0 0 25px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)'
            : '0 0 10px rgba(6, 182, 212, 0.2)',
          background: isHovering ? 'rgba(6, 182, 212, 0.06)' : 'transparent',
        }}
      />

      {/* Core Glowing Dot */}
      <div
        style={{
          width: isHovering ? 10 : isClicking ? 6 : 8,
          height: isHovering ? 10 : isClicking ? 6 : 8,
          background: '#06b6d4',
          borderRadius: '50%',
          boxShadow: '0 0 14px #06b6d4, 0 0 24px rgba(6, 182, 212, 0.8)',
          transition: 'all 0.15s ease-out',
        }}
      />
    </div>
  );
}
