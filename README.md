# 3D Model Viewer/Manager

A Next.js application for managing 3D models with Firebase integration, featuring drag-and-drop functionality, rotation controls, and real-time database synchronization.

## Features

- **3D Model Loading**: Loads two GLB models (Kitchen.glb and Kitchen2.glb)
- **Dual View Modes**: 
  - 3D perspective view with orbit controls
  - 2D top-down view for precise positioning
- **Interactive Manipulation**:
  - Drag and drop models within the scene
  - Rotation controls with colored axis indicators
  - Real-time position and rotation updates
- **Database Integration**: 
  - Automatic saving to Firebase Firestore
  - Persistent model positions and rotations
  - No authentication required - open to all users

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, @react-three/drei
- **Database**: Firebase Firestore
- **Styling**: Tailwindcss v4, Shadcn, Lucide React

## Setup Instructions

```bash
npm install
```

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### View Modes
- **3D View**: Standard perspective view with orbit controls for camera manipulation
- **2D Top-Down**: Orthographic view from above for precise positioning

### Model Interaction
- **Moving Models**: Click and drag models to move them around the scene
- **Rotating Models**: 
  - Click the red sphere to rotate around X-axis
  - Click the green sphere to rotate around Y-axis  
  - Click the blue sphere to rotate around Z-axis
- **Selection**: Click on a model to select it and show rotation controls

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── Model3D.tsx          # Individual 3D model component
│   └── Scene3D.tsx          # Main 3D scene component
└── lib/
    ├── firebase.ts          # Firebase configuration
    └── firestore.ts         # Firestore data operations
public/
└── assets/
    └── models/
        ├── Kitchen.glb       # First 3D model
        └── Kitchen2.glb      # Second 3D model
```