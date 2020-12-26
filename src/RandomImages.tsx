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

export const Image = styled.div`
  position: relative;
  width: 90px;
  height: 160px;
  background-size: cover;
  outline: 1px solid #00d694;
  background-color: #eee;
`;

export default function RandomImages(): JSX.Element {
  const [imageTotalCount, setImageTotalCount] = useState(20);

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
        console.log(`from worker`, e.data);
      };
    }
  }, [images]);

  return (
    <Wrap>
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

      <ImageContainer>
        {images.map((url, index) => (
          <Image
            key={index}
            style={{
              backgroundImage: `url(${url})`,
            }}
          ></Image>
        ))}
      </ImageContainer>
    </Wrap>
  );
}
