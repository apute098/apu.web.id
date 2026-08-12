'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Logo3D — "apu" 3D logo animation (Three.js + Anime.js).
 * Inspired by Coding Stella tutorial: SVG extrude → shards → animejs timeline.
 * Renders into a canvas; lightweight, stops when tab hidden.
 */
export default function Logo3D({ size = 64 }: { size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;

    let disposed = false;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let logoMesh: any = null;
    let shards: any = null;
    let frameId = 0;
    let timeline: any = null;
    let resizeObs: ResizeObserver | null = null;

    const load = async () => {
      try {
        const THREE = await import('three');
        const animeModule = await import('animejs');
        const anime = (animeModule as any).default ?? animeModule;
        const w = mount.clientWidth || size;
        const h = mount.clientHeight || size;

        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 0, 6);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x22d3ee, 0.9);
        rim.position.set(-4, -2, -3);
        scene.add(rim);

        // ---- Logo: text "APU" via ExtrudeGeometry (font self-hosted di public/) ----
        const FontLoader = (THREE as any).FontLoader
          ? (THREE as any).FontLoader
          : (await import('three/addons/loaders/FontLoader.js')).FontLoader;
        const font = await new Promise<any>((resolve, reject) => {
          const loader = new FontLoader();
          loader.load(
            '/fonts/helvetiker_bold.typeface.json',
            resolve,
            undefined,
            reject
          );
        }).catch(() => null);
        if (!font) throw new Error('Font 3D gagal dimuat');
        const shapes = font.generateShapes('APU', 1.15);
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth: 0.5,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.05,
          bevelSegments: 3,
        });
        geo.center();

        logoMesh = new THREE.Mesh(
          geo,
          new THREE.MeshStandardMaterial({
            color: 0xf97316,
            metalness: 0.35,
            roughness: 0.25,
          })
        );
        scene.add(logoMesh);

        // ---- Shards: instanced cubes around logo ----
        const COUNT = 90;
        shards = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.09, 0.09, 0.09),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }),
          COUNT
        );
        const dummy = new THREE.Object3D();
        const seedPos: number[] = [];
        for (let i = 0; i < COUNT; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = 1.6 + Math.random() * 2.2;
          const x = Math.cos(theta) * r;
          const y = (Math.random() - 0.5) * 2.4;
          const z = (Math.random() - 0.5) * 1.4;
          dummy.position.set(x, y, z);
          dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
          const s = 0.5 + Math.random() * 1.2;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          shards.setMatrixAt(i, dummy.matrix);
          seedPos.push(x, y, z);
        }
        shards.instanceMatrix.needsUpdate = true;
        scene.add(shards);

        // ---- Anime.js v4: animate(target, params) — DUA argumen, bukan {targets} ----
        const { animate: animeAnimate } = animeModule as any;
        const spinState = { y: 0 };
        timeline = animeAnimate?.(spinState, {
          y: 360,
          duration: 5800,
          ease: 'linear',
          loop: true,
          update: () => {
            if (logoMesh) logoMesh.rotation.y = (spinState.y * Math.PI) / 180;
          },
        });
        const pulseState = { s: 1 };
        const shardPulse = animeAnimate?.(pulseState, {
          s: 0.85,
          duration: 1200,
          ease: 'inOutQuad',
          direction: 'alternate',
          loop: true,
          update: () => {
            if (shards) shards.scale.setScalar(pulseState.s);
          },
        });

        animRef.current = {
          stop: () => {
            timeline?.pause();
            shardPulse?.pause();
          },
        };

        // ---- Render loop ----
        const clock = new THREE.Clock();
        const render = () => {
          if (disposed) return;
          const t = clock.getElapsedTime();
          // subtle float
          if (logoMesh) {
            logoMesh.position.y = Math.sin(t * 0.8) * 0.08;
          }
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(render);
        };
        render();
        timeline.play();
      } catch (e) {
        console.error('Logo3D init failed', e);
      }
    };

    load();

    // Resize
    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => {
        if (!renderer || !mount) return;
        const w = mount.clientWidth || size;
        const h = mount.clientHeight || size;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      resizeObs.observe(mount);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObs?.disconnect();
      animRef.current?.stop();
      renderer?.dispose();
    };
  }, [size]);

  return (
    <div ref={mountRef} className="relative" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
