import * as THREE from 'three';
import { IDreamWorld, PortalData } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class GardenHub implements IDreamWorld {
  public id = 'garden';
  public name = 'The Cozy Garden';
  public icon = '🌸';
  public subtitle = 'A peaceful sanctuary where all dreams begin';
  public cozyQuote = 'Take a deep breath... every door here holds a dream just for you.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'grass';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 8);
  public returnPortalPosition = new THREE.Vector3(0, 0, 0);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@52.2697,4.5469,3a,75y,90t/data=!3m6!1e1';
  public streetViewLocation = 'Keukenhof Botanical Gardens, Netherlands';

  public portals: PortalData[] = [
    {
      id: 'switzerland',
      name: 'Swiss Alps Journey',
      icon: '🏔️',
      description: 'A breathtaking immersive walk through the Swiss mountains',
      quote: 'The air is crisp, the mountains are calling, and the journey is yours.',
      position: new THREE.Vector3(),
      color: 0x48cae4
    },
    {
      id: 'aurora',
      name: 'Aurora Night Sky',
      icon: '🌌',
      description: 'Dancing northern lights in a peaceful winter wonderland',
      quote: 'The air is crisp, the snow is soft, and the celestial lights dance just for you.',
      position: new THREE.Vector3(),
      color: 0x9b5de5
    },
    {
      id: 'underwater',
      name: 'Ocean Depths',
      icon: '🐠',
      description: 'Real Google Street View underwater coral reef in 360°',
      quote: 'Drift gently through the warm blue waters... surrounded by the real coral reef.',
      position: new THREE.Vector3(),
      color: 0x00f5d4
    },
    {
      id: 'paris',
      name: 'Paris Romance',
      icon: '🗼',
      description: 'A beautiful journey near the Eiffel Tower',
      quote: 'La vie est belle when you are under the twinkling lights of Paris.',
      position: new THREE.Vector3(),
      color: 0xffafcc
    },
    {
      id: 'varanasi',
      name: 'Varanasi Ghats at Dusk',
      icon: '🪔',
      description: 'A spiritual boat journey along the sacred Ganga',
      quote: 'Diyas drift like fallen stars on the holy Ganga. May your heart find absolute peace.',
      position: new THREE.Vector3(),
      color: 0xff9e00
    }
  ];

  private butterflies: { mesh: THREE.Sprite; basePos: THREE.Vector3; phase: number; speed: number }[] = [];
  private birds: { mesh: THREE.Sprite; center: THREE.Vector3; radius: number; speed: number; angle: number; height: number }[] = [];
  private sakuraParticles!: THREE.Points;
  private portalMeshes: { group: THREE.Group; portalVortex: THREE.Mesh; data: PortalData }[] = [];
  private time: number = 0;

  public init() {
    this.repositionPortalsToCorridor();
    this.buildTerrainAndPath();
    this.buildInstancedGrass();
    this.buildRealisticTrees();
    this.buildRealisticButterflies();
    this.buildRealisticBirds();
    this.buildSakuraParticles();
    this.buildPortals();
    this.setupLighting();
  }

  private repositionPortalsToCorridor() {
    // Layout the portals in a straight line z-axis corridor
    this.portals.forEach((p, index) => {
      const zPos = -15 - (index * 12); // Spaced every 12 meters
      const xPos = (index % 2 === 0) ? -7 : 7; // Staggered left and right
      p.position.set(xPos, 0, zPos);
    });
  }

  private setupLighting() {
    const dirLight = new THREE.DirectionalLight(0xfff3d6, 1.8);
    dirLight.position.set(30, 40, -40);
    dirLight.castShadow = true;
    this.sceneGroup.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffecd2, 0xa1c4fd, 0.85);
    this.sceneGroup.add(hemiLight);
  }

  private buildTerrainAndPath() {
    // Long straight corridor terrain
    const groundGeo = new THREE.PlaneGeometry(80, 240, 32, 64);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Gentle slope upwards on sides of path
      const pathTrench = (Math.abs(x) < 5) ? 0 : (Math.abs(x) - 5) * 0.15;
      const hill = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
      posAttr.setZ(i, pathTrench + hill);
    }
    groundGeo.computeVertexNormals();

    const grassTex = TextureHelper.createGrassTexture();
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.85,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -60;
    ground.receiveShadow = true;
    this.sceneGroup.add(ground);

    // Realistic Cobblestone Straight Path
    const stoneTex = TextureHelper.createCobblestoneTexture();
    const pathGeo = new THREE.PlaneGeometry(6, 240);
    const pathMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const mainPath = new THREE.Mesh(pathGeo, pathMat);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.03;
    mainPath.position.z = -60;
    mainPath.receiveShadow = true;
    this.sceneGroup.add(mainPath);
  }

  private buildInstancedGrass() {
    const bladeGeo = new THREE.PlaneGeometry(0.1, 0.4);
    bladeGeo.translate(0, 0.2, 0); // Origin at bottom
    
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x558B2F,
      side: THREE.DoubleSide,
      roughness: 0.8
    });

    const numBlades = 15000;
    const instancedGrass = new THREE.InstancedMesh(bladeGeo, grassMat, numBlades);
    instancedGrass.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < numBlades; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 240 - 60;
      
      // Keep off the main path
      if (Math.abs(x) < 3.2) continue;

      const pathTrench = (Math.abs(x) < 5) ? 0 : (Math.abs(x) - 5) * 0.15;
      const hill = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5;
      const y = pathTrench + hill;

      dummy.position.set(x, y, z);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.scale.setScalar(0.5 + Math.random() * 0.8);
      dummy.updateMatrix();
      instancedGrass.setMatrixAt(i, dummy.matrix);
    }
    this.sceneGroup.add(instancedGrass);
  }

  private buildRealisticTrees() {
    const treeTex = TextureHelper.createRealisticTreeTexture();
    const treeMat = new THREE.SpriteMaterial({ map: treeTex });

    for (let i = 0; i < 40; i++) {
      const sprite = new THREE.Sprite(treeMat);
      
      // Place trees far away from the x=7 and x=-7 portals
      const xSign = i % 2 === 0 ? 1 : -1;
      const x = xSign * (18 + Math.random() * 25);
      const z = -Math.random() * 200;
      
      sprite.position.set(x, 4.5, z);
      sprite.scale.set(9, 9, 1);
      this.sceneGroup.add(sprite);
    }
  }

  private buildRealisticButterflies() {
    const butterflyTex = TextureHelper.createRealisticButterflyTexture();
    const butterflyMat = new THREE.SpriteMaterial({ map: butterflyTex });

    for (let i = 0; i < 30; i++) {
      const sprite = new THREE.Sprite(butterflyMat);
      sprite.scale.set(0.5, 0.5, 1);
      
      const x = (Math.random() - 0.5) * 30;
      const z = -Math.random() * 100;
      sprite.position.set(x, 1 + Math.random() * 1.5, z);
      
      this.sceneGroup.add(sprite);
      
      this.butterflies.push({
        mesh: sprite,
        basePos: sprite.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 1.5
      });
    }
  }

  private buildRealisticBirds() {
    const birdTex = TextureHelper.createRealisticBirdTexture();
    const birdMat = new THREE.SpriteMaterial({ map: birdTex });

    for (let i = 0; i < 15; i++) {
      const sprite = new THREE.Sprite(birdMat);
      sprite.scale.set(0.8, 0.8, 1);
      
      const cx = (Math.random() - 0.5) * 40;
      const cz = -Math.random() * 150;
      const radius = 4 + Math.random() * 8;
      
      this.sceneGroup.add(sprite);
      this.birds.push({
        mesh: sprite,
        center: new THREE.Vector3(cx, 0, cz),
        radius,
        speed: 0.8 + Math.random() * 0.6,
        angle: Math.random() * Math.PI * 2,
        height: 6 + Math.random() * 6
      });
    }
  }

  private buildSakuraParticles() {
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffccd5,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.sakuraParticles = new THREE.Points(geometry, material);
    this.sceneGroup.add(this.sakuraParticles);
  }

  private buildPortals() {
    this.portals.forEach(p => {
      const portalGroup = new THREE.Group();
      portalGroup.position.copy(p.position);
      portalGroup.lookAt(0, 0, 0);

      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x6c757d,
        roughness: 0.8
      });

      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.4, 0.45), stoneMat);
      leftPillar.position.set(-1.4, 1.7, 0);
      leftPillar.castShadow = true;
      portalGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.4, 0.45), stoneMat);
      rightPillar.position.set(1.4, 1.7, 0);
      rightPillar.castShadow = true;
      portalGroup.add(rightPillar);

      const archMesh = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.5), stoneMat);
      archMesh.position.set(0, 3.5, 0);
      archMesh.castShadow = true;
      portalGroup.add(archMesh);

      // Removed vine leaves ("balloons") 
      
      // Scale up the entire portal
      portalGroup.scale.set(1.6, 1.6, 1.6);

      const vortexGeo = new THREE.PlaneGeometry(2.3, 3.1);
      
      const vortexMat = new THREE.MeshBasicMaterial({
        color: p.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });

      const portalVortex = new THREE.Mesh(vortexGeo, vortexMat);
      portalVortex.position.set(0, 1.7, 0);
      portalGroup.add(portalVortex);

      const lanternMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: p.color })
      );
      lanternMesh.position.set(0, 3.1, 0.3);
      portalGroup.add(lanternMesh);

      const portalLight = new THREE.PointLight(p.color, 1.6, 7);
      portalLight.position.set(0, 2.0, 0.5);
      portalGroup.add(portalLight);

      this.sceneGroup.add(portalGroup);
      this.portalMeshes.push({ group: portalGroup, portalVortex, data: p });
    });
  }

  public getNearbyPortal(playerPos: THREE.Vector3, threshold: number = 3.4): PortalData | null {
    for (const p of this.portals) {
      const dist = playerPos.distanceTo(p.position);
      if (dist < threshold) {
        return p;
      }
    }
    return null;
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.time += delta;

    this.portalMeshes.forEach((item, idx) => {
      const pulse = 0.65 + Math.sin(this.time * 3 + idx) * 0.15;
      (item.portalVortex.material as THREE.MeshBasicMaterial).opacity = pulse;
      item.portalVortex.rotation.z = Math.sin(this.time * 1.5 + idx) * 0.05;
    });

    this.butterflies.forEach(b => {
      const t = this.time * b.speed + b.phase;
      b.mesh.position.set(
        b.basePos.x + Math.sin(t) * 1.8,
        b.basePos.y + Math.sin(t * 2) * 0.4,
        b.basePos.z + Math.cos(t) * 1.8
      );
    });

    this.birds.forEach(bird => {
      bird.angle += delta * bird.speed * 0.15;
      bird.mesh.position.set(
        bird.center.x + Math.cos(bird.angle) * bird.radius,
        bird.height + Math.sin(bird.angle * 2) * 0.6,
        bird.center.z + Math.sin(bird.angle) * bird.radius
      );
    });

    if (this.sakuraParticles) {
      const pos = this.sakuraParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - delta * 0.8;
        let x = pos.getX(i) + Math.sin(this.time + i) * delta * 0.4;
        if (y < 0) y = 14;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }
  }

  public destroy() {
    this.sceneGroup.clear();
  }
}
