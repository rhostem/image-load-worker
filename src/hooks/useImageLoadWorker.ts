import { useState, useEffect, useCallback, useMemo } from 'react';

export default function useImageLoadWorker({ images }: { images: string[] }) {
  const [imageBlobs, setImageBlobs] = useState<string[]>([]);
  const maxWorkers = navigator.hardwareConcurrency || 2;

  const chunkSizeForWorker = useMemo(
    () => Math.ceil(images.length / maxWorkers),
    [images.length, maxWorkers],
  );

  const loadImagesByWorker = useCallback(
    async (imageUrls) => {
      if (window.Worker) {
        setImageBlobs(new Array(imageUrls.length).fill(undefined));

        const imageChunks = [];

        for (let i = 0; i < maxWorkers; i++) {
          const startIndex = i * chunkSizeForWorker;
          imageChunks.push(
            imageUrls.slice(startIndex, startIndex + chunkSizeForWorker),
          );
        }

        const imagePromises = imageChunks.map(
          (chunk) =>
            new Promise<string[]>((resolve) => {
              const chunkWorker = new Worker(
                new URL('./ImageLoadWorker.js', import.meta.url),
              );

              chunkWorker.postMessage(chunk);

              chunkWorker.onmessage = (e) => {
                resolve(e.data);
              };
            }),
        );

        const imageBlobsChunks = await Promise.all(imagePromises);

        const allImageBlobs = imageBlobsChunks.reduce(
          (result, chunk) => [...result, ...chunk],
          [],
        );

        setImageBlobs(allImageBlobs);
      }
    },
    [chunkSizeForWorker, maxWorkers],
  );

  useEffect(() => {
    loadImagesByWorker(images);
  }, [images, loadImagesByWorker]);

  return {
    imageBlobs,
  };
}
