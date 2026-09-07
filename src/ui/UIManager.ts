import { WorldManager } from '../worlds/WorldManager';
import { IDreamWorld, PortalData } from '../worlds/WorldInterface';
import { SoundEngine } from '../audio/SoundEngine';
import { CameraController } from '../controls/CameraController';

export class UIManager {
  private worldManager: WorldManager;
  private soundEngine: SoundEngine;
  private cameraController: CameraController;

  private loadingScreen: HTMLElement | null;
  private loadingBar: HTMLElement | null;
  private loadingText: HTMLElement | null;
  private startBtn: HTMLElement | null;

  private worldIcon: HTMLElement | null;
  private worldTitle: HTMLElement | null;
  private soundBtn: HTMLElement | null;
  private cameraBtn: HTMLElement | null;
  private drawerToggleBtn: HTMLElement | null;
  private drawerCloseBtn: HTMLElement | null;
  private dreamDrawer: HTMLElement | null;
  private dreamListContainer: HTMLElement | null;

  private streetViewBtn: HTMLElement | null;
  private streetViewModal: HTMLElement | null;
  private modalCloseBtn: HTMLElement | null;
  private modalLocationTitle: HTMLElement | null;
  private modalLocationDesc: HTMLElement | null;
  private modalStreetViewLink: HTMLAnchorElement | null;
  private modalLinksGrid: HTMLElement | null;

  private interactionPrompt: HTMLElement | null;
  private promptName: HTMLElement | null;
  private enterPortalBtn: HTMLElement | null;

  private cozyToast: HTMLElement | null;
  private photoIndicator: HTMLElement | null;
  private uiContainer: HTMLElement | null;

  private activeNearbyPortal: PortalData | null = null;
  private toastTimeout: number | null = null;
  private isPhotoMode: boolean = false;

  constructor(worldManager: WorldManager, soundEngine: SoundEngine, cameraController: CameraController) {
    this.worldManager = worldManager;
    this.soundEngine = soundEngine;
    this.cameraController = cameraController;

    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingText = document.getElementById('loading-text');
    this.startBtn = document.getElementById('start-btn');

    this.worldIcon = document.getElementById('world-icon');
    this.worldTitle = document.getElementById('world-title');
    this.soundBtn = document.getElementById('sound-btn');
    this.cameraBtn = document.getElementById('camera-mode-btn');
    this.drawerToggleBtn = document.getElementById('drawer-toggle-btn');
    this.drawerCloseBtn = document.getElementById('drawer-close-btn');
    this.dreamDrawer = document.getElementById('dream-drawer');
    this.dreamListContainer = document.getElementById('dream-list-container');

    this.streetViewBtn = document.getElementById('streetview-btn');
    this.streetViewModal = document.getElementById('streetview-modal');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalLocationTitle = document.getElementById('modal-location-title');
    this.modalLocationDesc = document.getElementById('modal-location-desc');
    this.modalStreetViewLink = document.getElementById('modal-streetview-link') as HTMLAnchorElement | null;
    this.modalLinksGrid = document.getElementById('modal-links-grid');

    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.promptName = document.getElementById('prompt-name');
    this.enterPortalBtn = document.getElementById('enter-portal-btn');

    this.cozyToast = document.getElementById('cozy-toast');
    this.photoIndicator = document.getElementById('photo-indicator');
    this.uiContainer = document.getElementById('ui-container');

    this.setupEventListeners();
    this.renderDreamList();
    this.renderStreetViewGrid();

    // Hook world manager callbacks
    this.worldManager.setOnWorldChange((world) => this.onWorldChanged(world));
    this.worldManager.setOnPromptChange((portal, isReturn) => this.onPromptChanged(portal, isReturn));
  }

  public setLoadProgress(percent: number, text: string) {
    if (this.loadingBar) this.loadingBar.style.width = `${percent}%`;
    if (this.loadingText) this.loadingText.textContent = text;

    if (percent >= 100 && this.startBtn) {
      if (this.loadingText) this.loadingText.style.display = 'none';
      this.startBtn.style.display = 'inline-block';
    }
  }

