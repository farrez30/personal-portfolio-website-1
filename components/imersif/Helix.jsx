"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Helix kaca kecil di bagian kontak. Tiap batang berbunyi satu nada pentatonik
// saat disapu kursor. Bunyi baru menyala setelah klik pertama (aturan autoplay
// browser), dan tidak pernah berbunyi sendiri.
const NADA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

export default function Helix() {
  const wadah = useRef(null);

  useEffect(() => {
    const el = wadah.current;
    const kurangi = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 9);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1a1816, 1.4));
    const lampu = new THREE.DirectionalLight(0xffffff, 2);
    lampu.position.set(3, 4, 6);
    scene.add(lampu);

    const grup = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.6, 0.16, 0.34);
    const batang = NADA.map((f, i) => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({
          color: i % 3 === 0 ? 0xe0574b : 0xf2ece4,
          roughness: 0.12,
          metalness: 0,
          clearcoat: 1,
          transparent: true,
          opacity: 0.82,
        }),
      );
      const sudut = i * 0.62;
      m.position.set(Math.cos(sudut) * 0.9, (i - NADA.length / 2) * 0.34, Math.sin(sudut) * 0.9);
      m.rotation.y = -sudut;
      m.userData = { i, goyang: 0 };
      grup.add(m);
      return m;
    });
    scene.add(grup);

    const ukur = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(el);

    let audio = null;
    const bunyi = (i) => {
      if (!audio) return;
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "sine";
      o.frequency.value = NADA[i];
      const t = audio.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + 1.5);
    };
    const nyalakan = () => {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
    };

    const ray = new THREE.Raycaster();
    const v = new THREE.Vector2();
    let terakhir = -1;
    const sapu = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v, camera);
      const kena = ray.intersectObjects(batang)[0]?.object;
      const i = kena ? kena.userData.i : -1;
      if (i >= 0 && i !== terakhir) {
        kena.userData.goyang = 1;
        bunyi(i);
      }
      terakhir = i;
    };
    const kanvas = renderer.domElement;
    kanvas.addEventListener("pointerdown", nyalakan);
    kanvas.addEventListener("pointermove", sapu);

    let tampil = false;
    const bingkai = (t) => {
      if (!kurangi) grup.rotation.y = t * 0.00025;
      for (const b of batang) {
        b.userData.goyang *= 0.92;
        b.position.x += Math.sin(t * 0.05) * b.userData.goyang * 0.004;
        b.scale.setScalar(1 + b.userData.goyang * 0.08);
      }
      renderer.render(scene, camera);
    };
    const io = new IntersectionObserver(([e]) => {
      tampil = e.isIntersecting;
      renderer.setAnimationLoop(tampil ? bingkai : null);
    });
    io.observe(el);

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      kanvas.removeEventListener("pointerdown", nyalakan);
      kanvas.removeEventListener("pointermove", sapu);
      geo.dispose();
      batang.forEach((b) => b.material.dispose());
      renderer.dispose();
      audio?.close();
      kanvas.remove();
    };
  }, []);

  return (
    <figure className="helix">
      <div ref={wadah} className="helix__panggung" aria-hidden="true" />
    </figure>
  );
}
