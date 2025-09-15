// 👉 Importamos lo que necesitamos de Firestore
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  increment
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* ----------------- FRASES ----------------- */
const frasesVictoria = [
  "¡Esa es la actitud! 💪",
  "Victoria dulce, sigue así 🔥",
  "¡Brillaste como una estrella! ⭐",
  "El esfuerzo siempre paga 🏆",
  "Increíble trabajo, GG 👑",
  "¡Dominaste la grieta! ⚔️",
  "Nada los detiene 💥",
  "Están imparables 🚀",
  "¡Qué sinergia de equipo! 🤝",
  "Ese es el espíritu de campeones 🏅"
];

const frasesDerrota = [
  "No pasa nada, cada derrota es una lección 📚",
  "Lo importante es no rendirse 💜",
  "Hoy se pierde, mañana se gana 💫",
  "Respira, aprende y vuelve más fuerte ⚔️",
  "Incluso Faker perdió alguna vez 😉",
  "Esto es parte del camino 🚶",
  "De los errores nacen los pros 🧠",
  "La próxima es suya 🔮",
  "Perder también suma experiencia 🎯",
  "Confíen, que la remontada siempre llega 🔥"
];

/* ----------------- VARIABLES ----------------- */
let equipoActual = null;
let jugadorActual = null;

/* ----------------- FIRESTORE HELPERS ----------------- */

// Guardar un equipo
async function guardarEquipo(nombre) {
  await setDoc(doc(window.db, "equipos", nombre), { creado: new Date() }, { merge: true });
  equipoActual = nombre;
}

// Guardar un jugador
async function guardarJugador(nombreJugador) {
  if (!equipoActual) return alert("Primero seleccioná un equipo");
  await setDoc(
    doc(window.db, "equipos", equipoActual, "jugadores", nombreJugador),
    { puntos: 0, partidas: 0 },
    { merge: true }
  );
  jugadorActual = nombreJugador;
}

// Registrar partida
async function registrarPartida(resultado) {
  if (!equipoActual || !jugadorActual) return alert("Seleccioná equipo y jugador primero");

  const puntos = resultado === "victoria" ? 3 : 1;
  const jugadorRef = doc(window.db, "equipos", equipoActual, "jugadores", jugadorActual);

  await updateDoc(jugadorRef, {
    puntos: increment(puntos),
    partidas: increment(1)
  });

  mostrarFrase(resultado);
}

// Obtener jugadores de un equipo
async function obtenerJugadores() {
  if (!equipoActual) return [];
  const snap = await getDocs(collection(window.db, "equipos", equipoActual, "jugadores"));
  let lista = [];
  snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));
  return lista;
}

// Escuchar ranking en tiempo real
function escucharRanking(callback) {
  if (!equipoActual) return;
  return onSnapshot(collection(window.db, "equipos", equipoActual, "jugadores"), (snap) => {
    const data = [];
    snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
    data.sort((a, b) => b.puntos - a.puntos);
    callback(data);
  });
}

/* ----------------- ESTRELLAS ----------------- */
function generarEstrellas(puntos) {
  let estrellas = "";
  const niveles = ["bronce", "plata", "oro", "multicolor"];
  const nivel = Math.min(Math.floor(puntos / 10), 3);
  const cantidad = Math.min(puntos, 10);

  for (let i = 0; i < cantidad; i++) {
    estrellas += `<span class="estrella ${niveles[nivel]}">★</span>`;
  }

  if (puntos > 10) {
    estrellas += `<span class="extra">+${puntos - 10}</span>`;
  }
  return estrellas;
}

/* ----------------- FRASES Y EFECTOS ----------------- */
function mostrarFrase(resultado) {
  const frases = resultado === "victoria" ? frasesVictoria : frasesDerrota;
  const frase = frases[Math.floor(Math.random() * frases.length)];
  const box = document.createElement("div");
  box.className = `frase-popup ${resultado}`;
  box.innerText = frase;
  document.body.appendChild(box);

  if (resultado === "victoria") {
    lanzarConfetti();
  } else {
    shakePantalla();
  }

  setTimeout(() => box.remove(), 3000);
}

function lanzarConfetti() {
  if (typeof confetti !== "undefined") {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
  }
}

function shakePantalla() {
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 600);
}

/* ----------------- RENDER ----------------- */
function renderRanking(jugadores) {
  const cont = document.getElementById("ranking-list");
  if (!cont) return;
  cont.innerHTML = "";

  jugadores.forEach((j, i) => {
    const crown = i === 0 ? "👑" : "";
    cont.innerHTML += `
      <div class="rank-row">
        <div class="left">
          <div class="pos">${i + 1}</div>
          <strong>${j.id}</strong> ${crown}
        </div>
        <div class="right">
          ${generarEstrellas(j.puntos)}
        </div>
      </div>
    `;
  });
}

/* ----------------- EVENTOS UI ----------------- */
document.getElementById("btn-equipo")?.addEventListener("click", async () => {
  const nombre = prompt("Nombre del equipo:");
  if (nombre) await guardarEquipo(nombre);
});

document.getElementById("btn-jugador")?.addEventListener("click", async () => {
  const nombre = prompt("Nombre del jugador:");
  if (nombre) await guardarJugador(nombre);
});

document.getElementById("btn-victoria")?.addEventListener("click", () => registrarPartida("victoria"));
document.getElementById("btn-derrota")?.addEventListener("click", () => registrarPartida("derrota"));

document.getElementById("btn-ranking")?.addEventListener("click", () => {
  escucharRanking(renderRanking);
});
