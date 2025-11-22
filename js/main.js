// registrando a service worker
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

// capturando os elementos em tela
const cameraView = document.querySelector("#camera--view");
const cameraOutput = document.querySelector("#camera--output");
const cameraSensor = document.querySelector("#camera--sensor");
const cameraTrigger = document.querySelector("#camera--trigger");

// estado inicial: esconder o canvas e a imagem de saída
cameraSensor.style.display = 'none';
cameraOutput.style.display = 'none';

// Estabelecendo o acesso a câmera e inicializando a visualização
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      cameraView.srcObject = stream;
      // mostrar o vídeo de visualização
      cameraView.style.display = 'block';
      cameraOutput.style.display = 'none';
      cameraSensor.style.display = 'none';
    })
    .catch(function (error) {
      console.error("Ocorreu um Erro.", error);
    });
}

// Função para tirar foto
cameraTrigger.onclick = function () {
  // dimensiona o canvas e desenha o frame atual do vídeo
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  // converte para base64 e mostra apenas a imagem de saída
  cameraOutput.src = cameraSensor.toDataURL("image/webp");
  cameraOutput.classList.add("taken");
  cameraOutput.style.display = 'block';

const timestamp = new Date().toLocaleString(); // ex: "21/11/2025 14:30:05" dependendo do locale
cameraOutput.dataset.timestamp = timestamp;

  // esconder vídeo e canvas para não duplicar a imagem na tela
  cameraView.style.display = 'none';
  cameraSensor.style.display = 'none';
};

// carrega imagem de câmera quando a janela carregar
window.addEventListener("load", cameraStart, false);
