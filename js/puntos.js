const LS_KEY = "sistemaPuntos_v5";

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { equipos: [], equipoActivo: null };
  return JSON.parse(raw);
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(store)); }

let store = load();
function getEquipoActivo() {
  return store.equipos.find(e => e.nombre === store.equipoActivo) || null;
}

/* ⭐ Función de estrellas (máximo 10 visibles, con niveles) */
function getStars(puntos) {
  const maxStars = 10;
  let estrellas = puntos % maxStars;
  if (estrellas === 0 && puntos > 0) estrellas = maxStars;

  let colorClass = "bronze";
  if (puntos >= 10 && puntos < 20) colorClass = "silver";
  else if (puntos >= 20 && puntos < 30) colorClass = "gold";
  else if (puntos >= 30) colorClass = "rainbow";

  return `<span class="stars ${colorClass}">${"★".repeat(estrellas)}</span>`;
}

/* 📢 Frases motivacionales */
const frasesVictoria = [
    "¡Esa es la actitud! 💪",
  "Victoria dulce, sigue así 🔥",
  "¡Brillaste como una estrella! ⭐",
  "El esfuerzo siempre paga 🏆",
  "Increíble trabajo, GG 👑",
  "¡Dominaste la grieta! ⚔️",
  "Nada te detiene 💥",
  "Eres imparable 🚀",
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
  "La próxima es tuya 🔮",
  "Perder también suma experiencia 🎯",
  "Confía, que la remontada siempre llega 🔥"
];

function mostrarFrase(resultado) {
  const frases = resultado === "victoria" ? frasesVictoria : frasesDerrota;
  const frase = frases[Math.floor(Math.random() * frases.length)];
  const box = document.createElement("div");
  box.className = `frase-popup ${resultado}`;
  box.innerText = frase;
  document.body.appendChild(box);

  // Efectos extra
  if (resultado === "victoria") {
    lanzarConfetti();
  } else {
    shakePantalla();
  }

  setTimeout(() => {
    box.remove();
  }, 3000);
}

/* 🎉 Confetti */
function lanzarConfetti() {
  if (typeof confetti === "undefined") {
    console.error("Confetti no está cargado");
    return;
  }

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 }
  });
}

/* 🔴 Shake */
function shakePantalla() {
  document.body.classList.add("shake");
  setTimeout(() => {
    document.body.classList.remove("shake");
  }, 600);
}


