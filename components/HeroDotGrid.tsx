"use client";

import { useEffect, useRef } from "react";

/**
 * Grille de points en fond du hero, avec révélation « projecteur » au
 * survol — inspirée du style Zeely. Purement décorative (aria-hidden).
 *
 * Sur un appareil sans survol réel (tactile), seule la grille statique
 * reste : ni écouteur de pointeur, ni halo, ni boucle d'animation continue —
 * un effet figé sur le dernier point touché serait pire que son absence.
 */

const SPACING = 26;
const BASE_RADIUS = 1.1;
const BASE_OPACITY = 0.12;
const MAX_RADIUS = BASE_RADIUS * 3;
const MAX_OPACITY = 0.67;
const INTERACTION_RADIUS = 160;
const LERP_FACTOR = 0.15;

const DOT_COLOR = "10, 10, 10"; // #0A0A0A
const HALO_COLOR = "236, 76, 121"; // #EC4C79
const HALO_OPACITY = 0.03;

type Dot = { x: number; y: number };

export function HeroDotGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /* Rebindées en constantes typées non nullables : les fonctions imbriquées
       ci-dessous capturent ces variables, et TypeScript ne reporte pas dans
       une fermeture le rétrécissement de type obtenu par le `if` qui suit. */
    if (!containerRef.current || !canvasRef.current) return;
    const container: HTMLDivElement = containerRef.current;
    const canvas: HTMLCanvasElement = canvasRef.current;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];

    /* Hors écran : au premier rendu comme après un mouseleave, aucun point
       ne doit apparaître agrandi. Le retour au repos passe par le même lerp
       que l'approche — jamais un saut instantané. */
    const mouse = { x: -1000, y: -1000 };
    const smoothMouse = { x: -1000, y: -1000 };
    let frameId = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function buildGrid() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Nombre de points arrondi au plus proche, puis les marges de bord
         résiduelles sont réparties également : la grille reste centrée
         plutôt que collée en haut à gauche. */
      const cols = Math.max(1, Math.round(width / SPACING));
      const rows = Math.max(1, Math.round(height / SPACING));
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots.push({ x: offsetX + col * SPACING, y: offsetY + row * SPACING });
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(${DOT_COLOR}, ${BASE_OPACITY})`;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, BASE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawInteractive() {
      ctx.clearRect(0, 0, width, height);

      const withinCanvas =
        smoothMouse.x > -INTERACTION_RADIUS &&
        smoothMouse.x < width + INTERACTION_RADIUS &&
        smoothMouse.y > -INTERACTION_RADIUS &&
        smoothMouse.y < height + INTERACTION_RADIUS;

      /* Simple teinte d'ambiance, jamais l'élément dominant : dessinée sous
         les points, avant eux. */
      if (withinCanvas) {
        const gradient = ctx.createRadialGradient(
          smoothMouse.x,
          smoothMouse.y,
          0,
          smoothMouse.x,
          smoothMouse.y,
          INTERACTION_RADIUS,
        );
        gradient.addColorStop(0, `rgba(${HALO_COLOR}, ${HALO_OPACITY})`);
        gradient.addColorStop(1, `rgba(${HALO_COLOR}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(
          smoothMouse.x - INTERACTION_RADIUS,
          smoothMouse.y - INTERACTION_RADIUS,
          INTERACTION_RADIUS * 2,
          INTERACTION_RADIUS * 2,
        );
      }

      for (const dot of dots) {
        const dx = dot.x - smoothMouse.x;
        const dy = dot.y - smoothMouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        /* Dégradé linéaire simple, sans coupure nette au bord du rayon. */
        const proximity = Math.max(0, 1 - distance / INTERACTION_RADIUS);

        const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * proximity;
        const opacity = BASE_OPACITY + (MAX_OPACITY - BASE_OPACITY) * proximity;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${opacity})`;
        ctx.fill();
      }
    }

    function loop() {
      frameId = requestAnimationFrame(loop);
      smoothMouse.x += (mouse.x - smoothMouse.x) * LERP_FACTOR;
      smoothMouse.y += (mouse.y - smoothMouse.y) * LERP_FACTOR;
      drawInteractive();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildGrid();
        if (!canHover) drawStatic();
      }, 120);
    }

    function onMouseMove(event: MouseEvent) {
      const rect = container.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    buildGrid();
    window.addEventListener("resize", onResize);

    if (canHover) {
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      frameId = requestAnimationFrame(loop);
    } else {
      /* Ni écouteur, ni boucle continue : la grille statique se dessine une
         fois, et se redessine seulement au resize. */
      drawStatic();
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      if (canHover) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 z-[1] overflow-hidden bg-white"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
