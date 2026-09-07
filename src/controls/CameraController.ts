import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  
  public yaw: number = 0; // Horizontal angle (radians)
  public pitch: number = 0; // Vertical tilt angle (radians)
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public rotate(deltaX: number, deltaY: number) {
    this.yaw -= deltaX;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch - deltaY, // Invert Y for standard FPS mouse look
      -Math.PI / 2 + 0.1, // Max look up
      Math.PI / 2 - 0.1   // Max look down
    );
  }

  public setZoom(delta: number) {
    // Zoom by adjusting the FOV (Field of View)
    this.camera.fov = THREE.MathUtils.clamp(this.camera.fov + delta, 10, 150);
    this.camera.updateProjectionMatrix();
  }

  public resetZoom() {
    this.camera.fov = 55;
    this.camera.updateProjectionMatrix();
  }

  public update(delta: number, characterPosition: THREE.Vector3, characterHeight: number = 1.6) {
    // Eye level position
    const eyePos = new THREE.Vector3(
      characterPosition.x,
      characterPosition.y + characterHeight,
      characterPosition.z
    );

    this.camera.position.copy(eyePos);

    // Calculate look direction from yaw and pitch
    const lookX = Math.sin(this.yaw) * Math.cos(this.pitch);
    const lookY = Math.sin(this.pitch);
    const lookZ = Math.cos(this.yaw) * Math.cos(this.pitch);
    
    const lookDir = new THREE.Vector3(lookX, lookY, lookZ).normalize();
    const targetPos = eyePos.clone().add(lookDir);

    this.camera.lookAt(targetPos);
  }

  public getForwardVector(): THREE.Vector3 {
    // Camera forward vector projected onto the horizontal plane (for character movement)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    return forward.normalize();
  }

  public getRightVector(): THREE.Vector3 {
    const forward = this.getForwardVector();
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3().crossVectors(forward, up).normalize();
  }
}
