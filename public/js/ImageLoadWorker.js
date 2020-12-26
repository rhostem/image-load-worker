onmessage = function (e) {
  console.log(`data from main`, e.data);

  setTimeout(() => {
    postMessage('result');
  }, 300);
};
