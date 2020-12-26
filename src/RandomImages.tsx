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
  background-size: cover;
  outline: 1px solid #00d694;
  background-color: #eee;
`;

export default function RandomImages(): JSX.Element {
  const [imageTotalCount, setImageTotalCount] = useState(80);

  const [imageBlobs, setImageBlobs] = useState([]);

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

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL('./ImageLoadWorker.js', import.meta.url),
      );

      worker.current.postMessage(images);

      worker.current.onmessage = (e): void => {
        console.log(`from worker`, e.data.length);
        setImageBlobs(e.data);
      };
    }
  }, [images]);

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

      <h2>Loading by web worker</h2>
      <ImageContainer>
        {imageBlobs.map((imageBlob, index) => {
          return (
            <BlobImageWrap
              key={index}
              style={{
                backgroundImage: `url(${imageBlob})`,
              }}
            />
          );
        })}
      </ImageContainer>
    </Wrap>
  );
}