  private setupEventListeners() {
    // Start button
    this.startBtn?.addEventListener('click', () => {
      this.soundEngine.init();
      
      // Initialize videos to bypass autoplay policy
      this.worldManager.getAllWorlds().forEach(w => {
        if (typeof (w as any).playVideo === 'function') {
          (w as any).playVideo();
        }
      });

      this.loadingScreen?.classList.add('fade-out');
      setTimeout(() => {
        if (this.loadingScreen) this.loadingScreen.style.display = 'none';
      }, 800);
      this.showToast('Welcome to your journey! Use WASD or the joystick to walk 🌸');
    });

    // Sound toggle
    this.soundBtn?.addEventListener('click', () => {
      const isAudible = this.soundEngine.toggleMute();
      if (this.soundBtn) {
        this.soundBtn.textContent = isAudible ? '🔊' : '🔇';
      }
    });

    // Camera / Photo Mode Toggle
    this.cameraBtn?.addEventListener('click', () => {
      this.togglePhotoMode();
    });

    this.photoIndicator?.addEventListener('click', () => {
      this.togglePhotoMode();
    });

    // Drawer Open / Close
    this.drawerToggleBtn?.addEventListener('click', () => {
      this.dreamDrawer?.classList.toggle('open');
    });

    this.drawerCloseBtn?.addEventListener('click', () => {
      this.dreamDrawer?.classList.remove('open');
    });

    // Street View Explorer Modal
    this.streetViewBtn?.addEventListener('click', () => {
      this.openStreetViewModal();
    });

    this.modalCloseBtn?.addEventListener('click', () => {
      this.closeStreetViewModal();
    });

    this.streetViewModal?.addEventListener('click', (e) => {
      if (e.target === this.streetViewModal) {
        this.closeStreetViewModal();
      }
    });

    // Enter Portal Button Click
    this.enterPortalBtn?.addEventListener('click', () => {
      if (this.activeNearbyPortal) {
        this.worldManager.transitionTo(this.activeNearbyPortal.id);
      }
    });

    // Also handle mobile enter button
    const mobileInteract = document.getElementById('mobile-interact-btn');
    mobileInteract?.addEventListener('click', () => {
      if (this.activeNearbyPortal) {
        this.worldManager.transitionTo(this.activeNearbyPortal.id);
      }
    });

    // Dream Controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.cameraController.setZoom(-10); // Reduce FOV (zoom in)
    });
    
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.cameraController.setZoom(10); // Increase FOV (zoom out)
    });

    document.getElementById('btn-exit-dream')?.addEventListener('click', () => {
      this.cameraController.resetZoom();
      this.worldManager.transitionTo('garden');
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeStreetViewModal();
        this.dreamDrawer?.classList.remove('open');
      }
    });
  }

  public openStreetViewModal() {
    const current = this.worldManager.currentWorld;
    if (current) {
      if (this.modalLocationTitle) {
        this.modalLocationTitle.textContent = `${current.icon} ${current.name}`;
      }
      if (this.modalLocationDesc) {
        this.modalLocationDesc.textContent = current.streetViewLocation
          ? `📍 Authentic Location: ${current.streetViewLocation}`
          : 'Experience the real-world street view and atmosphere of this dream destination.';
      }
      if (this.modalStreetViewLink) {
        this.modalStreetViewLink.href = current.streetViewUrl || '#';
        this.modalStreetViewLink.textContent = `🚀 Open ${current.name} in Google 360° Street View ↗`;
      }
    }
    this.streetViewModal?.classList.add('open');
  }

  public closeStreetViewModal() {
    this.streetViewModal?.classList.remove('open');
  }

  private renderStreetViewGrid() {
    if (!this.modalLinksGrid) return;
    this.modalLinksGrid.innerHTML = '';

    const allWorlds = this.worldManager.getAllWorlds();
    allWorlds.forEach(w => {
      if (!w.streetViewUrl) return;
      const link = document.createElement('a');
      link.className = 'streetview-item';
      link.href = w.streetViewUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `
        <span style="font-size:1.3rem">${w.icon}</span>
        <div>
          <strong style="display:block; font-size:0.85rem">${w.name}</strong>
          <span style="font-size:0.7rem; color:rgba(255,255,255,0.6)">${w.streetViewLocation || 'Explore 360°'}</span>
        </div>
      `;
      this.modalLinksGrid?.appendChild(link);
    });
  }

  private togglePhotoMode() {
    this.isPhotoMode = !this.isPhotoMode;
    if (this.uiContainer) {
      this.uiContainer.style.display = this.isPhotoMode ? 'none' : 'block';
    }
    if (this.photoIndicator) {
      this.photoIndicator.style.display = this.isPhotoMode ? 'block' : 'none';
    }
    if (this.isPhotoMode) {
      this.showToast('Photo Mode: Tap anywhere to show controls again 📷');
    }
  }

  private renderDreamList() {
    if (!this.dreamListContainer) return;
    this.dreamListContainer.innerHTML = '';

    const allWorlds = this.worldManager.getAllWorlds();
    allWorlds.forEach(world => {
      const card = document.createElement('div');
      card.className = `dream-card ${world.id === this.worldManager.currentWorldId ? 'active' : ''}`;
      card.innerHTML = `
        <div class="dream-card-icon">${world.icon}</div>
        <div class="dream-card-info">
          <h4>${world.name}</h4>
          <p>${world.subtitle}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        this.worldManager.transitionTo(world.id);
        this.dreamDrawer?.classList.remove('open');
      });
      this.dreamListContainer?.appendChild(card);
    });
  }

  private onWorldChanged(world: IDreamWorld) {
    if (this.worldIcon) this.worldIcon.textContent = world.icon;
    if (this.worldTitle) this.worldTitle.textContent = world.name;

    this.renderDreamList();
    this.showToast(world.cozyQuote);

    if (this.streetViewModal?.classList.contains('open')) {
      this.openStreetViewModal();
    }

    const isGarden = world.id === 'garden';

    // Toggle specific controls
    const dreamControls = document.getElementById('dream-controls');
    if (dreamControls) dreamControls.style.display = isGarden ? 'none' : 'flex';

    // Hide extra buttons when inside a dream room
    if (this.soundBtn) this.soundBtn.style.display = isGarden ? '' : 'none';
    if (this.cameraBtn) this.cameraBtn.style.display = isGarden ? '' : 'none';
    if (this.drawerToggleBtn) this.drawerToggleBtn.style.display = isGarden ? '' : 'none';
    
    const worldBadge = document.getElementById('current-world-badge');
    if (worldBadge) worldBadge.style.display = isGarden ? '' : 'none';

    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) mobileControls.style.display = isGarden ? '' : 'none';

    const desktopGuide = document.getElementById('desktop-guide');
    if (desktopGuide) desktopGuide.style.display = isGarden ? '' : 'none';
  }

  private onPromptChanged(portal: PortalData | null, isReturn: boolean) {
    this.activeNearbyPortal = portal;

    if (portal && this.interactionPrompt) {
      this.interactionPrompt.classList.add('visible');
      if (this.promptName) {
        this.promptName.textContent = portal.name;
      }
      if (this.enterPortalBtn) {
        this.enterPortalBtn.innerHTML = isReturn
          ? '<span>Return to Garden</span> 🌸'
          : `<span>Step Into ${portal.name}</span> ✨`;
      }
    } else if (this.interactionPrompt) {
      this.interactionPrompt.classList.remove('visible');
    }
  }

  public showToast(message: string, duration: number = 4200) {
    if (!this.cozyToast) return;
    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
    }
    this.cozyToast.textContent = message;
    this.cozyToast.classList.add('show');

    this.toastTimeout = window.setTimeout(() => {
      this.cozyToast?.classList.remove('show');
      this.toastTimeout = null;
    }, duration);
  }

  public handleInteractionKey() {
    if (this.activeNearbyPortal) {
      this.worldManager.transitionTo(this.activeNearbyPortal.id);
    }
  }
}
