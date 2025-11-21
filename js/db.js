import { openDB } from 'idb';

let db;

async function createDB() {
    try {
        db = await openDB('little_bank', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('pessoas', {
                            keyPath: 'nome',
                        });

                        store.createIndex('id', 'id');
                        showResult("Banco criado!");
                }
            }
        });
        showResult("Banco de dados aberto!");
    } catch (e) {
        showResult("Erro ao criar o banco de dados: " + e.message);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    createDB();
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

async function addData() {
    const idade = document.getElementById("idade").value;
    const nome = document.getElementById("nome").value;

    // pega a imagem atual do <img id="camera--output">
    const fotoBase64 = document.getElementById("camera--output").src;

    const tx = await db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas');

    await store.put({
        nome: nome,
        idade: idade,
        foto: fotoBase64 // salva a foto!
    });

    await tx.done;

    showResult("Salvo com sucesso!");
}

async function getData() {
    if (!db) {
        showResult("O banco de dados está fechado");
        return;
    }

    const tx = db.transaction('pessoas', 'readonly');
    const store = tx.objectStore('pessoas');

    const pessoas = await store.getAll();

    const output = document.querySelector("output");

    if (!pessoas || pessoas.length === 0) {
        output.innerHTML = "Nenhum registro encontrado!";
        return;
    }

    // cria lista visual com imagens
    let html = "<h3>Registros encontrados:</h3>";

    pessoas.forEach(p => {
        html += `
            <div style="border:1px solid #aaa; margin:10px; padding:10px;">
                <p><b>Nome:</b> ${p.nome}</p>
                <p><b>Idade:</b> ${p.idade}</p>
                <img src="${p.foto}" style="width:150px; border:1px solid #444;">
            </div>
        `;
    });

    output.innerHTML = html;
}

function showResult(text) {
    document.querySelector("output").innerHTML = text;
}
