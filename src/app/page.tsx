'use client';

import { useState } from 'react';
import Scene3D from '@/components/Scene3D';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function Home() {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [openDialog, setOpenDialog] = useState<'move' | 'rotate' | 'save' | null>(null);
  const [currentScene, setCurrentScene] = useState<'kitchen1' | 'kitchen2'>('kitchen1');

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <header className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link href="/" className='cursor-pointer'>
            <Image src="/images/logo/logo.webp" alt="Logo" width={100} height={100} />
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg bg-[#1a1a1a] p-1">
              <Button
                onClick={() => setViewMode('3D')}
                variant={viewMode === '3D' ? 'outline' : 'ghost'}
                className='cursor-pointer'
              >
                3D View
              </Button>
              <Button
                onClick={() => setViewMode('2D')}
                variant={viewMode === '2D' ? 'outline' : 'ghost'}
                className='cursor-pointer'
              >
                2D Top-Down
              </Button>
            </div>
            
            <Button
              onClick={() => setResetTrigger(prev => prev + 1)}
              variant={"destructive"}
              className='cursor-pointer'
            >
              Reset Scene
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative min-h-0">
        <div className="h-full w-full relative">
          <Scene3D viewMode={viewMode} resetTrigger={resetTrigger} currentScene={currentScene} />
          
          <button
            onClick={() => setCurrentScene(currentScene === 'kitchen1' ? 'kitchen2' : 'kitchen1')}
            className={`absolute top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 ${
              currentScene === 'kitchen1' ? 'right-4' : 'left-4'
            }`}
            title={`Switch to ${currentScene === 'kitchen1' ? 'Kitchen 2' : 'Kitchen 1'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d={currentScene === 'kitchen1' 
                  ? "M9 18L15 12L9 6" 
                  : "M15 18L9 12L15 6"
                } 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>

      <footer className="flex-shrink-0 p-4 bg-[#0a0a0a]">
        <div className="w-full">
          <div className="flex justify-between items-center text-sm px-8">
            <Dialog open={openDialog === 'move'} onOpenChange={(open) => setOpenDialog(open ? 'move' : null)}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 cursor-pointer" variant={"ghost"}>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Click and drag models to move them</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
                <DialogHeader>
                  <DialogTitle className="text-blue-400">Moving Models</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Learn how to move 3D models in the scene
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p><strong>Step 1:</strong> Click on any 3D model in the scene to select it</p>
                  <p><strong>Step 2:</strong> Hold down the left mouse button on the selected model</p>
                  <p><strong>Step 3:</strong> Drag the mouse to move the model to a new position</p>
                  <p><strong>Step 4:</strong> Release the mouse button to place the model</p>
                  <p className="text-blue-300 mt-4"><em>Tip: You can move models in both 3D and 2D view modes</em></p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openDialog === 'rotate'} onOpenChange={(open) => setOpenDialog(open ? 'rotate' : null)}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 cursor-pointer" variant={"ghost"}>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Press Q/W/E keys to rotate selected model</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
                <DialogHeader>
                  <DialogTitle className="text-green-400">Rotating Models</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Learn how to rotate 3D models using keyboard shortcuts
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p><strong>Step 1:</strong> Click on any 3D model to select it</p>
                  <p><strong>Step 2:</strong> Use the following keys to rotate the model:</p>
                  <ul className="ml-4 space-y-1">
                    <li><strong>Q:</strong> Rotate around the X-axis (forward/backward tilt)</li>
                    <li><strong>W:</strong> Rotate around the Y-axis (left/right turn)</li>
                    <li><strong>E:</strong> Rotate around the Z-axis (roll)</li>
                  </ul>
                  <p className="text-green-300 mt-4"><em>Tip: Each key press rotates the model by 15 degrees</em></p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openDialog === 'save'} onOpenChange={(open) => setOpenDialog(open ? 'save' : null)}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 cursor-pointer" variant={"ghost"}>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Changes are automatically saved to database</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Auto-Save Feature</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Understanding how your changes are automatically saved
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p><strong>Automatic Saving:</strong> All changes you make to the scene are automatically saved to the database in real-time.</p>
                  <p><strong>What gets saved:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>Model positions and rotations</li>
                    <li>Scene layout and configuration</li>
                    <li>View mode preferences</li>
                  </ul>
                  <p><strong>No manual saving required:</strong> You don't need to press any save button - everything is preserved automatically.</p>
                  <p className="text-yellow-300 mt-4"><em>Tip: Your work is always safe and will be restored when you return</em></p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </footer>
    </div>
  );
}
