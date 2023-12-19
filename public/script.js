class Mensaje {
    constructor(tipo, contenido) {
        this.tipo = tipo;
        this.contenido = contenido;
    }

    obtenerTipo() {
        return this.tipo;
    }

    obtenerContenido() {
        return this.contenido;
    }

    toString() {
        return `${this.tipo}: ${this.contenido}`;
    }
}

function limpiarHistorial() {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    fetch("/limpiar-historial", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Historial limpiado", data);
        })
        .catch((err) => console.error("Error al limpiar historial", err));
}

document.getElementById("btn_clear").addEventListener("click", limpiarHistorial);

function mostrarHistorial(historial) {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    if (!historial || !historial.length) {
        console.error("Error: Datos de historial no válidos");
        return;
    }

    for (let i = historial.length - 1; i >= 0; i--) {
        const mensaje = historial[i];
        const tipo = mensaje.tipo || 'usuario';
        const clase = tipo === 'usuario' ? 'usuario' : 'bot';
        const contenido = mensaje.mensaje || '';
        const mensajeObj = new Mensaje(tipo, contenido);
        mostrarMensajeEnChat(mensajeObj, clase);
    }
}

function mostrarMensajeEnChat(mensaje, clase) {
    const chat = document.getElementById("chat");
    chat.innerHTML += `<p class="${clase}">${mensaje.toString()}</p>`;
}

document.getElementById("btn_send").addEventListener("click", async () => {
    const promtInput = document.getElementById("promt");

    try {
        const promptValue = promtInput.value.trim();

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: promptValue }),
        });

        if (!response.ok) {
            // Mostrar mensaje de error en el chat
            mostrarHistorial([{ tipo: "bot", mensaje: "Error en la petición" }]);
            throw new Error("Error en la petición");
        }

        const data = await response.json();

        if (data.respuesta !== undefined) {
            mostrarHistorial(data.historial);
        } else {
            // Mostrar mensaje de error en el chat
            mostrarHistorial([{ tipo: "bot", mensaje: "Error en la respuesta" }]);
            console.error("Error en la respuesta");
        }
    } catch (e) {
        // Mostrar mensaje de error en el chat
        mostrarHistorial([{ tipo: "bot", mensaje: `Error al procesar la solicitud: ${e.message}` }]);
        console.error("Error al procesar la solicitud", e);
    }finally{
        limpiarInput();
    }
});

window.addEventListener("load", async () => {
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: "" }),
        });

        if (!response.ok) {
            // Mostrar mensaje de error en el chat
            mostrarHistorial([{ tipo: "bot", mensaje: "Error en la petición" }]);
            throw new Error("Error en la petición");
        }

        const data = await response.json();

        if (data.respuesta !== undefined) {
            mostrarHistorial(data.historial);
        } else {
            // Mostrar mensaje de error en el chat
            mostrarHistorial([{ tipo: "bot", mensaje: "Error en la respuesta" }]);
            console.error("Error en la respuesta");
        }
    } catch (e) {
        // Mostrar mensaje de error en el chat
        mostrarHistorial([{ tipo: "bot", mensaje: `Error al cargar el historial: ${e.message}` }]);
        console.error("Error al cargar el historial", e);
    }
});

function limpiarInput() {
    const promtInput = document.getElementById("promt");
    promtInput.value = "";
}

document.getElementById("promt").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        document.getElementById("btn_send").click();
    }
});
