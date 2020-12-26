self.addEventListener('message', async function (e: MessageEvent<string[]>) {
  console.log(`data from main`, e.data);

  const urls = e.data;

  const images = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const fileBlob = await response.blob();

        console.log(`fileBlob.type`, fileBlob.type);

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
