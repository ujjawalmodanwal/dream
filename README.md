# A Journey of Dreams ✨🌸

An uplifting, cozy 3D interactive web experience designed to take your friend through his dream destinations in third-person view.

---

## 🌟 What Was Built

### 1. Realistic Third-Person Avatar (Beautiful Female Character)
- Beautiful, realistic feminine 3D model with porcelain-fair / white skin tone (`#fdf0eb`), natural lip gloss, almond hazel-brown eyes, and soft rosy cheeks.
- Long silky dark chestnut hair cascading past her shoulders with layered wispy bangs.
- Realistic travel-chic attire: cozy ivory/cream cashmere ribbed turtleneck sweater, tailored slim charcoal trousers, dark leather Chelsea ankle boots, and delicate gold pendant jewelry.
- Lifelike procedural skeletal animation system:
  - **Idle**: Realistic breathing with chest expansion, subtle weight shifts between feet, gentle head turns.
  - **Walk**: Graceful, natural feminine bipedal stride with hip sway and natural arm swing.
  - **Run**: Athletic, smooth running gait.
  - **Jump**: Natural crouch, leap, and landing recovery.
  - **Swim / Float**: Fluid, elegant breaststroke and floating flutter (activates in the Ocean Depths and Cosmic worlds!).

### 2. Real-World Photographic Environments & PBR Textures
- **Underwater**: Authentic 360° equirectangular Great Barrier Reef Google Ocean Street View panorama (`underwater.jpg`), with schools of tropical fish and deep-sea swimming physics.
- **Paris**: Authentic photographic vista of the Eiffel Tower (`eiffel.jpg`), Champ de Mars cobblestone terrace, Parisian street lamps, and bistro terrace.
- **Varanasi**: Authentic photographic sunset vista of the sacred Varanasi Ghats (`varanasi.jpg`), wooden boat deck, evening Aarti torches, and floating flower diyas.
- **Mountain Grassland**: Matterhorn alpine peak photographic panorama (`mountains.jpg`), lush green grass, rushing river with wooden footbridge, and cozy cabin.
- **Aurora**: Authentic Alaskan Aurora Borealis night sky photograph (`aurora.jpg`), snow-covered landscape, and cozy campfire.
- **Cloud Gazing Peak**: Mont Blanc / Aiguille du Midi alpine panorama above a rolling sea of volumetric clouds with observation bench and telescope.
- **Cosmic Path to Lord Krishna**: NASA Blue Marble Earth photograph (`earth.jpg`), ESO Milky Way deep-space panorama (`milkyway.jpg`), ringed Saturn, and radiant Lord Krishna with peacock feather, pitambara robes, and golden flute.
- **Italy**: Rustic Tuscan patio with terracotta tiles, brick pergola, and hot wood-fired pizza with bubbling cheese and fresh basil (`pizza.jpg`).
- **Garden Hub**: Cobblestone circular pathway, rolling grass, fountain plaza, animated songbirds, and butterflies.
- **🌍 Real Street View Explorer**: One-click top-bar button to view the exact real-world Google Maps / Street View 360° panorama for any of the locations.

### 3. Real Audio Field Recordings
- Directly bundles authentic real-world field recordings:
  - **Garden**: `forest.mp3` - Real birds singing in the morning forest with rustling leaves.
  - **Mountain**: `river.mp3` - Real mountain stream flowing water.
  - **Aurora / Snow**: `wind.mp3` & `campfire.mp3` - Real howling polar wind and crackling fire.
  - **Varanasi**: `ganges.ogg` & `temple_bell.ogg` - Real holy Ganga river water lapping and resonant bronze temple bells.
  - **Italy & Paris**: `cafe.ogg` - Real cafe patio chatter, plates, and coffee cups.
  - **Underwater**: `bubbles.ogg` - Real underwater air bubbles and ocean swells.
  - **Lord Krishna**: Authentic divine Bansuri bamboo flute raga melodies layered with temple bells.

### 5. Laptop & Mobile Controls
- **Laptop**:
  - `W` `A` `S` `D` / Arrow Keys: Move
  - `Shift`: Sprint
  - `Space`: Jump (or swim up)
  - `Mouse Drag`: Rotate camera orbit
  - `Scroll Wheel`: Zoom camera in/out
  - `E`: Step through nearby portal
  - `📷`: Toggle Photo Mode (hides HUD for pristine screenshots)
  - `🗺️`: Open Dream Drawer for instant fast-travel to any world
- **Mobile**:
  - Virtual analog touch joystick on bottom-left of screen
  - Swipe anywhere on the right half of the screen to orbit camera
  - Touch buttons: **[ENTER]**, **[RUN]**, **[JUMP]**
  - Responsive glassmorphism drawer for quick travel
  - Capped pixel ratio for smooth 60fps and low battery drain.

---

## 🚀 How to Run Locally

```bash
cd /Users/ujjawalm/dream-portals
npm run dev
```
Open the printed local URL (e.g. `http://localhost:3000`) in your browser.

---

## 🌐 How to Host Temporarily for Your Friend (1-Minute Guide)

### Option A: Free Vercel Deployment (Easiest & Fastest)
1. Run in terminal:
   ```bash
   cd /Users/ujjawalm/dream-portals
   npx vercel
   ```
2. Follow the 2 prompts (press Enter to accept defaults).
3. It will generate a public HTTPS URL (e.g. `https://dream-portals.vercel.app`) that you can instantly message to your friend!

### Option B: Drag & Drop with Netlify Drop (No terminal login required)
1. Build the production files:
   ```bash
   npm run build
   ```
2. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag the generated `/Users/ujjawalm/dream-portals/dist` folder directly into the Netlify webpage.
4. Netlify will instantly give you a live shareable link!
