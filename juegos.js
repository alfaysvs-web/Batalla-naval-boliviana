const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");

const ancho = canvas.width;
const alto = canvas.height;

let jugador;
let enemigos;
let balas;
let particulas;
let puntos;
let vida;
let juegoActivo = true;
let tiempo = 0;
let ultimoDisparo = 0;

const teclas = {};

function crearJugador() {
    return {
        x: 500,
        y: 500,
        velocidad: 5,
        vida: 100,
        vidaMaxima: 100
    };
}

function crearEnemigos() {
    return Array.from({ length: 5 }, (_, i) => ({
        x: 100 + i * 190,
        y: 100 + Math.random() * 130,
        vida: 3,
        vidaMaxima: 3,
        velocidad: 1.5 + Math.random() * 1.5,
        direccion: Math.random() < 0.5 ? 1 : -1
    }));
}

// BANDERA DE BOLIVIA
function banderaBolivia(x, y, ancho, alto) {
    ctx.fillStyle = "#D52B1E";
    ctx.fillRect(x, y, ancho, alto / 3);

    ctx.fillStyle = "#F9E300";
    ctx.fillRect(x, y + alto / 3, ancho, alto / 3);

    ctx.fillStyle = "#007934";
    ctx.fillRect(x, y + alto * 2 / 3, ancho, alto / 3);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ancho, alto);
}

