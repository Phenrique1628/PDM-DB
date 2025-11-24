if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { type: "module" });
      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

const constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view");
const cameraOutput = document.querySelector("#camera--output");
const cameraSensor = document.querySelector("#camera--sensor");
const cameraTrigger = document.querySelector("#camera--trigger");

cameraSensor.style.display = 'none';
cameraOutput.style.display = 'none';

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      cameraView.srcObject = stream;
      cameraView.style.display = 'block';
      cameraOutput.style.display = 'none';
      cameraSensor.style.display = 'none';

      const cameraContainer = document.getElementById('camera');
      if (cameraContainer) cameraContainer.style.position = 'relative';
    })
    .catch(function (error) {
      console.error("Ocorreu um Erro.", error);
    });
}

cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  cameraOutput.src = cameraSensor.toDataURL("image/webp");
  cameraOutput.classList.add("taken");
  cameraOutput.style.display = 'block';
  cameraOutput.style.position = 'absolute';
  cameraOutput.style.width = '120px';
  cameraOutput.style.height = 'auto';
  cameraOutput.style.bottom = '10px';
  cameraOutput.style.right = '10px';
  cameraOutput.style.zIndex = '100';
  cameraOutput.style.border = '2px solid rgba(255,255,255,0.9)';
  cameraOutput.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
  cameraOutput.style.borderRadius = '4px';

const timestamp = new Date().toLocaleString(); 
cameraOutput.dataset.timestamp = timestamp;

  cameraSensor.style.display = 'none';
};

window.addEventListener("load", cameraStart, false);
