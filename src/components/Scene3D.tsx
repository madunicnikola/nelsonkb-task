'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { ModelData, CameraData, loadSceneData, saveSceneData, updateModelData } from '@/lib/firestore';
import Model3D from './Model3D';
import LoadingScreen from './LoadingScreen';

interface Scene3DProps {
  viewMode: '3D' | '2D';
  resetTrigger?: number;
  currentScene?: 'kitchen1' | 'kitchen2';
}

function SceneContent({ viewMode, onCameraDataLoaded, onDataLoaded, resetTrigger }: { 
  viewMode: '3D' | '2D', 
  onCameraDataLoaded?: (cameraData: CameraData) => void, 
  onDataLoaded?: () => void,
  resetTrigger?: number
}) {
  const { camera } = useThree();
  const [models, setModels] = useState<ModelData[]>([]);
  const [cameraData, setCameraData] = useState<CameraData>({
    position: [5, 5, 5],
    target: [0, 0, 0]
  });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadScene = async () => {
      try {
        const sceneData = await loadSceneData();
        setModels(sceneData.models);
        setCameraData(sceneData.camera);
        onCameraDataLoaded?.(sceneData.camera);
        setDataLoaded(true);
        onDataLoaded?.();
        
        if (sceneData.models.length === 2 && 
            sceneData.models[0].position[0] === -4 && sceneData.models[1].position[0] === 4) {
          await saveSceneData(sceneData.models, sceneData.camera);
        }
      } catch (error) {
        console.error('Failed to load scene:', error);
        setDataLoaded(true);
        onDataLoaded?.();
      }
    };
    
    loadScene();
  }, []);

  const resetScene = async () => {
    const defaultModels: ModelData[] = [
      {
        id: 'kitchen1',
        position: [-4, 0.5, 0],
        rotation: [0, Math.PI / -1.9, 0],
        scale: [1, 1, 1]
      },
      {
        id: 'kitchen2',
        position: [4, 1.5, 4],
        rotation: [0, -1.7, 0],
        scale: [1, 1, 1]
      }
    ];

    const defaultCamera: CameraData = {
      position: [0, 1, 8],
      target: [0, 0, 0]
    };

    setModels(defaultModels);
    setCameraData(defaultCamera);
    onCameraDataLoaded?.(defaultCamera);
  };

  const calculateCameraPosition = (models: ModelData[]): CameraData => {
    if (models.length === 0) {
      return {
        position: [5, 5, 5],
        target: [0, 0, 0]
      };
    }

    const centerX = models.reduce((sum, model) => sum + model.position[0], 0) / models.length;
    const centerZ = models.reduce((sum, model) => sum + model.position[2], 0) / models.length;
    
    const maxDistance = Math.max(...models.map(model => 
      Math.sqrt((model.position[0] - centerX) ** 2 + (model.position[2] - centerZ) ** 2)
    ));
    
    const cameraDistance = Math.max(8, maxDistance * 2);
    const cameraHeight = 3;
    
    return {
      position: [centerX, cameraHeight, centerZ + cameraDistance],
      target: [centerX, 0, centerZ]
    };
  };

  useEffect(() => {
    if (models.length > 0) {
      const newCameraData = calculateCameraPosition(models);
      setCameraData(newCameraData);
      
      if (viewMode === '2D') {
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(...newCameraData.position);
        camera.lookAt(...newCameraData.target);
      }
    }
  }, [models, viewMode, camera]);

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      resetScene();
    }
  }, [resetTrigger]);

  const debouncedSave = useCallback(async (updatedModels: ModelData[], newCameraData: CameraData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveSceneData(updatedModels, newCameraData);
      } catch (error) {
        console.error('Failed to save scene data:', error);
      }
    }, 1000);
  }, []);

  const handlePositionChange = async (id: string, position: [number, number, number], isDragging: boolean = false) => {
    const updatedModels = models.map(model =>
      model.id === id ? { ...model, position } : model
    );
    setModels(updatedModels);
    
    const newCameraData = calculateCameraPosition(updatedModels);
    setCameraData(newCameraData);
    
    if (!isDragging) {
      try {
        await updateModelData(id, position, models.find(m => m.id === id)?.rotation || [0, 0, 0]);
        await saveSceneData(updatedModels, newCameraData);
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    } else {
      debouncedSave(updatedModels, newCameraData);
    }
  };

  const handleRotationChange = async (id: string, rotation: [number, number, number]) => {
    const updatedModels = models.map(model =>
      model.id === id ? { ...model, rotation } : model
    );
    setModels(updatedModels);
    
    try {
      await updateModelData(id, models.find(m => m.id === id)?.position || [0, 0, 0], rotation);
    } catch (error) {
      console.error('Failed to save rotation:', error);
    }
  };

  const handleModelSelect = (id: string) => {
    setSelectedModel(id === '' ? null : id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      await saveSceneData(models, cameraData);
    } catch (error) {
      console.error('Failed to save on drag end:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!dataLoaded) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} />
      <pointLight position={[-10, -10, -5]} intensity={1.5} />
      <pointLight position={[0, 10, 0]} intensity={1.2} />
      <spotLight position={[5, 10, 5]} intensity={1.5} angle={0.3} penumbra={0.3} />
      <pointLight position={[10, 5, 10]} intensity={1.0} />
      <pointLight position={[-10, 5, -10]} intensity={1.0} />
      
      {models
        .map((model) => (
          <Model3D
            key={model.id}
            modelData={model}
            onPositionChange={handlePositionChange}
            onRotationChange={handleRotationChange}
            isSelected={selectedModel === model.id}
            onSelect={handleModelSelect}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isDragging={isDragging}
            allModels={models}
          />
        ))}
    </>
  );
}

function SceneWithData({ viewMode, resetTrigger }: Omit<Scene3DProps, 'currentScene'> & { currentScene?: string }) {
  const [sceneData, setSceneData] = useState<{ models: ModelData[], camera: CameraData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadSceneData();
        setSceneData(data);
        
        if (data.models.length === 2 && 
            data.models[0].position[0] === -4 && data.models[1].position[0] === 4) {
          await saveSceneData(data.models, data.camera);
        }
      } catch (error) {
        console.error('Failed to load scene:', error);
        const defaultData = {
          models: [
            { id: 'kitchen1', position: [-4, 0, 0] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
            { id: 'kitchen2', position: [4, 0, 0] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] }
          ],
          camera: { position: [0, 1, 8] as [number, number, number], target: [0, 0, 0] as [number, number, number] }
        };
        setSceneData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (!isMounted) {
    return <LoadingScreen message="Initializing..." onComplete={() => setIsLoading(false)} />;
  }

  if (isLoading || !sceneData) {
    return <LoadingScreen message="Loading scene data..." onComplete={() => setIsLoading(false)} minLoadingTime={800} />;
  }

  return (
    <div className="w-full h-full">
      <Canvas>
        {viewMode === '2D' ? (
          <OrthographicCamera
            makeDefault
            position={[0, 20, 0]}
            zoom={30}
            near={0.1}
            far={1000}
          />
        ) : (
          <PerspectiveCamera
            makeDefault
            position={sceneData.camera.position}
            fov={75}
          />
        )}
        <SceneContent 
          viewMode={viewMode} 
          onCameraDataLoaded={() => {}} 
          onDataLoaded={() => {}}
          resetTrigger={resetTrigger}
        />
        {viewMode === '2D' && (
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={false}
            enableDamping={true} 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        )}
        {viewMode === '3D' && (
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            enableRotate={false} 
            enableDamping={true} 
            dampingFactor={0.05}
          />
        )}
      </Canvas>
    </div>
  );
}

export default function Scene3D({ viewMode, resetTrigger }: Scene3DProps) {
  return <SceneWithData viewMode={viewMode} resetTrigger={resetTrigger} currentScene={'kitchen1'} />;
} 