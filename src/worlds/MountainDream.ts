import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class MountainDream implements IDreamWorld {
  public id = 'mountain';
  public name = 'Mountain Valley & Cabin';
  public icon = '🏡';
  public subtitle = 'A cozy sanctuary nestled between towering alpine peaks';
  public cozyQuote = 'Listen to the rushing stream... you are safe and warm in your mountain home.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'grass';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 4);
  public returnPortalPosition = new THREE.Vector3(0, 0, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@45.9763,7.7491,3a,75y,210h,100t/data=!3m6!1e1';
  public streetViewLocation = 'Zermatt Alpine Valley & Matterhorn Peaks, Switzerland';

  private riverMesh!: THREE.Mesh;
  private smokeParticles!: THREE.Points;
  private time: number = 0;

  public init() {
    this.setupLighting();
    this.buildTerrain();
    this.buildPhotoMountains();
    this.buildRiver();
    this.buildCozyCabin();
    this.buildWildflowers();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const sunLight = new THREE.DirectionalLight(0xfff1e6, 1.8);
    sunLight.position.set(25, 35, 20);
    sunLight.castShadow = true;
    this.sceneGroup.add(sunLight);

    const hemi = new THREE.HemisphereLight(0xd8f3dc, 0x90e0ef, 0.85);
    this.sceneGroup.add(hemi);
  }

  private buildPhotoMountains() {
    // High-res photographic panorama of the alpine snow peaks
    const photoTex = TextureHelper.loadPhotoTexture('/textures/mountains.jpg');
    const mtnGeo = new THREE.CylinderGeometry(55, 55, 32, 32, 1, true, 0, Math.PI);
    const mtnMat = new THREE.MeshBasicMaterial({
      map: photoTex,
      side: THREE.BackSide
    });
    const mtnPanorama = new THREE.Mesh(mtnGeo, mtnMat);
    mtnPanorama.position.set(0, 10, 0);
    mtnPanorama.rotation.y = Math.PI / 2;
    this.sceneGroup.add(mtnPanorama);
  }

  private buildTerrain() {
    const geo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const riverTrench = Math.exp(-Math.pow((x + 6) / 3.5, 2)) * -1.2;
      const hills = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
      pos.setZ(i, riverTrench + hills);
    }
    geo.computeVertexNormals();

    const grassTex = TextureHelper.createGrassTexture();
    const grassMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.8 });
    const ground = new THREE.Mesh(geo, grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.sceneGroup.add(ground);
  }

  private buildRiver() {
    const riverGeo = new THREE.PlaneGeometry(6, 75, 12, 32);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0096c7,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9
    });

    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.set(-6, -0.65, 0);
    this.sceneGroup.add(this.riverMesh);

    // Wooden footbridge across the river
    const woodTex = TextureHelper.createWoodPlankTexture();
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
    const bridge = new THREE.Group();
    bridge.position.set(-6, 0, 0);

    const planks = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.2, 2.2), woodMat);
    bridge.add(planks);

    [-1.0, 1.0].forEach(z => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.15, 0.1), woodMat);
      rail.position.set(0, 0.8, z);
      bridge.add(rail);

      for (let p = -3; p <= 3; p += 1.5) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), woodMat);
        post.position.set(p, 0.4, z);
        bridge.add(post);
      }
    });

    this.sceneGroup.add(bridge);
  }

  private buildCozyCabin() {
    const cabin = new THREE.Group();
    cabin.position.set(6, 0, -4);

    const woodTex = TextureHelper.createWoodPlankTexture();
    const logMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69, roughness: 0.7 });
    const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe3a8 });

    // Main cabin body
    const body = new THREE.Mesh(new THREE.BoxGeometry(6, 3.4, 5), logMat);
    body.position.y = 1.7;
    body.castShadow = true;
    cabin.add(body);

    // Pitched roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), roofMat);
    roof.position.y = 4.3;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1, 1);
    cabin.add(roof);

    // Chimney
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x495057, roughness: 0.9 });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.8, 0.8), chimneyMat);
    chimney.position.set(2.0, 3.2, -1.2);
    chimney.castShadow = true;
    cabin.add(chimney);

    // Windows
    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), windowGlowMat);
    win1.position.set(0, 2.0, 2.51);
    cabin.add(win1);

    // Front door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2618 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.1), doorMat);
    door.position.set(1.8, 1.05, 2.51);
    cabin.add(door);

    const cabinLight = new THREE.PointLight(0xffbe0b, 2.5, 15);
    cabinLight.position.set(1.8, 2.0, 3.2);
    cabin.add(cabinLight);

    // Chimney smoke particles
    const smokeCount = 45;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let s = 0; s < smokeCount; s++) {
      smokePos[s * 3] = 2.0 + (Math.random() - 0.5) * 0.4;
      smokePos[s * 3 + 1] = 5.2 + (s / smokeCount) * 4;
      smokePos[s * 3 + 2] = -1.2 + (Math.random() - 0.5) * 0.4;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMaterial = new THREE.PointsMaterial({
      color: 0xced4da,
      size: 0.35,
      transparent: true,
      opacity: 0.55
    });
    this.smokeParticles = new THREE.Points(smokeGeo, smokeMaterial);
    cabin.add(this.smokeParticles);

    this.sceneGroup.add(cabin);
  }

  private buildWildflowers() {
    const flowerMats = [
      new THREE.MeshStandardMaterial({ color: 0xffd166 }),
      new THREE.MeshStandardMaterial({ color: 0xff758f }),
      new THREE.MeshStandardMaterial({ color: 0x90e0ef })
    ];

    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 12;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 6, 6),
        flowerMats[i % flowerMats.length]
      );
      flower.position.set(Math.cos(angle) * dist, 0.15, Math.sin(angle) * dist);
      this.sceneGroup.add(flower);
    }
  }

  private buildReturnPortal() {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(this.returnPortalPosition);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.6 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 12, 24), stoneMat);
    arch.position.y = 1.6;
    portalGroup.add(arch);

    const glow = new THREE.PointLight(0x74c69d, 1.8, 8);
    glow.position.set(0, 1.6, 0);
    portalGroup.add(glow);

    this.sceneGroup.add(portalGroup);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.time += delta;

    if (this.riverMesh) {
      const pos = this.riverMesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        pos.setZ(i, Math.sin(y * 0.6 + this.time * 4) * 0.08);
      }
      pos.needsUpdate = true;
    }

    if (this.smokeParticles) {
      const pos = this.smokeParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * 0.8;
        let x = pos.getX(i) + Math.sin(this.time + i) * delta * 0.2;
        if (y > 9.5) {
          y = 5.2;
          x = 2.0 + (Math.random() - 0.5) * 0.3;
        }
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
