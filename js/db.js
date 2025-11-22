import { openDB } from 'https://unpkg.com/idb?module';

let db;

async function createDB() {
    try {
        // bump version to 2 so we can create a store with autoIncrement id
        db = await openDB('little_bank', 2, {
            upgrade(db, oldVersion, newVersion, transaction) {
                // If this is a fresh DB, create the store with autoIncrement id
                if (!db.objectStoreNames.contains('plantas')) {
                    const store = db.createObjectStore('plantas', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('nome', 'nome');
                    store.createIndex('timestamp', 'timestamp');
                } else if (oldVersion < 2) {
                    // Attempt a simple migration: read existing records, recreate store with id, copy records.
                    try {
                        const oldStore = transaction.objectStore('plantas');
                        const existing = oldStore.getAll();
                        existing.then(records => {
                            // delete old store and recreate with autoIncrement id
                            try {
                                db.deleteObjectStore('plantas');
                            } catch (e) {
                                // ignore if deletion not possible
                            }
                            const newStore = db.createObjectStore('plantas', { keyPath: 'id', autoIncrement: true });
                            newStore.createIndex('nome', 'nome');
                            newStore.createIndex('timestamp', 'timestamp');
                            // copy records (some browsers may not allow async operations here; if so, clear site data)
                            records.forEach(r => {
                                // preserve nome/date/foto
                                newStore.add({ nome: r.nome, timestamp: r.date || r.timestamp, foto: r.foto, anotacao: r.anotacao || '' });
                            });
                        }).catch(() => {
                            // if migration fails, we'll create the store empty below
                            if (!db.objectStoreNames.contains('plantas')) {
                                const s = db.createObjectStore('plantas', { keyPath: 'id', autoIncrement: true });
                                s.createIndex('nome', 'nome');
                                s.createIndex('timestamp', 'timestamp');
                            }
                        });
                    } catch (e) {
                        // fallback: ensure store exists
                            if (!db.objectStoreNames.contains('plantas')) {
                            const s = db.createObjectStore('plantas', { keyPath: 'id', autoIncrement: true });
                            s.createIndex('nome', 'nome');
                            s.createIndex('timestamp', 'timestamp');
                        }
                    }
                }
            }
        });
        showResult("Banco de dados aberto!");
    } catch (e) {
        showResult("Erro ao criar o banco de dados: " + e.message + ". Se já existia um DB antigo, limpe os dados do site e recarregue a página.");
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    createDB();
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

async function addData() {
    const nome = document.getElementById("nome").value;
    const anotacao = document.getElementById("anotacao").value;

    // pega a imagem atual do <img id="camera--output"> e o timestamp salvo no dataset
    const imgEl = document.getElementById("camera--output");
    const fotoBase64 = imgEl.src;
    const timestamp = imgEl.dataset.timestamp || new Date().toLocaleString();

    const tx = await db.transaction('plantas', 'readwrite');
    const store = tx.objectStore('plantas');

    await store.add({
        nome: nome,
        anotacao: anotacao,
        timestamp: timestamp,
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

    const tx = db.transaction('plantas', 'readonly');
    const store = tx.objectStore('plantas');

    const plantas = await store.getAll();

    const output = document.querySelector("output");

    if (!plantas || plantas.length === 0) {
        output.innerHTML = "Nenhum registro encontrado!";
        return;
    }

    // cria lista visual com imagens
    let html = "<h3>Registros encontrados:</h3>";

    plantas.forEach(p => {
        const when = p.timestamp || '';
        html += `
            <div style="border:1px solid #aaa; margin:10px; padding:10px;">
                <p><b>Nome:</b> ${p.nome}</p>
                <p><b>Anotação:</b> ${p.anotacao || ''}</p>
                <p><b>Data hora:</b> ${when}</p>
                <img src="${p.foto}" style="width:150px; border:1px solid #444;">
            </div>
        `;
    });

    output.innerHTML = html;
}

function showResult(text) {
    document.querySelector("output").innerHTML = text;
}
