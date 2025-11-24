import { openDB } from 'https://unpkg.com/idb?module';

let db;

async function deleteDB(id) {
        await db.delete('plantas', id);
        getData();
}
window.deleteDB = deleteDB;

async function createDB() {
    try {
        db = await openDB('little_bank', 2, {
            upgrade(db) {
                
                if (!db.objectStoreNames.contains('plantas')) {
                    const store = db.createObjectStore('plantas', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('nome', 'nome');
                    store.createIndex('timestamp', 'timestamp');
                }
            }
        });

        showResult("Banco de dados aberto!");
    } catch (e) {
        showResult("Erro ao criar o banco: " + e.message);
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

    const imgEl = document.getElementById("camera--output");
    const fotoBase64 = imgEl.src || "";
    const timestamp = imgEl.dataset.timestamp || new Date().toLocaleString();

    await db.add('plantas', {
        nome,
        anotacao,
        timestamp,
        foto: fotoBase64
    });

    showResult("Salvo com sucesso!");
}

async function getData() {
    if (!db) return showResult("DB não aberto!");

    const plantas = await db.getAll('plantas');
    const output = document.querySelector("output");

    if (plantas.length === 0) {
        output.innerHTML = "Nenhum registro encontrado!";
        return;
    }

    let html = "<h3>Registros encontrados:</h3>";
    

    plantas.forEach(p => {
        html += `
            <div style="border:1px solid #aaa; margin:10px; padding:10px;">
                <p><b>Nome:</b> ${p.nome}</p>
                <p><b>Anotação:</b> ${p.anotacao}</p>
                <p><b>Data hora:</b> ${p.timestamp}</p>
                <img src="${p.foto}" style="width:150px; border:1px solid #444;">
                <br><br>
                <button onclick="deleteDB(${p.id})"
                style="background:red; color:white; padding:5px 10px; border:none; cursor:pointer;">
                Remover
            </button>
            </div>`;
    });

    output.innerHTML = html;
}



function showResult(text) {
    document.querySelector("output").innerHTML = text;
}
