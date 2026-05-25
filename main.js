import * as THREE from 'three';
import gsap from 'gsap';

console.log('🚀 Vibe-Sync v2.0 Loading...');

// ========== SOUND SYSTEM ==========
let soundEnabled = true;
const sounds = {};

// Initialize sounds
function initSounds() {
    try {
        sounds.generate = new Audio('/assets/sounds/generate.mp3');
        sounds.success = new Audio('/assets/sounds/success.mp3');
        sounds.click = new Audio('/assets/sounds/click.mp3');
        sounds.close = new Audio('/assets/sounds/close.mp3');

        // Configure audio
        Object.values(sounds).forEach(sound => {
            sound.volume = 0.4;
            sound.preload = 'auto';
        });

        console.log('✅ Sounds initialized');
    } catch (error) {
        console.log('⚠️ Sound initialization error:', error);
    }

    // Load sound state from localStorage
    const savedSoundState = localStorage.getItem('vibesync_sound');
    if (savedSoundState !== null) {
        soundEnabled = savedSoundState === 'true';
        updateSoundIcon();
    }
}

// Play sound function
function playSound(soundName) {
    if (!soundEnabled) return;

    try {
        const sound = sounds[soundName];
        if (sound) {
            // Create a new instance to allow overlapping sounds
            const soundClone = new Audio(sound.src);
            soundClone.volume = 0.4;
            soundClone.play().catch(() => { });
        }
    } catch (error) {
        // Silent fail - don't break the app if sound fails
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('vibesync_sound', soundEnabled);
    updateSoundIcon();
    playSound('click');
}

// Update sound icon
function updateSoundIcon() {
    const icon = document.getElementById('sound-icon');
    if (icon) {
        icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        // Add animation
        icon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    }
}

// ========== GALLERY VARIABLES ==========
let generatedImages = [];

// ========== THREE.JS SCENE SETUP ==========
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.008);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ========== SPARKLE PARTICLE SYSTEM ==========
const PARTICLE_COUNT = 20000;

// Create sparkle texture
const createSparkleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(30, 0, 4, 64);
    ctx.fillRect(0, 30, 64, 4);

    return new THREE.CanvasTexture(canvas);
};

const sparkleTexture = createSparkleTexture();

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const velocities = new Float32Array(PARTICLE_COUNT * 3);

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    const radius = Math.random() * 35 + 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    const colorMix = Math.random();
    if (colorMix < 0.33) {
        colors[i3] = 0.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 1.0;
    } else if (colorMix < 0.66) {
        colors[i3] = 0.0;
        colors[i3 + 1] = 0.7;
        colors[i3 + 2] = 1.0;
    } else {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.0;
        colors[i3 + 2] = 0.6;
    }

    sizes[i] = Math.random() * 1.5 + 0.5;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    map: sparkleTexture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    sizeAttenuation: true
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Update particle count
document.getElementById('particle-count').textContent = PARTICLE_COUNT.toLocaleString();

// ========== ANIMATION LOOP ==========
let time = 0;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    const posAttr = particles.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posAttr.array[i3] += velocities[i3];
        posAttr.array[i3 + 1] += velocities[i3 + 1];
        posAttr.array[i3 + 2] += velocities[i3 + 2];

        const distance = Math.sqrt(
            posAttr.array[i3] ** 2 +
            posAttr.array[i3 + 1] ** 2 +
            posAttr.array[i3 + 2] ** 2
        );

        if (distance > 50) {
            const radius = Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            posAttr.array[i3] = radius * Math.sin(phi) * Math.cos(theta);
            posAttr.array[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            posAttr.array[i3 + 2] = radius * Math.cos(phi);
        }
    }
    posAttr.needsUpdate = true;

    particles.rotation.y += 0.0003;
    particles.rotation.x = Math.sin(time * 0.1) * 0.05;

    const scale = 1 + Math.sin(time * 0.3) * 0.03;
    particles.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}
animate();

// ========== UI ELEMENTS ==========
const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const statusDiv = document.getElementById('status');

function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = 'show';

    if (type === 'error') {
        statusDiv.style.color = '#ff0055';
        statusDiv.style.borderColor = 'rgba(255, 0, 85, 0.3)';
    } else if (type === 'success') {
        statusDiv.style.color = '#00ff88';
        statusDiv.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    } else {
        statusDiv.style.color = '#00ffcc';
        statusDiv.style.borderColor = 'rgba(0, 255, 204, 0.3)';
    }
}

// ========== GALLERY FUNCTIONS ==========

