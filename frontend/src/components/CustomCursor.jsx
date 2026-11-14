import React, { useEffect, useState, useRef } from 'react';

/**
 * Retinal Ophthalmic Crosshair Cursor
 * 
 * Features:
 * - Instant Central Pupil Point (zero latency)
 * - Trailing Iris Aperture Ring with smooth linear interpolation (Lerp)
 * - 4 Ocular Slit-Lamp Alignment Ticks (top, bottom, left, right)
 * - Pupillary Light Reflex: dilates on interactive hover, contracts on click
 */
export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Direct mouse positions
  const mousePos = useRef({ x: -100, y: -100 });
  // Lerped smooth trailing position
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only enable on desktop pointer devices with hover capability
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animId;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Move pupil dot instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('.interactive-hover') ||
        target.getAttribute('role') === 'button' ||
        target.dataset.interactive
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    // Smooth Lerp Animation Loop for Trailing Iris Ring
    const render = () => {
      const ease = 0.18; // smooth inertia factor
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Instant Pupil Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -ml-1 -mt-1 transition-opacity duration-200"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHovering
              ? 'w-2.5 h-2.5 bg-[#E4442C] shadow-[0_0_8px_#E4442C]'
              : 'w-2 h-2 bg-[#151410] dark:bg-white shadow-xs'
          }`}
        />
      </div>

      {/* 2. Trailing Ophthalmic Eye Reticle / Dilating Iris Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -ml-6 -mt-6 transition-opacity duration-200"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`relative rounded-full border transition-all duration-300 ease-out flex items-center justify-center ${
            isClicking
              ? 'w-8 h-8 scale-75 border-[#E4442C] bg-[#E4442C]/20'
              : isHovering
              ? 'w-12 h-12 scale-110 border-[#E4442C] bg-[#E4442C]/10 shadow-[0_0_15px_rgba(228,68,44,0.25)]'
              : 'w-10 h-10 border-[#151410]/35 bg-transparent'
          }`}
        >
          {/* 4 Optical Alignment Ticks (Fundus Camera Reticle) */}
          <span
            className={`absolute -top-1 w-[1.5px] h-1.5 transition-colors ${
              isHovering ? 'bg-[#E4442C]' : 'bg-[#151410]/40'
            }`}
          />
          <span
            className={`absolute -bottom-1 w-[1.5px] h-1.5 transition-colors ${
              isHovering ? 'bg-[#E4442C]' : 'bg-[#151410]/40'
            }`}
          />
          <span
            className={`absolute -left-1 h-[1.5px] w-1.5 transition-colors ${
              isHovering ? 'bg-[#E4442C]' : 'bg-[#151410]/40'
            }`}
          />
          <span
            className={`absolute -right-1 h-[1.5px] w-1.5 transition-colors ${
              isHovering ? 'bg-[#E4442C]' : 'bg-[#151410]/40'
            }`}
          />

          {/* Inner Optical Iris Aperture Ring (Appears when hovering) */}
          {isHovering && (
            <div className="w-6 h-6 rounded-full border border-dashed border-[#E4442C]/60 animate-spin" style={{ animationDuration: '6s' }} />
          )}
        </div>
      </div>
    </>
  );
}
