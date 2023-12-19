const express = require('express');
const fs = require('fs').promises;
const { query } = require("./chat");
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

let chatHistory = [];
let contexto = "";

async function loadChatHistory() {
    try {
        const data = await fs.readFile('chatHistory.json', 'utf8');
        chatHistory = JSON.parse(data);
    } catch (error) {

        if (error.code === 'ENOENT') {
            await fs.writeFile('chatHistory.json', '[]', 'utf8');
        } else {
            console.error("Error al cargar el historial", error);
        }
    }
}

async function loadContextFile() {
    try {
        contexto = await fs.readFile('contexto.txt', 'utf8');
        console.log('Archivo cargado', contexto);
    } catch (error) {

        if (error.code === 'ENOENT') {
            await fs.writeFile('contexto.txt', '', 'utf8');
        } else {
            console.error("Error al cargar el archivo", error);
        }
    }
}

loadChatHistory();
loadContextFile();

app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await query(prompt);

        chatHistory.push({ tipo:'usuario', mensaje: prompt });
        chatHistory.push({ tipo:'bot', mensaje: response });

        await fs.writeFile('chatHistory.json', JSON.stringify(chatHistory), 'utf8');

        res.json({ respuesta: response, historial: chatHistory });
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`La aplicación está escuchando en http://localhost:${port}`);
});

app.post('/limpiar-historial', (req, res) => {
    chatHistory = [];
    console.log("Historial limpiado");

    res.json({ message: "Historial limpiado" });
});