function render() {
  const equipo = getEquipoActivo();

  const cardEquipo = document.getElementById("cardEquipo");
  const cardJugadores = document.getElementById("cardJugadores");
  const cardPartidas = document.getElementById("cardPartidas");
  const cardResumen = document.getElementById("cardResumen");
  const cardRecientes = document.getElementById("cardRecientes");
  const cardToggleRanking = document.getElementById("cardToggleRanking");
  const cardRanking = document.getElementById("cardRanking");

  if (!equipo) {
    cardEquipo.style.display = "block";
    cardEquipo.innerHTML = `
      <h2>Equipos</h2>
      <div class="row">
        <select id="equipoSelect">
          ${store.equipos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join("")}
        </select>
        <button class="btn btn-primary" onclick="usarEquipo()">Usar</button>
        <button class="btn btn-outline" onclick="nuevoEquipo()">Nuevo equipo</button>
      </div>
    `;
    cardJugadores.style.display = "none";
    cardPartidas.style.display = "none";
    cardResumen.style.display = "none";
    cardRecientes.style.display = "none";
    cardToggleRanking.style.display = "none";
    cardRanking.style.display = "none";
    return;
  }

  // Equipo activo
  cardEquipo.style.display = "block";
  cardEquipo.innerHTML = `
    <h2>Equipo actual: ${equipo.nombre}</h2>
    <button class="btn btn-outline" onclick="resetEquipo()">Cambiar equipo</button>
  `;

  // Jugadores
  cardJugadores.style.display = "block";
  cardJugadores.innerHTML = `
    <h3>Jugadores</h3>
    <div class="row">
      <input id="jugadorInput" placeholder="Nombre del jugador">
      <button class="btn btn-primary" onclick="agregarJugador()">Agregar</button>
    </div>
    <div class="list" style="margin-top:12px;">
      ${equipo.jugadores.map(j => `
        <div class="match">
          <div class="meta"><span>${j.nombre}</span></div>
          <div class="points">${getStars(j.puntos)} <small>${j.puntos} pts</small></div>
        </div>
      `).join("")}
    </div>
  `;

  // Registrar partidas
  if (equipo.jugadores.length > 0) {
    cardPartidas.style.display = "block";
    cardPartidas.innerHTML = `
      <h3>Registrar partida</h3>
      <div class="row">
        <select id="jugadorSelect">
          ${equipo.jugadores.map(j => `
            <option value="${j.nombre}" ${j.nombre===equipo.currentPlayerName?"selected":""}>${j.nombre}</option>
          `).join("")}
        </select>
        <button class="btn btn-win" onclick="registrarPartida('victoria')">Victoria (+3)</button>
        <button class="btn btn-lose" onclick="registrarPartida('derrota')">Derrota (+1)</button>
      </div>
    `;
  } else {
    cardPartidas.style.display = "none";
  }

  // Resumen
  if (equipo.jugadores.length > 0) {
    cardResumen.style.display = "grid";
    cardResumen.innerHTML = `
      <div class="stat"><div class="k">Jugadores</div><div class="v">${equipo.jugadores.length}</div></div>
      <div class="stat"><div class="k">Partidas</div><div class="v">${equipo.partidas.length}</div></div>
      <div class="stat"><div class="k">Líder</div><div class="v">${equipo.jugadores.sort((a,b)=>b.puntos-a.puntos)[0]?.nombre || "—"}</div></div>
    `;
  } else {
    cardResumen.style.display = "none";
  }

  // Partidas recientes
  if (equipo.partidas.length > 0) {
    cardRecientes.style.display = "block";
    cardRecientes.innerHTML = `
      <h3>Últimas partidas</h3>
      <div class="list">
        ${equipo.partidas.slice(0,5).map(p=> `
          <div class="match">
            <div class="meta">
              <span class="badge ${p.resultado}">${p.resultado.toUpperCase()}</span> ${p.jugador}
            </div>
            <small>${p.fecha}</small>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    cardRecientes.style.display = "none";
  }

  // Botón toggle ranking
  cardToggleRanking.style.display = "block";
  cardToggleRanking.innerHTML = `
    <button class="btn btn-primary" onclick="toggleRanking()">
      ${cardRanking.style.display === "block" ? "Ocultar ranking" : "Ver ranking"}
    </button>
  `;

  // Ranking
  if (cardRanking.style.display === "block") {
    const orden = [...equipo.jugadores].sort((a,b)=> b.puntos - a.puntos);
    cardRanking.innerHTML = `
      <h3>Ranking</h3>
      <div class="list">
        ${orden.map((j,i)=> `
          <div class="rank-row ${i===0 ? "leader":""}">
            <div class="left">
              <div class="pos">${i+1}</div>
              <span>${j.nombre} ${i===0 ? "👑":""}</span>
            </div>
            <div>${getStars(j.puntos)} <small>${j.puntos} pts</small> (${j.victorias}V-${j.derrotas}D)</div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

// ======================
// Acciones
// ======================
function nuevoEquipo() {
  document.getElementById("modalEquipo").style.display = "flex";
}
function cerrarModal() {
  document.getElementById("modalEquipo").style.display = "none";
}
function confirmarNuevoEquipo() {
  const nombre = document.getElementById("nuevoEquipoInput").value.trim();
  if (!nombre) return;
  if (store.equipos.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) {
    alert("Ese equipo ya existe.");
    return;
  }
  store.equipos.push({ nombre, jugadores:[], partidas:[], currentPlayerName:null });
  store.equipoActivo = nombre;
  save(); render();
  cerrarModal();
  document.getElementById("nuevoEquipoInput").value = "";
}

function usarEquipo() {
  const sel = document.getElementById("equipoSelect").value;
  store.equipoActivo = sel;
  save(); render();
}
function resetEquipo() {
  store.equipoActivo = null;
  save(); render();
}
function agregarJugador() {
  const equipo = getEquipoActivo();
  const nombre = document.getElementById("jugadorInput").value.trim();
  if (!nombre) return;
  equipo.jugadores.push({ nombre, puntos:0, victorias:0, derrotas:0 });
  equipo.currentPlayerName = nombre;
  document.getElementById("jugadorInput").value = "";
  save(); render();
}
function registrarPartida(resultado) {
  const equipo = getEquipoActivo();
  const jugadorNombre = document.getElementById("jugadorSelect").value;
  equipo.currentPlayerName = jugadorNombre;
  const jugador = equipo.jugadores.find(j => j.nombre === jugadorNombre);

  if (resultado === "victoria") { jugador.puntos+=3; jugador.victorias++; }
  else { jugador.puntos+=1; jugador.derrotas++; }

  equipo.partidas.unshift({ jugador:jugadorNombre, resultado, fecha:new Date().toLocaleString() });
  save(); render();
  mostrarFrase(resultado); // 👈 aparece mensaje motivacional
}
function toggleRanking() {
  const cardRanking = document.getElementById("cardRanking");
  cardRanking.style.display = cardRanking.style.display === "block" ? "none" : "block";
  render();
}

// Init
render();
