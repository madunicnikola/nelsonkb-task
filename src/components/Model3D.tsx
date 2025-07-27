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
}

export default function Model3D({ 
  modelData, 
  onPositionChange, 
  onRotationChange, 
  isSelected, 
  onSelect,
  onDragStart,
  onDragEnd,
  isDragging: parentIsDragging
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

  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const rotationAmount = Math.PI / 8;
      
      switch (event.key) {
        case 'q':
        case 'Q':
          onRotationChange(modelData.id, [modelData.rotation[0] + rotationAmount, modelData.rotation[1], modelData.rotation[2]]);
          break;
        case 'w':
        case 'W':
          onRotationChange(modelData.id, [modelData.rotation[0], modelData.rotation[1] + rotationAmount, modelData.rotation[2]]);
          break;
        case 'e':
        case 'E':
          onRotationChange(modelData.id, [modelData.rotation[0], modelData.rotation[1], modelData.rotation[2] + rotationAmount]);
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
      const deltaY = (pointer.y - initialMousePos.y) * movementScale;
      
      const newPosition = new Vector3(
        initialObjectPos.x + deltaX,
        initialObjectPos.y + deltaY,
        initialObjectPos.z 
      );
      
      meshRef.current.position.copy(newPosition);
      
      onPositionChange(modelData.id, [newPosition.x, newPosition.y, newPosition.z], true);
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

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation: [number, number, number] = [...modelData.rotation];
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newRotation[axisIndex] = value;
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
            position={[2, 0, 0]} 
            userData={{ isRotationControl: true }}
            onClick={(e) => {
              e.stopPropagation();
              handleRotationChange('x', modelData.rotation[0] + Math.PI / 4);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="red" />
          </mesh>
          
          <mesh 
            position={[0, 0, 2]} 
            userData={{ isRotationControl: true }}
            onClick={(e) => {
              e.stopPropagation();
              handleRotationChange('y', modelData.rotation[1] + Math.PI / 4);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="green" />
          </mesh>
          
          <mesh 
            position={[0, 2, 0]} 
            userData={{ isRotationControl: true }}
            onClick={(e) => {
              e.stopPropagation();
              handleRotationChange('z', modelData.rotation[2] + Math.PI / 4);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </group>
      )}
    </group>
  );
}