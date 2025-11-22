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

      // garantir que o container do preview esteja posicionado para posicionamento absoluto da miniatura
      const cameraContainer = document.getElementById('camera');
      if (cameraContainer) cameraContainer.style.position = 'relative';
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
  // mostrar miniatura no canto sem esconder o vídeo
  cameraOutput.style.display = 'block';
  // estilo de miniatura (aparece sobre o vídeo, canto inferior direito)
  cameraOutput.style.position = 'absolute';
  cameraOutput.style.width = '120px';
  cameraOutput.style.height = 'auto';
  cameraOutput.style.bottom = '10px';
  cameraOutput.style.right = '10px';
  cameraOutput.style.zIndex = '100';
  cameraOutput.style.border = '2px solid rgba(255,255,255,0.9)';
  cameraOutput.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
  cameraOutput.style.borderRadius = '4px';

const timestamp = new Date().toLocaleString(); // ex: "21/11/2025 14:30:05" dependendo do locale
cameraOutput.dataset.timestamp = timestamp;

  // manter o vídeo visível; apenas esconder o canvas
  cameraSensor.style.display = 'none';
};

// carrega imagem de câmera quando a janela carregar
window.addEventListener("load", cameraStart, false);
