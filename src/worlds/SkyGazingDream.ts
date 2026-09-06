import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class SkyGazingDream implements IDreamWorld {
  public id = 'skygazing';
  public name = 'Cloud Gazing Peak';
  public icon = '☁️';
  public subtitle = 'Resting high above an endless sea of clouds & forests';
  public cozyQuote = 'The world below fades into clouds. Up here, your mind is free and peaceful.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'grass';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 4);
  public returnPortalPosition = new THREE.Vector3(0, 0, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@45.8792,6.8876,3a,75y,150h,90t/data=!3m6!1e1';
  public streetViewLocation = 'Aiguille du Midi Peak & Mont Blanc, Chamonix, France';

  private cloudPuffs: { mesh: THREE.Group; speed: number; startX: number }[] = [];
  private time: number = 0;

  public init() {
    this.setupLighting();
    this.buildPhotoBackdrop();
    this.buildCliffPromontory();
    this.buildSeaOfClouds();
    this.buildDistantForest();
    this.buildObservationBench();
    this.buildFloatingCloudPuffs();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.0);
    sunLight.position.set(30, 40, 20);
    sunLight.castShadow = true;
    this.sceneGroup.add(sunLight);

    const skyLight = new THREE.HemisphereLight(0xade8f4, 0x48cae4, 1.2);
    this.sceneGroup.add(skyLight);
  }

  private buildPhotoBackdrop() {
    // 360 panoramic mountain and sky photographic vista
    const photoTex = TextureHelper.loadPhotoTexture('/textures/mountains.jpg');
    const panoGeo = new THREE.CylinderGeometry(60, 60, 36, 32, 1, true);
    const panoMat = new THREE.MeshBasicMaterial({
      map: photoTex,
      side: THREE.BackSide,
      fog: false
    });
    const panoMesh = new THREE.Mesh(panoGeo, panoMat);
    panoMesh.position.y = 8;
    this.sceneGroup.add(panoMesh);
  }

  private buildCliffPromontory() {
    // High mountain cliff top with procedural PBR stone texture
    const stoneTex = TextureHelper.createCobblestoneTexture();
    stoneTex.repeat.set(4, 2);
    const cliffGeo = new THREE.CylinderGeometry(14, 11, 24, 24);
    const cliffMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.9
    });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.y = -12;
    this.sceneGroup.add(cliff);

    // Lush grass top on cliff using procedural PBR grass texture
    const grassTex = TextureHelper.createGrassTexture();
    grassTex.repeat.set(3, 3);
    const topGeo = new THREE.CircleGeometry(14, 24);
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.75
    });
    const top = new THREE.Mesh(topGeo, grassMat);
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.02;
    top.receiveShadow = true;
    this.sceneGroup.add(top);
  }

  private buildSeaOfClouds() {
    // Vast rolling cloud bed below the cliff at y = -6
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      transparent: true,
      opacity: 0.88
    });

    for (let c = 0; c < 45; c++) {
      const angle = (c / 45) * Math.PI * 2;
      const dist = 18 + (c % 4) * 8;
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(Math.cos(angle) * dist, -5 + (Math.random() - 0.5) * 1.5, Math.sin(angle) * dist);

      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(3.5 + Math.random() * 2.5, 12, 12),
          cloudMat
        );
        puff.position.set((p - 1.5) * 2.5, 0, (Math.random() - 0.5) * 2);
        cloudGroup.add(puff);
      }
      this.sceneGroup.add(cloudGroup);
    }
  }

  private buildDistantForest() {
    // Forest mountain ridges rising through the clouds in the far distance
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.9 });

    for (let f = 0; f < 36; f++) {
      const angle = (f / 36) * Math.PI * 2;
      if (angle > Math.PI * 0.3 && angle < Math.PI * 0.7) continue; // Leave wide open vista

      const dist = 45 + (f % 3) * 6;
      const tree = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 12, 6),
        treeMat
      );
      tree.position.set(Math.cos(angle) * dist, -2, Math.sin(angle) * dist);
      this.sceneGroup.add(tree);
    }
  }

  private buildObservationBench() {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(0, 0, -8);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.6), woodMat);
    seat.position.y = 0.5;
    benchGroup.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.1), woodMat);
    back.position.set(0, 0.9, 0.28);
    benchGroup.add(back);

    // Brass Telescope on tripod looking out to horizon
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 });
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.2, 12), brassMat);
    scope.position.set(1.8, 1.4, -0.2);
    scope.rotation.x = -Math.PI / 6;
    benchGroup.add(scope);

    // Tripod legs
    for (let l = 0; l < 3; l++) {
      const legAngle = (l / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), brassMat);
      leg.position.set(1.8 + Math.cos(legAngle) * 0.25, 0.6, -0.2 + Math.sin(legAngle) * 0.25);
      leg.rotation.z = Math.cos(legAngle) * 0.25;
      leg.rotation.x = Math.sin(legAngle) * 0.25;
      benchGroup.add(leg);
    }

    this.sceneGroup.add(benchGroup);
  }

  private buildFloatingCloudPuffs() {
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3
    });

    for (let i = 0; i < 6; i++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 3; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 10, 10), puffMat);
        puff.position.set((p - 1) * 1.0, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.5);
        cloud.add(puff);
      }
      const startX = -25 + i * 9;
      cloud.position.set(startX, 1.5 + (i % 2) * 1.5, -4 - i * 3);
      this.sceneGroup.add(cloud);

      this.cloudPuffs.push({
        mesh: cloud,
        speed: 0.6 + Math.random() * 0.5,
        startX
      });
    }
  }

  private buildReturnPortal() {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(this.returnPortalPosition);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x90e0ef, roughness: 0.5 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 12, 24), stoneMat);
    arch.position.y = 1.6;
    portalGroup.add(arch);

    const glow = new THREE.PointLight(0x00b4d8, 1.8, 8);
    glow.position.set(0, 1.6, 0);
    portalGroup.add(glow);

    this.sceneGroup.add(portalGroup);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.time += delta;

    // Drifting cloud puffs across the lookout
    this.cloudPuffs.forEach(c => {
      c.mesh.position.x += delta * c.speed;
      if (c.mesh.position.x > 25) {
        c.mesh.position.x = -25;
      }
    });
  }

  public destroy() {
    this.sceneGroup.clear();
  }
}
