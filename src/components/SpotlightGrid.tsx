"use client";

import { useEffect, useRef } from "react";

export default function SpotlightGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Позицию курсора пишем в CSS-переменные (раз в кадр), без React-стейта —
  // так нет ре-рендера на каждое движение мыши
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    let x = -1000;
    let y = -1000;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--spot-x", `${x}px`);
        root.style.setProperty("--spot-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 hidden md:flex items-center justify-center -z-10 overflow-hidden pointer-events-none bg-[var(--color-page-bg)] transition-colors duration-300"
      style={{ "--spot-x": "-1000px", "--spot-y": "-1000px" } as React.CSSProperties}
    >
      {/* 1. Общая фоновая сетка */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* 2. Мягкое радиальное свечение вокруг курсора */}
      <div
        className="absolute inset-0 transition-opacity duration-500 opacity-60 dark:opacity-100"
        style={{
          background: "radial-gradient(600px circle at var(--spot-x) var(--spot-y), rgba(138, 96, 194, 0.12), transparent 80%)",
        }}
      />

      {/* 3. Яркая сетка под курсором с маской */}
      <div
        className="absolute inset-0 grid-bg-bright"
        style={{
          WebkitMaskImage: "radial-gradient(350px circle at var(--spot-x) var(--spot-y), black 0%, transparent 100%)",
          maskImage: "radial-gradient(350px circle at var(--spot-x) var(--spot-y), black 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
