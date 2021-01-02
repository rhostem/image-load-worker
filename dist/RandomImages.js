import React, {useState, useCallback, useMemo} from "../web_modules/react.js";
import styled from "../web_modules/styled-components.js";
import useImageLoadWorker2 from "./hooks/useImageLoadWorker.js";
const Wrap = styled.div`
  padding: 1rem;
`;
const RadioGroup = styled.div`
  margin-top: 0.5rem;
  span.label {
    margin-right: 0.5rem;
  }

  label {
    margin-right: 0.5rem;
  }
`;
const ImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
`;
const ImageWrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 80px;
  outline: 1px solid #00d694;
  background-size: cover;
  background-color: #eee;
  font-size: 10px;
  transition: 2s ease all;

  &.isLoading {
    background-color: #ccc;
  }

  &.isError {
    background-color: red;
  }
`;
var LoadingMethod;
(function(LoadingMethod2) {
  LoadingMethod2["ALL"] = "ALL";
  LoadingMethod2["WORKER"] = "WORKER";
  LoadingMethod2["DIRECT"] = "DIRECT";
})(LoadingMethod || (LoadingMethod = {}));
var UpdateStyle;
(function(UpdateStyle2) {
  UpdateStyle2["ALL"] = "ALL_TOGETHER";
  UpdateStyle2["INCREMENTALLY"] = "INCREMENTALLY";
})(UpdateStyle || (UpdateStyle = {}));
export default function RandomImages() {
  const [imageTotalCount, setImageTotalCount] = useState(80);
  const [loadingMethod, setLoadingMethod] = useState(LoadingMethod.ALL);
  const [updateStyle, setUpdateStyle] = useState(UpdateStyle.ALL);
  const randomImages = useMemo(() => new Array(imageTotalCount).fill(void 0).map(() => `https://picsum.photos/seed/${Math.floor(Math.random() * 1e4)}/720/1080`), [imageTotalCount]);
  const handleClickReloadImages = useCallback(() => {
    const lastCount = imageTotalCount;
    setImageTotalCount(0);
    setTimeout(() => {
      setImageTotalCount(lastCount);
    }, 300);
  }, [imageTotalCount]);
  const handleChangeLoadingMethod = useCallback((e) => {
    setLoadingMethod(e.target.value);
    handleClickReloadImages();
  }, [handleClickReloadImages]);
  const handleChangeUpdateStyle = useCallback((e) => {
    setUpdateStyle(e.target.value);
    handleClickReloadImages();
  }, [handleClickReloadImages]);
  const {imageBlobs, maxWorkers} = useImageLoadWorker2({
    images: randomImages,
    incrementalUpdate: updateStyle === UpdateStyle.INCREMENTALLY
  });
  return /* @__PURE__ */ React.createElement(Wrap, null, /* @__PURE__ */ React.createElement("h1", null, "Web worker for image loading "), /* @__PURE__ */ React.createElement("p", null, "Create multiple(=number of logical processors by", " ", /* @__PURE__ */ React.createElement("code", null, "navigator.hardwareConcurrency"), ") web workers to load images simultaneously."), /* @__PURE__ */ React.createElement("p", null, "DOM is going to be updated with fetched images as soon as worker's job is done."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", {
    htmlFor: ""
  }, /* @__PURE__ */ React.createElement("b", null, "Image total count "), imageTotalCount), /* @__PURE__ */ React.createElement("input", {
    type: "range",
    name: "range",
    value: imageTotalCount,
    min: 10,
    max: 240,
    onChange: (e) => {
      setImageTotalCount(parseInt(e.target.value, 10));
    }
  }), /* @__PURE__ */ React.createElement("button", {
    onClick: handleClickReloadImages
  }, "Reload Images"), /* @__PURE__ */ React.createElement(RadioGroup, null, /* @__PURE__ */ React.createElement("span", {
    className: "label"
  }, /* @__PURE__ */ React.createElement("b", null, "Loading Method")), /* @__PURE__ */ React.createElement("input", {
    type: "radio",
    name: "loadingMethod",
    id: "loadingMethod_all",
    value: LoadingMethod.ALL,
    checked: loadingMethod === LoadingMethod.ALL,
    onChange: handleChangeLoadingMethod
  }), /* @__PURE__ */ React.createElement("label", {
    htmlFor: "loadingMethod_all"
  }, "All"), /* @__PURE__ */ React.createElement("input", {
    type: "radio",
    name: "loadingMethod",
    id: "loadingMethod_woker",
    value: LoadingMethod.WORKER,
    checked: loadingMethod === LoadingMethod.WORKER,
    onChange: handleChangeLoadingMethod
  }), /* @__PURE__ */ React.createElement("label", {
    htmlFor: "loadingMethod_woker"
  }, "Web Worker"), /* @__PURE__ */ React.createElement("input", {
    type: "radio",
    name: "loadingMethod",
    id: "loadingMethod_direct",
    value: LoadingMethod.DIRECT,
    checked: loadingMethod === LoadingMethod.DIRECT,
    onChange: handleChangeLoadingMethod
  }), /* @__PURE__ */ React.createElement("label", {
    htmlFor: "loadingMethod_direct"
  }, "Direct")), /* @__PURE__ */ React.createElement(RadioGroup, null, /* @__PURE__ */ React.createElement("span", {
    className: "label"
  }, /* @__PURE__ */ React.createElement("b", null, "Update Style")), /* @__PURE__ */ React.createElement("input", {
    type: "radio",
    name: "updateStyle",
    id: "updateStyle_all",
    value: UpdateStyle.ALL,
    checked: updateStyle === UpdateStyle.ALL,
    onChange: handleChangeUpdateStyle
  }), /* @__PURE__ */ React.createElement("label", {
    htmlFor: "updateStyle_all"
  }, "Update all together"), /* @__PURE__ */ React.createElement("input", {
    type: "radio",
    name: "updateStyle",
    id: "updateStyle_increment",
    value: UpdateStyle.INCREMENTALLY,
    checked: updateStyle === UpdateStyle.INCREMENTALLY,
    onChange: handleChangeUpdateStyle
  }), /* @__PURE__ */ React.createElement("label", {
    htmlFor: "updateStyle_increment"
  }, "Update incrementally")), /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement(RadioGroup, null, /* @__PURE__ */ React.createElement("span", {
    className: "label"
  }, /* @__PURE__ */ React.createElement("b", null, "Number of workers")), /* @__PURE__ */ React.createElement("span", null, maxWorkers))), (loadingMethod === LoadingMethod.ALL || loadingMethod === LoadingMethod.WORKER) && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Loading by web worker"), /* @__PURE__ */ React.createElement(ImageContainer, null, imageBlobs.map((imageBlob, index) => {
    return /* @__PURE__ */ React.createElement(ImageWrap, {
      key: index,
      style: imageBlob ? {
        backgroundImage: `url(${imageBlob})`
      } : {},
      className: imageBlob === void 0 ? "isLoading" : imageBlob === null ? "isError" : ""
    }, imageBlob === void 0 && /* @__PURE__ */ React.createElement("span", null, "loding"), imageBlob === null && /* @__PURE__ */ React.createElement("span", null, "error"));
  }))), (loadingMethod === LoadingMethod.ALL || loadingMethod === LoadingMethod.DIRECT) && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "Direct loading"), /* @__PURE__ */ React.createElement(ImageContainer, null, randomImages.map((imageUrl, index) => {
    return /* @__PURE__ */ React.createElement(ImageWrap, {
      key: index,
      style: {
        backgroundImage: `url(${imageUrl})`
      }
    });
  }))));
}
