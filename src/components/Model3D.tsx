'use client';

import { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ModelData } from '@/lib/firestore';

interface Model3DProps {
  modelData: ModelData;
  onPositionChange: (id: string, position: [number, number, number], isDragging?: boolean) => void;
  onRotationChange: (id: string, rotation: [number, number, number]) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  allModels: ModelData[];
}

export default function Model3D({ 
  modelData, 
  onPositionChange, 
  onRotationChange, 
  isSelected, 
  onSelect,
  onDragStart,
  onDragEnd,
  isDragging: parentIsDragging,
  allModels
}: Model3DProps) {
  const meshRef = useRef<any>(null);
  const { gl, pointer } = useThree();
  
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialObjectPos, setInitialObjectPos] = useState<Vector3>(new Vector3());
  
  const modelPath = modelData.id === 'kitchen1' 
    ? '/assets/models/Kitchen.glb' 
    : '/assets/models/Kitchen2.glb';
  
  const { scene } = useGLTF(modelPath);
  
  const clonedScene = scene.clone();

  const checkCollision = (newPos: Vector3, currentModelId: string): boolean => {
    const modelRadius = 2;
    
    for (const otherModel of allModels) {
      if (otherModel.id === currentModelId) continue;
      
      const otherPos = new Vector3(...otherModel.position);
      const distance = newPos.distanceTo(otherPos);
      
      if (distance < modelRadius * 2) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const rotationAmount = Math.PI / 8;
      
      switch (event.key) {
        case 'w':
        case 'W':
          onRotationChange(modelData.id, [modelData.rotation[0], modelData.rotation[1] + rotationAmount, modelData.rotation[2]]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, modelData.rotation, onRotationChange, modelData.id]);

  useFrame(() => {
    if (isDragging && meshRef.current) {
      const movementScale = 5;
      
      const deltaX = (pointer.x - initialMousePos.x) * movementScale;
      const deltaZ = -(pointer.y - initialMousePos.y) * movementScale;
      
      const newPosition = new Vector3(
        initialObjectPos.x + deltaX,
        initialObjectPos.y,
        initialObjectPos.z + deltaZ
      );
      
      if (!checkCollision(newPosition, modelData.id)) {
        meshRef.current.position.copy(newPosition);
        onPositionChange(modelData.id, [newPosition.x, newPosition.y, newPosition.z], true);
      }
    }
  });

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    
    if (event.object && event.object.userData.isRotationControl) {
      return;
    }
    
    onSelect(modelData.id);
    
    setInitialMousePos({ x: pointer.x, y: pointer.y });
    setInitialObjectPos(new Vector3(...modelData.position));
    setIsDragging(true);
    onDragStart?.();
    
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = (event: any) => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
      gl.domElement.style.cursor = 'auto';
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
        gl.domElement.style.cursor = 'auto';
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [isDragging, gl.domElement, onDragEnd]);

  const handleRotationChange = (axis: 'y', value: number) => {
    const newRotation: [number, number, number] = [...modelData.rotation];
    newRotation[1] = value;
    onRotationChange(modelData.id, newRotation);
  };

  return (
    <group
      ref={meshRef}
      position={modelData.position}
      rotation={modelData.rotation}
      scale={modelData.scale}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => !isDragging && (gl.domElement.style.cursor = 'grab')}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      <primitive object={clonedScene} />
      
      {isSelected && (
        <group>
          <mesh 
            position={[0, 2, 0]} 
            userData={{ isRotationControl: true }}
            onClick={(e) => {
              e.stopPropagation();
              handleRotationChange('y', modelData.rotation[1] + Math.PI / 4);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      )}
    </group>
  );
}