// BANDERA DE CHILE
function banderaChile(x, y, ancho, alto) {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, ancho, alto / 2);

    ctx.fillStyle = "#D52B1E";
    ctx.fillRect(x, y + alto / 2, ancho, alto / 2);

    ctx.fillStyle = "#0039A6";
    ctx.fillRect(x, y, alto, alto / 2);

    ctx.fillStyle = "white";
    ctx.font = `${alto * 0.42}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", x + alto / 2, y + alto / 4);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ancho, alto);
}

// DIBUJAR BARCOS
function dibujarBarco(x, y, enemigo = false) {
    ctx.save();
    ctx.translate(x, y);

    // Casco
    ctx.fillStyle = enemigo ? "#743c36" : "#252e3b";

    ctx.beginPath();
    ctx.moveTo(-42, 0);
    ctx.lineTo(42, 0);
    ctx.lineTo(28, 17);
    ctx.lineTo(-28, 17);
    ctx.closePath();
    ctx.fill();

    // Cubierta
    ctx.fillStyle = "#9da6a9";
    ctx.fillRect(-24, -12, 48, 12);

    // Puente
    ctx.fillStyle = "#dedede";
    ctx.fillRect(-10, -27, 20, 15);

    // Cañón
    ctx.fillStyle = "#292929";
    ctx.fillRect(-3, -37, 6, 21);

    // Bandera según el equipo
    if (enemigo) {
        banderaChile(-8, -52, 22, 14);
    } else {
        banderaBolivia(-8, -52, 22, 14);
    }

    // Ventanas
    ctx.fillStyle = "#54c9ff";
    ctx.fillRect(-7, -23, 5, 4);
    ctx.fillRect(3, -23, 5, 4);

    ctx.restore();
}

// MAR
function dibujarMar() {
    ctx.fillStyle = "#0879aa";
    ctx.fillRect(0, 0, ancho, alto);

    for (let i = 0; i < 45; i++) {
        let x = (i * 137 + tiempo * 0.5) % ancho;
        let y = (i * 83) % alto;

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI);
        ctx.stroke();
    }
}

// DISPAROS DEL JUGADOR
function disparar() {
    if (!juegoActivo) return;

    const ahora = Date.now();

    if (ahora - ultimoDisparo < 350) return;

    ultimoDisparo = ahora;

    balas.push({
        x: jugador.x,
        y: jugador.y - 35,
        velocidad: 8,
        enemiga: false
    });
}

// EXPLOSIONES
function explosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particulas.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            vida: 30,
            color: Math.random() > 0.5 ? "orange" : "yellow"
        });
    }
}

// ACTUALIZAR VIDA
function actualizarVida() {
    document.getElementById("vida").textContent =
        vida + " / 100";

    const barra = document.getElementById("barraVida");

    barra.style.width = vida + "%";

    if (vida > 50) {
        barra.style.background = "#25df54";
    } else if (vida > 25) {
        barra.style.background = "orange";
    } else {
        barra.style.background = "red";
    }
}

// PANEL
function actualizarPanel() {
    document.getElementById("puntos").textContent = puntos;
    document.getElementById("enemigos").textContent = enemigos.length;
    actualizarVida();
}

// ACTUALIZACIÓN DEL JUEGO
function actualizar() {
    if (!juegoActivo) return;

    tiempo++;

    // MOVIMIENTO DEL JUGADOR
    if (teclas["ArrowLeft"] || teclas["a"])
        jugador.x -= jugador.velocidad;

    if (teclas["ArrowRight"] || teclas["d"])
        jugador.x += jugador.velocidad;

    if (teclas["ArrowUp"] || teclas["w"])
        jugador.y -= jugador.velocidad;

    if (teclas["ArrowDown"] || teclas["s"])
        jugador.y += jugador.velocidad;

    // Límites del océano
    jugador.x = Math.max(45, Math.min(955, jugador.x));
    jugador.y = Math.max(65, Math.min(560, jugador.y));

    // DISPARO AUTOMÁTICO MIENTRAS SE MANTIENE ESPACIO
    if (teclas[" "]) {
        disparar();
    }

    // MOVIMIENTO DE BALAS
    balas.forEach(b => {
        b.y -= b.velocidad;
    });

    balas = balas.filter(b => b.y > -20 && b.y < alto + 20);

    // MOVIMIENTO DE ENEMIGOS
    enemigos.forEach(e => {
        e.x += e.velocidad * e.direccion;

        if (e.x > 950 || e.x < 50) {
            e.direccion *= -1;
        }

        // DISPAROS ENEMIGOS
        if (Math.random() < 0.004) {
            balas.push({
                x: e.x,
                y: e.y + 25,
                velocidad: -5,
                enemiga: true
            });
        }
    });

    // COLISIONES
    balas.forEach(b => {

        if (b.enemiga) {
            if (
                Math.abs(b.x - jugador.x) < 38 &&
                Math.abs(b.y - jugador.y) < 23
            ) {
                b.golpeada = true;

                vida = Math.max(0, vida - 10);

                explosion(jugador.x, jugador.y);
            }

        } else {
            enemigos.forEach(e => {
                if (
                    Math.abs(b.x - e.x) < 42 &&
                    Math.abs(b.y - e.y) < 25 &&
                    !b.golpeada
                ) {
                    b.golpeada = true;

                    e.vida--;

                    explosion(e.x, e.y);

                    if (e.vida <= 0) {
                        puntos += 100;
                    }
                }
            });
        }
    });

    // ELIMINAR BALAS QUE IMPACTARON
    balas = balas.filter(b => !b.golpeada);

    // ELIMINAR ENEMIGOS DESTRUIDOS
    enemigos = enemigos.filter(e => e.vida > 0);

    // EXPLOSIONES
    particulas.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
    });

    particulas = particulas.filter(p => p.vida > 0);

    // FIN DEL JUEGO
    if (vida <= 0) {
        vida = 0;
        juegoActivo = false;
    }

    if (enemigos.length === 0) {
        juegoActivo = false;
    }

    actualizarPanel();
}

// DIBUJAR TODO
function dibujar() {
    dibujarMar();

    // ENEMIGOS
    enemigos.forEach(e => {
        dibujarBarco(e.x, e.y, true);

        ctx.fillStyle = "#222";
        ctx.fillRect(e.x - 25, e.y - 65, 50, 6);

        ctx.fillStyle = "#35ee45";
        ctx.fillRect(
            e.x - 25,
            e.y - 65,
            50 * e.vida / e.vidaMaxima,
            6
        );
    });

    // JUGADOR
    dibujarBarco(jugador.x, jugador.y);

    // BALAS
    balas.forEach(b => {
        ctx.fillStyle = b.enemiga ? "orange" : "#fff000";

        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // EXPLOSIONES
    particulas.forEach(p => {
        ctx.globalAlpha = p.vida / 30;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
        ctx.globalAlpha = 1;
    });

    // PANTALLA DE FINAL
    if (!juegoActivo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, ancho, alto);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 45px Arial";

        ctx.fillText(
            vida <= 0 ? "¡BARCO DESTRUIDO!" : "¡VICTORIA BOLIVIANA!",
            ancho / 2,
            alto / 2
        );

        ctx.font = "25px Arial";
        ctx.fillText(
            "Puntuación: " + puntos,
            ancho / 2,
            alto / 2 + 50
        );

        ctx.font = "18px Arial";
        ctx.fillText(
            "Presiona NUEVA PARTIDA para volver a jugar",
            ancho / 2,
            alto / 2 + 95
        );
    }
}

// BUCLE PRINCIPAL
function bucle() {
    actualizar();
    dibujar();

    requestAnimationFrame(bucle);
}

// TECLADO
document.addEventListener("keydown", e => {
    const key = e.key.length === 1
        ? e.key.toLowerCase()
        : e.key;

    teclas[key] = true;

    if (key === " " || key.startsWith("Arrow")) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    const key = e.key.length === 1
        ? e.key.toLowerCase()
        : e.key;

    teclas[key] = false;
});

// CONTROLES TÁCTILES DE MOVIMIENTO
document.querySelectorAll(".control").forEach(boton => {
    const key = boton.dataset.key;

    boton.addEventListener("pointerdown", e => {
        e.preventDefault();
        teclas[key] = true;
        boton.setPointerCapture(e.pointerId);
    });

    function soltar() {
        teclas[key] = false;
    }

    boton.addEventListener("pointerup", soltar);
    boton.addEventListener("pointercancel", soltar);
    boton.addEventListener("lostpointercapture", soltar);
});

// BOTÓN TÁCTIL DE DISPARO
const botonDisparo = document.getElementById("disparar");

botonDisparo.addEventListener("pointerdown", e => {
    e.preventDefault();
    teclas[" "] = true;
});

function soltarDisparo() {
    teclas[" "] = false;
}

botonDisparo.addEventListener("pointerup", soltarDisparo);
botonDisparo.addEventListener("pointercancel", soltarDisparo);
botonDisparo.addEventListener("lostpointercapture", soltarDisparo);

// REINICIAR
function reiniciar() {
    jugador = crearJugador();
    enemigos = crearEnemigos();
    balas = [];
    particulas = [];

    puntos = 0;
    vida = 100;
    juegoActivo = true;
    ultimoDisparo = 0;

    teclas[" "] = false;

    actualizarPanel();
}

document.getElementById("reiniciar").addEventListener("click", reiniciar);

// INICIAR JUEGO
reiniciar();
bucle();