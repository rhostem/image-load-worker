import { useState, useEffect, useCallback, useMemo } from 'react';

export default function useImageLoadWorker({
  images,
  incrementalUpdate,
}: {
  images: string[];
  incrementalUpdate: boolean;
}) {
  const [imageBlobs, setImageBlobs] = useState<string[]>([]);
  const maxWorkers = navigator.hardwareConcurrency || 2;

  const chunkSizeForWorker = useMemo(
    () => Math.ceil(images.length / maxWorkers),
    [images.length, maxWorkers],
  );

  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    if (workers.length === 0) {
      setWorkers(
        new Array(maxWorkers)
          .fill(undefined)
          .map(
            () => new Worker(new URL('./ImageLoadWorker.js', import.meta.url)),
          ),
      );
    }

    return () => {
      workers.forEach((worker) => worker.terminate());
    };
  }, [maxWorkers, workers]);

  /**
   * 모든 워커의 작업이 끝난 후 이미지를 업데이트한다
   */
  const loadAllImagesAtOnce = useCallback(
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
          (chunk, chunkIndex) =>
            new Promise<string[]>((resolve) => {
              const chunkWorker = workers[chunkIndex];

              if (chunkWorker) {
                chunkWorker.postMessage(chunk);

                chunkWorker.onmessage = (e) => {
                  resolve(e.data);
                };
              }
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
    [chunkSizeForWorker, maxWorkers, workers],
  );

  /**
   * 워커에서 작업이 끝나는 대로 이미지를 업데이트한다
   */
  const loadImagesIncrementally = useCallback(
    async (imageUrls) => {
      if (window.Worker && workers.length) {
        const imageBlobs = new Array(imageUrls.length).fill(undefined);
        setImageBlobs(imageBlobs);

        const imageChunks = [];

        for (let i = 0; i < maxWorkers; i++) {
          const startIndex = i * chunkSizeForWorker;
          imageChunks.push(
            imageUrls.slice(startIndex, startIndex + chunkSizeForWorker),
          );
        }

        const imagePromises = imageChunks.map(
          (chunk, chunkIndex) =>
            new Promise<{
              imageUrls: string[];
              chunkIndex: number;
            }>((resolve) => {
              const chunkWorker = workers[chunkIndex];

              if (chunkWorker) {
                chunkWorker.postMessage(chunk);

                chunkWorker.onmessage = (e) => {
                  resolve({
                    imageUrls: e.data,
                    chunkIndex: chunkIndex,
                  });
                };
              }
            }),
        );

        imagePromises.forEach(async (imagePromise) => {
          try {
            const { imageUrls, chunkIndex } = await imagePromise;

            imageUrls.forEach((url, index) => {
              imageBlobs[chunkIndex * chunkSizeForWorker + index] = url;
            });

            setImageBlobs(imageBlobs.slice());
          } catch (e) {
            console.error(e);
          }
        });
      }
    },
    [chunkSizeForWorker, maxWorkers, workers],
  );

  useEffect(() => {
    if (incrementalUpdate) {
      loadImagesIncrementally(images);
    } else {
      loadAllImagesAtOnce(images);
    }
  }, [images, incrementalUpdate, loadAllImagesAtOnce, loadImagesIncrementally]);

  useEffect(() => {
    return () => {
      if (workers.length > 0) {
        workers.forEach((worker) => {
          worker.terminate();
        });
      }
    };
  }, [workers]);

  useEffect(() => () => {
    if (imageBlobs.length > 0) {
      imageBlobs.forEach((blob) => {
        if (blob) {
          // releases an existing object URL before setting new blobs
          URL.revokeObjectURL(blob);
        }
      });
    }
  });

  return {
    imageBlobs,
    maxWorkers,
  };
}
