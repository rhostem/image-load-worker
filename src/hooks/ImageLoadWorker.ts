self.addEventListener('message', async function (e: MessageEvent<string[]>) {
  const urls = e.data;

  const images = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const fileBlob = await response.blob();

        if (/image\/.+/.test(fileBlob.type)) {
          return URL.createObjectURL(fileBlob);
        }
      } catch (e) {
        return null;
      }
    }),
  );

  self.postMessage(images);
});
