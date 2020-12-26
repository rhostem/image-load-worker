import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  padding: 1rem;
`;

export const ImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
`;

const BlobImageWrap = styled.div`
  width: 45px;
  height: 80px;
  outline: 1px solid #00d694;
  background-size: cover;
  background-color: #eee;

  &.isLoading {
    background-color: blue;
  }

  &.isError {
    background-color: red;
  }
`;

export default function RandomImages(): JSX.Element {
  const [imageTotalCount, setImageTotalCount] = useState(80);

  const [imageBlobs, setImageBlobs] = useState<string[]>([]);

  const images = useMemo(
    () =>
      new Array(imageTotalCount)
        .fill(undefined)
        .map(
          () =>
            `https://picsum.photos/seed/${Math.floor(
              Math.random() * 10000,
            )}/1080/1920`,
        ),
    [imageTotalCount],
  );

  const handleClickReloadImages = useCallback(() => {
    const lastCount = imageTotalCount;
    setImageTotalCount(0);
    setTimeout(() => {
      setImageTotalCount(lastCount);
    }, 400);
  }, [imageTotalCount]);

  const worker = useRef<Worker>();

  const loadImagesByWorker = useCallback(async (imageUrls) => {
    if (!worker.current) {
      setImageBlobs(new Array(imageUrls.length).fill(undefined));

      const maxWorkers = navigator.hardwareConcurrency || 4;
      const chunkSizeForWorker = Math.ceil(imageUrls.length / maxWorkers);

      console.log(`chunkSizeForWorker`, chunkSizeForWorker);

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
  }, []);

  useEffect(() => {
    loadImagesByWorker(images);
  }, [images, loadImagesByWorker]);

  return (
    <Wrap>
      <h1>Test web worker for image loading </h1>

      <div>
        <label htmlFor="">Image total count: {imageTotalCount}</label>
        <input
          type="range"
          name="range"
          value={imageTotalCount}
          min={10}
          max={200}
          onChange={(e) => {
            setImageTotalCount(parseInt(e.target.value, 10));
          }}
        />
        <button onClick={handleClickReloadImages}>Reload Images</button>
      </div>

      <h2>Loading by web worker</h2>
      <ImageContainer>
        {imageBlobs.map((imageBlob, index) => {
          return (
            <BlobImageWrap
              key={index}
              style={{
                backgroundImage: `url(${imageBlob})`,
              }}
              className={
                imageBlob === undefined
                  ? 'isLoading'
                  : imageBlob === null
                  ? 'isError'
                  : ''
              }
            />
          );
        })}
      </ImageContainer>

      <h2>Direct loading</h2>
      <ImageContainer>
        {images.map((imageUrl, index) => {
          return (
            <BlobImageWrap
              key={index}
              style={{
                backgroundImage: `url(${imageUrl})`,
              }}
            />
          );
        })}
      </ImageContainer>
    </Wrap>
  );
}
