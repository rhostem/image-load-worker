import __SNOWPACK_ENV__ from '../../__snowpack__/env.js';
import.meta.env = __SNOWPACK_ENV__;

import {useState, useEffect, useCallback, useMemo} from "../../web_modules/react.js";
export default function useImageLoadWorker({
  images,
  incrementalUpdate
}) {
  const [imageBlobs, setImageBlobs] = useState([]);
  const maxWorkers = navigator.hardwareConcurrency || 2;
  const chunkSizeForWorker = useMemo(() => Math.ceil(images.length / maxWorkers), [images.length, maxWorkers]);
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    if (workers.length === 0) {
      setWorkers(new Array(maxWorkers).fill(void 0).map(() => new Worker(new URL("./ImageLoadWorker.js", import.meta.url))));
    }
    return () => {
      workers.forEach((worker) => worker.terminate());
    };
  }, [maxWorkers, workers]);
  const loadAllImagesAtOnce = useCallback(async (imageUrls) => {
    if (window.Worker) {
      setImageBlobs(new Array(imageUrls.length).fill(void 0));
      const imageChunks = [];
      for (let i = 0; i < maxWorkers; i++) {
        const startIndex = i * chunkSizeForWorker;
        imageChunks.push(imageUrls.slice(startIndex, startIndex + chunkSizeForWorker));
      }
      const imagePromises = imageChunks.map((chunk, chunkIndex) => new Promise((resolve) => {
        const chunkWorker = workers[chunkIndex];
        if (chunkWorker) {
          chunkWorker.postMessage(chunk);
          chunkWorker.onmessage = (e) => {
            resolve(e.data);
          };
        }
      }));
      const imageBlobsChunks = await Promise.all(imagePromises);
      const allImageBlobs = imageBlobsChunks.reduce((result, chunk) => [...result, ...chunk], []);
      setImageBlobs(allImageBlobs);
    }
  }, [chunkSizeForWorker, maxWorkers, workers]);
  const loadImagesIncrementally = useCallback(async (imageUrls) => {
    if (window.Worker && workers.length) {
      const imageBlobs2 = new Array(imageUrls.length).fill(void 0);
      setImageBlobs(imageBlobs2);
      const imageChunks = [];
      for (let i = 0; i < maxWorkers; i++) {
        const startIndex = i * chunkSizeForWorker;
        imageChunks.push(imageUrls.slice(startIndex, startIndex + chunkSizeForWorker));
      }
      const imagePromises = imageChunks.map((chunk, chunkIndex) => new Promise((resolve) => {
        const chunkWorker = workers[chunkIndex];
        if (chunkWorker) {
          chunkWorker.postMessage(chunk);
          chunkWorker.onmessage = (e) => {
            resolve({
              imageUrls: e.data,
              chunkIndex
            });
          };
        }
      }));
      imagePromises.forEach(async (imagePromise) => {
        try {
          const {imageUrls: imageUrls2, chunkIndex} = await imagePromise;
          imageUrls2.forEach((url, index) => {
            imageBlobs2[chunkIndex * chunkSizeForWorker + index] = url;
          });
          setImageBlobs(imageBlobs2.slice());
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, [chunkSizeForWorker, maxWorkers, workers]);
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
  return {
    imageBlobs,
    maxWorkers
  };
}