function showImageGallery(imageData, originalPrompt) {
    playSound('success');

    // Remove existing gallery
    const existingGallery = document.getElementById('image-gallery');
    if (existingGallery) existingGallery.remove();

    // Store in history
    generatedImages.unshift({
        id: Date.now(),
        image: imageData.image,
        prompt: originalPrompt,
        timestamp: new Date().toLocaleString()
    });

    // Create gallery overlay
    const gallery = document.createElement('div');
    gallery.id = 'image-gallery';
    gallery.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    gallery.innerHTML = `
        <div style="
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            background: rgba(20, 25, 40, 0.95);
            border-radius: 15px;
            border: 2px solid rgba(0, 255, 204, 0.4);
            box-shadow: 0 0 60px rgba(0, 255, 204, 0.3);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        ">
            <!-- Header -->
            <div style="
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.6);
                border-bottom: 1px solid rgba(0, 255, 204, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            ">
                <div>
                    <h3 style="color: #00ffcc; margin: 0; font-size: 18px; font-weight: 600;">
                        🎨 AI Generated Design
                    </h3>
                    <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 3px;">
                        ${new Date().toLocaleTimeString()}
                    </div>
                </div>
                <button id="close-gallery" style="
                    background: rgba(255, 50, 50, 0.2);
                    border: 1px solid rgba(255, 50, 50, 0.4);
                    color: #ff3232;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                ">
                    ✕ Close
                </button>
            </div>
            
            <!-- Image Display -->
            <div style="
                flex: 1;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.4);
                position: relative;
                overflow: auto;
                min-height: 0;
            ">
                <img src="data:image/png;base64,${imageData.image}" 
                     alt="Generated design"
                     style="
                        max-width: 100%;
                        max-height: 100%;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        border-radius: 10px;
                        display: block;
                     ">
            </div>
            
            <!-- Info Panel -->
            <div style="
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.6);
                border-top: 1px solid rgba(0, 255, 204, 0.2);
                flex-shrink: 0;
            ">
                <div style="margin-bottom: 10px;">
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 5px; font-weight: 500;">
                        Your Prompt:
                    </div>
                    <div style="color: white; font-size: 14px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px; border-left: 3px solid #00ffcc;">
                        "${originalPrompt}"
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="save-image" style="
                        flex: 1;
                        background: linear-gradient(135deg, #00ffcc, #00b8ff);
                        border: none;
                        color: #000;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    ">
                        💾 Save Image
                    </button>
                    <button id="copy-prompt" style="
                        flex: 1;
                        background: rgba(255, 0, 153, 0.2);
                        border: 1px solid rgba(255, 0, 153, 0.4);
                        color: #ff0099;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    ">
                        📋 Copy Prompt
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(gallery);

    // Fade in
    setTimeout(() => gallery.style.opacity = '1', 10);

    // Attach events
    attachGalleryEvents(gallery, imageData, originalPrompt);
}

function attachGalleryEvents(gallery, imageData, originalPrompt) {
    // Close button
    gallery.querySelector('#close-gallery').addEventListener('click', () => {
        playSound('close');
        closeGallery(gallery);
    });

    // Save image
    gallery.querySelector('#save-image').addEventListener('click', () => {
        playSound('click');
        saveImageToDisk(imageData.image);
    });

    // Copy prompt
    gallery.querySelector('#copy-prompt').addEventListener('click', () => {
        playSound('click');
        navigator.clipboard.writeText(originalPrompt)
            .then(() => showStatus('📋 Prompt copied to clipboard!', 'success'))
            .catch(() => showStatus('❌ Failed to copy prompt', 'error'));
    });

    // Click outside to close
    gallery.addEventListener('click', (e) => {
        if (e.target === gallery) {
            playSound('close');
            closeGallery(gallery);
        }
    });

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            playSound('close');
            closeGallery(gallery);
        }
    };
    document.addEventListener('keydown', escHandler);
    gallery.dataset.escHandler = escHandler;
}

function closeGallery(gallery) {
    gallery.style.opacity = '0';
    setTimeout(() => {
        const handler = gallery.dataset.escHandler;
        if (handler) document.removeEventListener('keydown', handler);
        gallery.remove();
    }, 300);
}

function saveImageToDisk(base64Data) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `vibe-sync-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showStatus('✅ Image saved to downloads!', 'success');
}

// ========== MAIN GENERATION FUNCTION ==========
generateBtn.addEventListener('click', async () => {
    const userPrompt = promptInput.value.trim();

    if (!userPrompt) {
        showStatus('⚠️ Please describe your dream space first', 'error');
        playSound('click');
        return;
    }

    // Play sound
    playSound('generate');

    // Update UI
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating<span class="loading-spinner"></span>';
    showStatus('🔮 Processing your vision...', 'info');

    // Particle animation
    gsap.to(particles.scale, {
        x: 2.5, y: 2.5, z: 2.5, duration: 1, ease: "power2.out"
    });

    gsap.to(particles.rotation, {
        y: particles.rotation.y + Math.PI * 6, duration: 3, ease: "power2.inOut"
    });

    try {
        // Call backend
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userPrompt })
        });

        const data = await response.json();

        if (data.success) {
            playSound('success');
            showStatus(`✨ Generated: "${userPrompt.substring(0, 30)}..."`, 'success');
            showImageGallery(data, userPrompt);
        } else {
            playSound('click');
            showStatus(`❌ ${data.error || 'Generation failed'}`, 'error');
        }

    } catch (error) {
        console.error('API Error:', error);
        playSound('click');
        showStatus('❌ Connection failed - Check backend', 'error');
    }

    // Reset animations
    gsap.to(particles.scale, {
        x: 0.7, y: 0.7, z: 0.7, duration: 0.5, ease: "back.in(2)"
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    gsap.to(particles.scale, {
        x: 1, y: 1, z: 1, duration: 0.8, ease: "elastic.out(1, 0.5)"
    });

    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate ✨';
});

// Enter key support
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !generateBtn.disabled) {
        playSound('click');
        generateBtn.click();
    }
});

// Sound toggle event
document.getElementById('sound-toggle').addEventListener('click', () => {
    toggleSound();
});

// ========== WINDOW RESIZE ==========
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== MOUSE INTERACTION ==========
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    gsap.to(camera.position, {
        x: mouseX * 5, y: mouseY * 5, duration: 2, ease: "power2.out"
    });
});

// ========== INITIALIZE ==========
// Initialize sounds
initSounds();

console.log('✅ Vibe-Sync v2.0 fully loaded! 🔥');