import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class KrishnaDream implements IDreamWorld {
  public id = 'krishna';
  public name = 'Cosmic Path to Lord Krishna';
  public icon = '🦚';
  public subtitle = 'A celestial flight across the solar system culminating in divine peace';
  public cozyQuote = 'The entire universe smiles with you. May supreme peace, love, and divine grace fill your heart.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'stone';
  public isUnderwaterOrCosmic = true;
  public spawnPosition = new THREE.Vector3(0, 0, 16);
  public returnPortalPosition = new THREE.Vector3(0, 0, 22);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://earth.google.com/web/@0,0,0a,2225175.27d,35y,0h,0t,0r';
  public streetViewLocation = 'Planet Earth & Vrindavan Holy Shrines (Google Earth 3D)';

  private earthMesh!: THREE.Mesh;
  private saturnMesh!: THREE.Group;
  private haloMesh!: THREE.Mesh;
  private cosmosSkyMesh!: THREE.Mesh;
  private divineGlowLight!: THREE.PointLight;
  private time: number = 0;

  public init() {
    this.setupLighting();
    this.buildMilkyWayCosmos();
    this.buildPhotorealisticPlanets();
    this.buildRainbowBridge();
    this.buildDivineSanctuary();
    this.buildLordKrishna();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0x9d4edd, 0x03045e, 0.7);
    this.sceneGroup.add(hemiLight);

    this.divineGlowLight = new THREE.PointLight(0xffbe0b, 4.0, 40);
    this.divineGlowLight.position.set(0, 4.5, -14);
    this.sceneGroup.add(this.divineGlowLight);
  }

  private buildMilkyWayCosmos() {
    // Real ESO high-res Milky Way panoramic dome
    const cosmosTex = TextureHelper.loadPhotoTexture('/textures/milkyway.jpg');
    const skyGeo = new THREE.SphereGeometry(90, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: cosmosTex,
      side: THREE.BackSide
    });
    this.cosmosSkyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.sceneGroup.add(this.cosmosSkyMesh);
  }

  private buildPhotorealisticPlanets() {
    // 1. Photorealistic NASA Blue Marble Earth
    const earthTex = TextureHelper.loadPhotoTexture('/textures/earth.jpg');
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.45,
      metalness: 0.1
    });
    this.earthMesh = new THREE.Mesh(new THREE.SphereGeometry(4.2, 32, 32), earthMat);
    this.earthMesh.position.set(-22, 10, 16);
    this.sceneGroup.add(this.earthMesh);

    // Atmospheric outer blue glow on Earth
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(4.4, 32, 32), atmoMat);
    this.earthMesh.add(atmo);

    // 2. Ringed Saturn floating in the cosmos
    this.saturnMesh = new THREE.Group();
    this.saturnMesh.position.set(26, 16, -8);

    const saturnMat = new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.5 });
    const saturnBody = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 24), saturnMat);
    this.saturnMesh.add(saturnBody);

    // Rings
    const ringGeo = new THREE.RingGeometry(3.6, 6.2, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe9c46a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const saturnRing = new THREE.Mesh(ringGeo, ringMat);
    saturnRing.rotation.x = Math.PI / 3;
    this.saturnMesh.add(saturnRing);
    this.sceneGroup.add(this.saturnMesh);

    // 3. Glowing Golden Sun in distance
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(8, 24, 24), sunMat);
    sun.position.set(-45, 30, -50);
    this.sceneGroup.add(sun);
  }

  private buildRainbowBridge() {
    const bridgeGeo = new THREE.BoxGeometry(4.5, 0.15, 34);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.8
    });

    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 0, 0);
    this.sceneGroup.add(bridge);

    const crystalMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    for (let z = -16; z <= 16; z += 4) {
      [-2.4, 2.4].forEach(x => {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), crystalMat);
        crystal.position.set(x, 0.4, z);
        this.sceneGroup.add(crystal);
      });
    }
  }

  private buildDivineSanctuary() {
    const daisGroup = new THREE.Group();
    daisGroup.position.set(0, 0, -14);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.9,
      roughness: 0.15
    });

    const dais = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.2, 0.6, 32), goldMat);
    dais.position.y = 0.3;
    daisGroup.add(dais);

    // Blooming divine lotus blossoms 🪷
    const lotusPetalMat = new THREE.MeshStandardMaterial({
      color: 0xff758f,
      roughness: 0.35
    });

    for (let l = 0; l < 16; l++) {
      const angle = (l / 16) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 6), lotusPetalMat);
      petal.rotation.x = Math.PI / 3;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 5.8, 0.6, Math.sin(angle) * 5.8);
      daisGroup.add(petal);
    }

    this.sceneGroup.add(daisGroup);
  }

  private buildLordKrishna() {
    const krishna = new THREE.Group();
    krishna.position.set(0, 0.6, -14);

    const shyamSkinMat = new THREE.MeshStandardMaterial({
      color: 0x48cae4, // Shyamasundara cloud-blue complexion
      roughness: 0.5,
      metalness: 0.1
    });

    const pitambaraMat = new THREE.MeshStandardMaterial({
      color: 0xffbe0b, // Pitambara radiant yellow silk
      roughness: 0.55,
      metalness: 0.15
    });

    const goldJewelryMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.9,
      roughness: 0.15
    });

    const fluteMat = new THREE.MeshStandardMaterial({
      color: 0xffd60a,
      metalness: 0.85,
      roughness: 0.2
    });

    // Tribhanga gentle curve posture
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.2, 16), shyamSkinMat);
    torso.position.y = 2.4;
    torso.rotation.z = -0.08;
    krishna.add(torso);

    const dhoti = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.6, 16), pitambaraMat);
    dhoti.position.y = 1.1;
    dhoti.rotation.z = 0.08;
    krishna.add(dhoti);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), shyamSkinMat);
    head.position.y = 3.35;
    krishna.add(head);

    // Crown (Mukut)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 8), goldJewelryMat);
    crown.position.y = 3.85;
    krishna.add(crown);

    // Sacred Peacock Feather (Mor Pankh) 🦚
    const featherGroup = new THREE.Group();
    featherGroup.position.set(0.12, 4.15, 0);

    const featherBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.6, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0077b6 })
    );
    featherGroup.add(featherBase);

    const featherEye = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 12),
      new THREE.MeshBasicMaterial({ color: 0x38b000 })
    );
    featherEye.position.set(0.03, 0.15, 0);
    featherGroup.add(featherEye);

    const centerEye = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 12),
      new THREE.MeshBasicMaterial({ color: 0x5a189a })
    );
    centerEye.position.set(0.04, 0.15, 0);
    featherGroup.add(centerEye);

    krishna.add(featherGroup);

    // Golden Flute (Bansuri) held to smiling lips
    const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12), fluteMat);
    flute.position.set(0.35, 3.25, 0.28);
    flute.rotation.z = Math.PI / 3;
    flute.rotation.y = 0.2;
    krishna.add(flute);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 8), shyamSkinMat);
    rightArm.position.set(0.42, 2.9, 0.15);
    rightArm.rotation.set(-0.4, 0, -0.7);
    krishna.add(rightArm);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 8), shyamSkinMat);
    leftArm.position.set(-0.25, 2.8, 0.18);
    leftArm.rotation.set(-0.5, 0, 0.6);
    krishna.add(leftArm);

    // Flower Garland
    const garland = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.07, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    garland.position.set(0, 2.4, 0.12);
    garland.rotation.x = Math.PI / 6;
    krishna.add(garland);

    // Radiant Divine Halo (Prabhavali)
    const haloGeo = new THREE.RingGeometry(0.6, 1.4, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.position.set(0, 3.45, -0.3);
    krishna.add(this.haloMesh);

    this.sceneGroup.add(krishna);
  }

  private buildReturnPortal() {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(this.returnPortalPosition);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x48cae4, roughness: 0.4 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 12, 24), stoneMat);
    arch.position.y = 1.6;
    portalGroup.add(arch);

    const glow = new THREE.PointLight(0xffbe0b, 2.0, 8);
    glow.position.set(0, 1.6, 0);
    portalGroup.add(glow);

    this.sceneGroup.add(portalGroup);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.time += delta;

    if (this.earthMesh) {
      this.earthMesh.rotation.y += delta * 0.15;
    }
    if (this.saturnMesh) {
      this.saturnMesh.rotation.y += delta * 0.08;
    }
    if (this.cosmosSkyMesh) {
      this.cosmosSkyMesh.rotation.y += delta * 0.005;
    }

    if (this.haloMesh) {
      this.haloMesh.rotation.z = this.time * 0.2;
      const pulse = 0.75 + Math.sin(this.time * 2.5) * 0.15;
      (this.haloMesh.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    if (this.divineGlowLight) {
      this.divineGlowLight.intensity = 3.5 + Math.sin(this.time * 3) * 0.5;
    }
  }

  public destroy() {
    this.sceneGroup.clear();
  }
}
