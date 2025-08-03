import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface ModelData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface CameraData {
  position: [number, number, number];
  target: [number, number, number];
}

export interface SceneData {
  models: ModelData[];
  camera: CameraData;
  lastUpdated: number;
}

const SCENE_DOC_ID = 'scene_data';

export const saveSceneData = async (models: ModelData[], camera?: CameraData) => {
  try {
    console.log('Attempting to save scene data:', models);
    const sceneData: SceneData = {
      models,
      camera: camera || {
        position: [5, 5, 5],
        target: [0, 0, 0]
      },
      lastUpdated: Date.now()
    };
    
    await setDoc(doc(db, 'scenes', SCENE_DOC_ID), sceneData);
    console.log('Scene data saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving scene data:', error);
    throw error;
  }
};

export const loadSceneData = async (): Promise<{ models: ModelData[], camera: CameraData }> => {
  try {
    console.log('Attempting to load scene data from Firestore...');
    const docRef = doc(db, 'scenes', SCENE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SceneData;
      console.log('Found existing scene data:', data);
      return {
        models: data.models || [],
        camera: data.camera || {
          position: [5, 5, 5],
          target: [0, 0, 0]
        }
      };
    } else {
      console.log('No existing data found, using default positions');
      return {
        models: [
          {
            id: 'kitchen1',
            position: [-4, 0, 0],
            rotation: [0, Math.PI, 0],
            scale: [1, 1, 1]
          },
          {
            id: 'kitchen2',
            position: [4, 0, 0],
            rotation: [0, Math.PI, 0],
            scale: [1, 1, 1]
          }
        ],
        camera: {
          position: [5, 5, 5],
          target: [0, 0, 0]
        }
      };
    }
  } catch (error) {
    console.error('Error loading scene data:', error);
    return {
      models: [],
      camera: {
        position: [5, 5, 5],
        target: [0, 0, 0]
      }
    };
  }
};

export const updateModelData = async (modelId: string, position: [number, number, number], rotation: [number, number, number]) => {
  try {
    const docRef = doc(db, 'scenes', SCENE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SceneData;
      const updatedModels = data.models.map(model => 
        model.id === modelId 
          ? { ...model, position, rotation }
          : model
      );
      
      await updateDoc(docRef, {
        models: updatedModels,
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error updating model data:', error);
  }
}; 