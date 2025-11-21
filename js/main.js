//registrando o service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrado! 😎', reg);
    } catch (err) {
      console.log('😥 Falha ao registrar service worker: ', err);
    }
  });
}

// abrir câmera traseira como padrão
let constraints = {
  video: { facingMode: "environment" },audio: false
};

// elementos
const cameraView = document.querySelector("#camera--view");
const cameraOutput = document.querySelector("#camera--output");
const cameraSensor = document.querySelector("#camera--sensor");
const cameraInvert = document.querySelector("#camera--invert");
const cameraTrigger = document.querySelector("#camera--trigger");

// iniciar câmera
function cameraStart() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Erro ao acessar câmera:", error);
    });
}

// tirar foto
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  cameraOutput.src = cameraSensor.toDataURL("image/webp");
  cameraOutput.classList.add("taken");
};

// inverter câmera (traseira ↔ frontal)
cameraInvert.onclick = function () {
  constraints.video.facingMode =
    constraints.video.facingMode === "environment"
      ? "user"
      : "environment";

  cameraStart();
};

// iniciar câmera ao carregar página
window.addEventListener("load", cameraStart, false);
