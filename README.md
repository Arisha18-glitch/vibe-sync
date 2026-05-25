# Vibe-Sync — AI-Powered Particle Visualization

A generative AI system that transforms text descriptions into animated, depth-aware 3D particle visualizations rendered in real time in the browser.

## Demo

https://github.com/user-attachments/assets/dad44b69-b757-4822-9461-a8d738a64204

## Features

- Text-to-image generation via Stable Diffusion XL
- Depth estimation using ZoeDepth vision transformer
- Particle animations driven by AI-generated depth maps
- Custom GLSL shaders for glow and depth effects
- Real-time 3D rendering via Three.js

## Tech Stack

- **3D Rendering:** Three.js, WebGL
- **AI Image Generation:** Stable Diffusion XL (via cloud API)
- **Depth Estimation:** ZoeDepth
- **Shaders:** Custom GLSL
- **Frontend:** HTML, CSS, JavaScript

## How It Works

1. User enters a text description
2. Stable Diffusion XL generates an image from the prompt
3. ZoeDepth estimates a depth map from the generated image
4. Depth values drive particle positions in 3D space
5. Custom Three.js shaders apply glow and lighting effects
6. Result renders as an interactive animated particle scene in the browser
