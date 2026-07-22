import { PanoramaItem } from '../types';

/**
 * Creates high-res canvas panoramas procedurally so the application works 100% offline
 * without relying on external CDNs or broken image links.
 */
function generatePanoramaDataURL(
  type: 'huawei_fisheye' | 'street_plaza' | 'architecture' | 'mountain' | 'loft'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (type === 'huawei_fisheye') {
    // 1024x1024 circular polar fisheye picture simulating Huawei 360 camera shot
    canvas.width = 1024;
    canvas.height = 1024;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.46;

    // Dark outer frame
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, w, h);

    // Fisheye circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Sky gradient inside fisheye
    const skyGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
    skyGrad.addColorStop(0, '#5fa8e6');
    skyGrad.addColorStop(0.5, '#3b82f6');
    skyGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Outer building distortion (curved white & blue facade around edge)
    ctx.lineWidth = 40;
    ctx.strokeStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 30, Math.PI * 0.8, Math.PI * 1.7);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 55, Math.PI * 0.85, Math.PI * 1.65);
    ctx.stroke();

    // Windows along the curved building
    for (let a = Math.PI * 0.85; a < Math.PI * 1.65; a += 0.12) {
      const wx = cx + Math.cos(a) * (radius - 80);
      const wy = cy + Math.sin(a) * (radius - 80);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(wx, wy, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central courtyard / lawn (green circle in middle)
    const lawnRadius = radius * 0.38;
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 20, lawnRadius, 0, Math.PI * 2);
    ctx.fill();

    // Paved path surrounding lawn
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 20, lawnRadius + 15, 0, Math.PI * 2);
    ctx.stroke();

    // Shrubs and flowers around lawn
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const sx = cx + 10 + Math.cos(angle) * (lawnRadius - 5);
      const sy = cy + 20 + Math.sin(angle) * (lawnRadius - 5);
      ctx.fillStyle = i % 2 === 0 ? '#16a34a' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center selfie silhouette & holding camera arm
    ctx.fillStyle = '#be123c'; // red jacket
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 10, 22, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 15, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 18, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    // Arm selfie stick pointing to camera center
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 10);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Huawei 360 watermark lens cap circle at center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HUAWE1 360', cx, cy - 3);
    ctx.font = '7px sans-serif';
    ctx.fillText('CAMERA', cx, cy + 6);

    ctx.restore();

    // Outer subtle ring
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  // 2048x1024 Equirectangular Panoramas
  canvas.width = 2048;
  canvas.height = 1024;
  const w = canvas.width;
  const h = canvas.height;

  if (type === 'street_plaza') {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(0.7, '#38bdf8');
    sky.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Ground paved square
    const ground = ctx.createLinearGradient(0, h * 0.5, 0, h);
    ground.addColorStop(0, '#94a3b8');
    ground.addColorStop(0.3, '#64748b');
    ground.addColorStop(1, '#475569');
    ctx.fillStyle = ground;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Grid lines on ground
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.5);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = h * 0.5; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Modern Buildings around horizon (0..360 degrees)
    for (let i = 0; i < 16; i++) {
      const bx = (i / 16) * w;
      const bw = 90 + Math.sin(i * 3) * 30;
      const bh = 150 + Math.cos(i * 2.5) * 120 + 100;
      const by = h * 0.5 - bh;

      // Building gradient
      const bGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
      bGrad.addColorStop(0, i % 2 === 0 ? '#1e293b' : '#334155');
      bGrad.addColorStop(1, i % 2 === 0 ? '#0f172a' : '#1e293b');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bx, by, bw, bh);

      // Glass windows on buildings
      ctx.fillStyle = '#38bdf8';
      for (let wy = by + 20; wy < h * 0.5 - 20; wy += 25) {
        for (let wx = bx + 10; wx < bx + bw - 15; wx += 18) {
          ctx.globalAlpha = Math.sin(wx + wy) > 0 ? 0.8 : 0.3;
          ctx.fillRect(wx, wy, 10, 15);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Street lamps and trees
    for (let i = 0; i < 8; i++) {
      const tx = (i / 8) * w + 40;
      // Tree crown
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(tx, h * 0.5 - 25, 30, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 4, h * 0.5 - 10, 8, 30);
    }

    // Sun in sky
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.2, 50, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  if (type === 'architecture') {
    // Glass dome interior
    const bg = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w / 2);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.5, '#312e81');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Geometric dome lines
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.quadraticCurveTo(w / 2, (a / (Math.PI * 2)) * h, w, h / 2);
      ctx.stroke();
    }

    for (let r = 50; r < h; r += 60) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glowing architectural LED beams
    ctx.fillStyle = '#c084fc';
    for (let x = 0; x < w; x += 250) {
      ctx.fillRect(x, h * 0.48, 15, h * 0.04);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  if (type === 'mountain') {
    // Golden hour sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#1e3a8a');
    sky.addColorStop(0.4, '#c026d3');
    sky.addColorStop(0.7, '#f97316');
    sky.addColorStop(1, '#fef08a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.55);

    // Mountain silhouettes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    for (let x = 0; x <= w; x += 40) {
      const my = h * 0.55 - Math.abs(Math.sin(x * 0.015)) * 220 - Math.cos(x * 0.005) * 80;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Lake reflection bottom half
    const lake = ctx.createLinearGradient(0, h * 0.55, 0, h);
    lake.addColorStop(0, '#431407');
    lake.addColorStop(0.5, '#1e1b4b');
    lake.addColorStop(1, '#0284c7');
    ctx.fillStyle = lake;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  // Loft Interior
  const floor = ctx.createLinearGradient(0, h * 0.6, 0, h);
  floor.addColorStop(0, '#78350f');
  floor.addColorStop(1, '#451a03');
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  const walls = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  walls.addColorStop(0, '#f8fafc');
  walls.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = walls;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Large industrial windows with outdoor greenery view
  for (let x = 200; x < w; x += 500) {
    ctx.fillStyle = '#86efac';
    ctx.fillRect(x, h * 0.15, 250, h * 0.35);

    // Window frame
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, h * 0.15, 250, h * 0.35);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const SAMPLE_PANORAMAS: PanoramaItem[] = [
  {
    id: 'street-plaza-360',
    title: 'City Center Plaza 360°',
    subtitle: 'Street View style urban walkway',
    category: 'Street View',
    url: generatePanoramaDataURL('street_plaza'),
    projectionMode: 'equirectangular',
    initialYaw: 0,
    initialPitch: 0,
    initialFov: 75,
    locationName: 'Metropolitan Square',
    dateTaken: '2026-07-21',
    cameraModel: '360° Panorama Camera',
    hotspots: [
      {
        id: 'p1',
        title: 'Glass Tower Architecture',
        description: 'Modern 45-story commercial tower featuring high-efficiency double glass facade.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        yaw: 45,
        pitch: 20,
      },
      {
        id: 'p2',
        title: 'Central Fountain Monument',
        description: 'Detailed view of the plaza fountain sculpture and surrounding garden seating.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        yaw: -60,
        pitch: -15,
      },
      {
        id: 'p3',
        title: 'Plaza Walkway & Information Kiosk',
        description: 'Stone paved pedestrian avenue leading towards the central metro station and tourist kiosk.',
        yaw: 180,
        pitch: -20,
      },
    ],
  },
];
