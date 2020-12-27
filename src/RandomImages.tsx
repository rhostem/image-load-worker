import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import useImageLoadWorker from './hooks/useImageLoadWorker';

const Wrap = styled.div`
  padding: 1rem;
`;

const LoadingMethodSelector = styled.div``;

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

enum LoadingMethod {
  ALL = 'ALL',
  WORKER = 'WORKER',
  DIRECT = 'DIRECT',
}

export default function RandomImages(): JSX.Element {
  const [imageTotalCount, setImageTotalCount] = useState(78);
  const [loadingMethod, setLoadingMethod] = useState(LoadingMethod.WORKER);

  const randomImages = useMemo(
    () =>
      new Array(imageTotalCount)
        .fill(undefined)
        .map(
          () =>
            `https://picsum.photos/seed/${Math.floor(
              Math.random() * 10000,
            )}/720/1080`,
        ),
    [imageTotalCount],
  );

  const handleClickReloadImages = useCallback(() => {
    const lastCount = imageTotalCount;
    setImageTotalCount(0);
    setTimeout(() => {
      setImageTotalCount(lastCount);
    }, 300);
  }, [imageTotalCount]);

  const handleChangeLoadingMethod = useCallback(
    (e) => {
      console.log(e.target.value);
      setLoadingMethod(e.target.value);
      handleClickReloadImages();
    },
    [handleClickReloadImages],
  );

  const { imageBlobs } = useImageLoadWorker({
    images: randomImages,
  });

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

        <LoadingMethodSelector>
          <input
            type="radio"
            name="loadingMethod"
            id="loadingMethod_all"
            value={LoadingMethod.ALL}
            checked={loadingMethod === LoadingMethod.ALL}
            onChange={handleChangeLoadingMethod}
          />
          <label htmlFor="loadingMethod_all">All</label>

          <input
            type="radio"
            name="loadingMethod"
            id="loadingMethod_woker"
            value={LoadingMethod.WORKER}
            checked={loadingMethod === LoadingMethod.WORKER}
            onChange={handleChangeLoadingMethod}
          />
          <label htmlFor="loadingMethod_woker">Web Worker</label>

          <input
            type="radio"
            name="loadingMethod"
            id="loadingMethod_direct"
            value={LoadingMethod.DIRECT}
            checked={loadingMethod === LoadingMethod.DIRECT}
            onChange={handleChangeLoadingMethod}
          />
          <label htmlFor="loadingMethod_direct">Direct</label>
        </LoadingMethodSelector>
      </div>

      {(loadingMethod === LoadingMethod.ALL ||
        loadingMethod === LoadingMethod.WORKER) && (
        <>
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
        </>
      )}

      {(loadingMethod === LoadingMethod.ALL ||
        loadingMethod === LoadingMethod.DIRECT) && (
        <div>
          <h2>Direct loading</h2>
          <ImageContainer>
            {randomImages.map((imageUrl, index) => {
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
        </div>
      )}
    </Wrap>
  );
}
