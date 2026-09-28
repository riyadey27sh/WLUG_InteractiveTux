import React, { createContext, useContext, useState, useEffect } from 'react';
import { BootScreen } from './BootScreen';

const PreloadContext = createContext({ images: [], isLoaded: false, progress: 0 });
export const usePreload = () => useContext(PreloadContext);

export function BootProvider({ children }) {
  const [booted, setBooted] = useState(false);
  const [images, setImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];
    const TOTAL_FRAMES = 240;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(3, '0');
      img.src = `/sequence/ezgif-frame-${frameNumber}.jpg`;
      
      const onImageLoaded = () => {
        loadedCount++;
        setProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        loadedImages.push(img);
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      
      img.onload = onImageLoaded;
      img.onerror = onImageLoaded;
    }
  }, []);

  return (
    <PreloadContext.Provider value={{ images, isLoaded, progress }}>
      {!booted && (
        <BootScreen
          isAssetLoaded={isLoaded}
          assetProgress={progress}
          onComplete={() => setBooted(true)}
        />
      )}
      {children}
    </PreloadContext.Provider>
  );
}
