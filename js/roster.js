/* =====================================================
   CRIMSON VEIL
   DYNAMIC ROSTER
===================================================== */

import {
  db
} from "./firebase.js";


import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";



/* =====================================================
   ELEMENTS
===================================================== */

const rosterGrid =
  document.getElementById(
    "rosterGrid"
  );



/* =====================================================
   ROLE CONFIG
===================================================== */

const roleConfig = {

  top: {
    label: "TOP",
    icon: "fa-solid fa-shield-halved",
    defaultSymbol: "✦",
    order: 1
  },

  jungle: {
    label: "JUNGLE",
    icon: "fa-solid fa-compass",
    defaultSymbol: "☾",
    order: 2
  },

  mid: {
    label: "MID",
    icon: "fa-solid fa-wand-magic-sparkles",
    defaultSymbol: "✧",
    order: 3
  },

  adc: {
    label: "ADC",
    icon: "fa-solid fa-crosshairs",
    defaultSymbol: "❀",
    order: 4
  },

  support: {
    label: "SUPPORT",
    icon: "fa-solid fa-hand-holding-heart",
    defaultSymbol: "♡",
    order: 5
  }

};



/* =====================================================
   DEFAULT COLOR
===================================================== */

const DEFAULT_COLOR =
  "#ef476a";



/* =====================================================
   FIRESTORE LISTENER
===================================================== */

const usersReference =
  collection(
    db,
    "usuarios"
  );


onSnapshot(

  usersReference,

  snapshot => {

    const players = [];


    snapshot.forEach(

      documentSnapshot => {

        const data =
          documentSnapshot.data();


        const role =
          normalizeRole(
            data.rol
          );


        /*
          Solo mostramos roles de jugadoras.

          Staff / coach / cuentas que no tengan
          rol de juego no aparecen en este roster.
        */

        if (!roleConfig[role]) {

          return;

        }


        players.push({

          id:
            documentSnapshot.id,

          nickname:
            data.nickname ||
            "Player",

          role:
            role,

          quote:
            data.frase ||
            "Personaliza tu frase.",

          symbol:
            data.simbolo ||
            roleConfig[role].defaultSymbol,

          color:
            data.accentColor ||
            DEFAULT_COLOR

        });

      }

    );


    sortPlayers(
      players
    );


    renderRoster(
      players
    );

  },

  error => {

    console.error(
      "Error cargando roster:",
      error
    );


    showRosterError();

  }

);



/* =====================================================
   NORMALIZE ROLE
===================================================== */

function normalizeRole(role) {

  if (!role) {

    return "";

  }


  return String(role)
    .trim()
    .toLowerCase();

}



/* =====================================================
   SORT
===================================================== */

function sortPlayers(players) {

  players.sort(

    (a, b) => {

      const orderA =
        roleConfig[a.role]?.order ??
        99;


      const orderB =
        roleConfig[b.role]?.order ??
        99;


      if (orderA !== orderB) {

        return orderA - orderB;

      }


      /*
        Si hay dos ADC, las ordenamos
        por nickname para que el orden
        sea estable.
      */

      return a.nickname.localeCompare(
        b.nickname,
        "es",
        {
          sensitivity:
            "base"
        }
      );

    }

  );

}



/* =====================================================
   RENDER ROSTER
===================================================== */

function renderRoster(players) {

  if (!rosterGrid) {

    return;

  }


  rosterGrid.innerHTML =
    "";


  if (
    players.length === 0
  ) {

    rosterGrid.innerHTML = `

      <div class="roster-empty">

        <span>
          ☾
        </span>

        <p>
          Todavía no hay integrantes registradas.
        </p>

      </div>

    `;


    return;

  }


  players.forEach(

    player => {

      const card =
        createPlayerCard(
          player
        );


      rosterGrid.appendChild(
        card
      );

    }

  );

}



/* =====================================================
   CREATE CARD
===================================================== */

function createPlayerCard(player) {

  const config =
    roleConfig[player.role];


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "player-card";


  card.dataset.role =
    player.role;


  card.style.setProperty(
    "--player-accent",
    player.color
  );


  card.innerHTML = `

    <div class="corner corner-top"></div>

    <div class="corner corner-bottom"></div>


    <div class="player-header">

      <div class="role-symbol">

        <i class="${config.icon}"></i>

      </div>


      <span class="player-role">

        ${config.label}

      </span>

    </div>


    <div class="player-content">

      <span class="player-decoration">

        ${escapeHTML(player.symbol)}

      </span>


      <h3>

        ${escapeHTML(player.nickname)}

      </h3>


      <p class="player-quote">

        ${escapeHTML(player.quote)}

      </p>

    </div>


    <div class="player-bottom">

      <span>

        CRIMSON VEIL

      </span>


      <span>

        ${config.label}

      </span>

    </div>

  `;


  /*
    main.js añade el hover solamente a las
    cards existentes al cargar la página.

    Como estas cards nacen después desde
    Firestore, añadimos aquí el mismo efecto.
  */

  addCardHover(
    card
  );


  return card;

}



/* =====================================================
   CARD HOVER
===================================================== */

function addCardHover(card) {

  card.addEventListener(

    "mousemove",

    event => {

      const rect =
        card.getBoundingClientRect();


      const x =
        event.clientX -
        rect.left;


      const y =
        event.clientY -
        rect.top;


      card.style.setProperty(
        "--mouse-x",
        `${x}px`
      );


      card.style.setProperty(
        "--mouse-y",
        `${y}px`
      );

    }

  );

}



/* =====================================================
   ERROR
===================================================== */

function showRosterError() {

  if (!rosterGrid) {

    return;

  }


  rosterGrid.innerHTML = `

    <div class="roster-empty">

      <span>
        ✧
      </span>

      <p>
        No pudimos cargar el team.
      </p>

    </div>

  `;

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(value ?? "");


  return element.innerHTML;

}
