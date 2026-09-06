import * as THREE from 'three';

/**
 * TextureHelper: Creates photorealistic procedural PBR textures
 * and loads photographic background textures.
 */
export class TextureHelper {
  private static textureLoader = new THREE.TextureLoader();

  public static loadPhotoTexture(path: string): THREE.Texture {
    const tex = this.textureLoader.load(path);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  public static load360VideoTexture(videoUrl: string): THREE.VideoTexture {
    return this.loadPlaylistVideoTexture([videoUrl]);
  }

  public static loadPlaylistVideoTexture(videoUrls: string[]): THREE.VideoTexture {
    const video = document.createElement('video');
    let currentIndex = 0;
    
    video.src = videoUrls[currentIndex];
    video.crossOrigin = 'anonymous';
    // Only loop natively if there is a single video. 
    // If multiple videos, the ended event listener handles the looping
    video.loop = videoUrls.length === 1;
    video.muted = true;
    video.playsInline = true;
    
    if (videoUrls.length > 1) {
      video.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % videoUrls.length;
        video.src = videoUrls[currentIndex];
        video.play().catch(e => console.warn('Playlist autoplay prevented:', e));
      });
    }

    video.load();

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  /**
   * Procedural highly realistic Tree Billboard (Oak/Pine hybrid look)
   */
  public static createRealisticTreeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Trunk
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(240, 512);
    ctx.lineTo(272, 512);
    ctx.lineTo(260, 100);
    ctx.lineTo(252, 100);
    ctx.fill();

    // Branches and Leaves (Fractal-like stippling)
    for (let i = 0; i < 3000; i++) {
      const cx = 256 + (Math.random() - 0.5) * 350 * (1 - (i/3000));
      const cy = 350 - (Math.random()) * 300 - (i/3000)*50;
      
      const g = 60 + Math.random() * 80;
      const r = g * 0.4;
      const b = g * 0.2;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      
      ctx.beginPath();
      ctx.arc(cx, cy, 15 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  public static createRealisticButterflyTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Monarch style
    ctx.translate(64, 64);
    // Left wing
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.ellipse(-25, -15, 30, 20, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-20, 15, 20, 25, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(25, -15, 30, 20, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20, 15, 20, 25, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Veins/Borders
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  public static createRealisticBirdTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Blue Jay style
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath();
    ctx.ellipse(32, 32, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.moveTo(32, 24);
    ctx.lineTo(45, 10);
    ctx.lineTo(25, 24);
    ctx.fill();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Generates a realistic cobblestone pavement texture with mortar joints and stone color variations.
   */
  public static createCobblestoneTexture(width = 512, height = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base mortar
    ctx.fillStyle = '#3a3d40';
    ctx.fillRect(0, 0, width, height);

    const rows = 16;
    const cols = 16;
    const stoneW = width / cols;
    const stoneH = height / rows;

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (stoneW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * stoneW + offset + 2;
        const y = r * stoneH + 2;
        const w = stoneW - 4;
        const h = stoneH - 4;

        // Natural stone color variation (granite / basalt tones)
        const gray = Math.floor(90 + Math.random() * 50);
        const red = gray + Math.floor(Math.random() * 15 - 5);
        const blue = gray + Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${red}, ${gray}, ${blue})`;

        // Rounded stone
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();

        // Subtle specular highlight on edge
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }

  /**
   * Generates a realistic lush grass texture with natural green blade noise.
   */
  public static createGrassTexture(width = 512, height = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3b7a37';
    ctx.fillRect(0, 0, width, height);

    // Add thousands of natural blade flecks
    for (let i = 0; i < 25000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const g = Math.floor(95 + Math.random() * 70);
      const r = Math.floor(g * 0.45);
      ctx.fillStyle = `rgb(${r}, ${g}, 45)`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }

  /**
   * Generates a realistic Tuscan terracotta tile texture.
   */
  public static createTerracottaTexture(width = 512, height = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#4a3b32'; // Grout line
    ctx.fillRect(0, 0, width, height);

    const tileSize = width / 8;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = c * tileSize + 3;
        const y = r * tileSize + 3;
        const s = tileSize - 6;

        // Terracotta warmth
        const red = Math.floor(180 + Math.random() * 35);
        const green = Math.floor(95 + Math.random() * 25);
        const blue = Math.floor(65 + Math.random() * 20);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, y, s, s);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  /**
   * Generates a realistic rustic wooden planks texture.
   */
  public static createWoodPlankTexture(width = 512, height = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const plankH = height / 6;
    for (let i = 0; i < 6; i++) {
      const y = i * plankH;
      const baseBrown = Math.floor(110 + Math.random() * 30);
      ctx.fillStyle = `rgb(${baseBrown}, ${Math.floor(baseBrown * 0.65)}, ${Math.floor(baseBrown * 0.4)})`;
      ctx.fillRect(0, y, width, plankH - 3);

      // Wood grain lines
      ctx.strokeStyle = `rgba(50, 30, 15, 0.25)`;
      ctx.lineWidth = 1;
      for (let g = 0; g < 8; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * plankH);
        ctx.bezierCurveTo(
          width * 0.3, y + Math.random() * plankH,
          width * 0.7, y + Math.random() * plankH,
          width, y + Math.random() * plankH
        );
        ctx.stroke();
      }

      // Plank seam
      ctx.fillStyle = '#1e140d';
      ctx.fillRect(0, y + plankH - 3, width, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
}
