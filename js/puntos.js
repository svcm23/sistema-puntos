/* =====================================================
   CRIMSON VEIL
   POINTS SYSTEM + MATCH DETAILS
===================================================== */

import {
  auth,
  db
} from "./firebase.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";



/* =====================================================
   ELEMENTS
===================================================== */

const playerArea =
  document.getElementById("playerArea");

const pointsNickname =
  document.getElementById("pointsNickname");

const pointsRole =
  document.getElementById("pointsRole");

const pointsTotal =
  document.getElementById("pointsTotal");

const winsTotal =
  document.getElementById("winsTotal");

const lossesTotal =
  document.getElementById("lossesTotal");

const matchesTotal =
  document.getElementById("matchesTotal");

const starDisplay =
  document.getElementById("starDisplay");

const winButton =
  document.getElementById("winButton");

const lossButton =
  document.getElementById("lossButton");

const matchFormSection =
  document.getElementById("matchFormSection");

const selectedResultBadge =
  document.getElementById("selectedResultBadge");

const matchDetailsForm =
  document.getElementById("matchDetailsForm");

const championInput =
  document.getElementById("championInput");

const playedRoleInput =
  document.getElementById("playedRoleInput");

const killsInput =
  document.getElementById("killsInput");

const deathsInput =
  document.getElementById("deathsInput");

const assistsInput =
  document.getElementById("assistsInput");

const csInput =
  document.getElementById("csInput");

const visionInput =
  document.getElementById("visionInput");

const durationInput =
  document.getElementById("durationInput");

const noteInput =
  document.getElementById("noteInput");

const noteCounter =
  document.getElementById("noteCounter");

const csField =
  document.getElementById("csField");

const visionField =
  document.getElementById("visionField");

const csHelp =
  document.getElementById("csHelp");

const visionHelp =
  document.getElementById("visionHelp");

const saveMatchButton =
  document.getElementById("saveMatchButton");

const cancelMatchButton =
  document.getElementById("cancelMatchButton");

const recentMatches =
  document.getElementById("recentMatches");

const rankingList =
  document.getElementById("rankingList");

const resultPopup =
  document.getElementById("resultPopup");



/* =====================================================
   STATE
===================================================== */

let currentUser = null;

let currentProfile = null;

let selectedResult = null;

let stopProfileListener = null;

let stopMatchesListener = null;



/* =====================================================
   MESSAGES
===================================================== */

const victoryMessages = [

  "¡Esa es la actitud! ✦",

  "Victoria dulce. Seguí así ♛",

  "Una estrella más para el Veil ✧",

  "GG. El esfuerzo siempre paga.",

  "Dominaste la grieta ⚔",

  "Nada te detiene.",

  "The Veil rises again. ✦",

  "Otra victoria bajo el velo."

];


const defeatMessages = [

  "Cada derrota también construye el camino.",

  "Respirá. Aprendé. Volvé más fuerte. ☾",

  "Hoy se pierde, mañana se remonta.",

  "La próxima es tuya. ✦",

  "Perder también suma experiencia.",

  "Una partida no define tu progreso.",

  "Beneath the Veil, we rise again.",

  "Seguimos. Siempre."

];



/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(

  auth,

  user => {

    currentUser = user;

    cleanUserListeners();


    if (!user) {

      currentProfile = null;

      playerArea.classList.add(
        "hidden"
      );

      closeMatchForm();

      return;
    }


    playerArea.classList.remove(
      "hidden"
    );


    listenCurrentProfile(
      user.uid
    );


    listenRecentMatches(
      user.uid
    );

  }

);



/* =====================================================
   PROFILE
===================================================== */

function listenCurrentProfile(uid) {

  const profileReference =
    doc(
      db,
      "usuarios",
      uid
    );


  stopProfileListener =
    onSnapshot(

      profileReference,

      snapshot => {

        if (!snapshot.exists()) {

          console.error(
            "Perfil no encontrado."
          );

          return;
        }


        currentProfile =
          snapshot.data();


        renderCurrentProfile();

      },

      error => {

        console.error(
          "Error cargando perfil:",
          error
        );

      }

    );

}



/* =====================================================
   RENDER PROFILE
===================================================== */

function renderCurrentProfile() {

  if (!currentProfile) {
    return;
  }


  const nickname =
    currentProfile.nickname ||
    "Player";


  const role =
    normalizeRole(
      currentProfile.rol
    );


  const points =
    Number(
      currentProfile.puntos || 0
    );


  const wins =
    Number(
      currentProfile.victorias || 0
    );


  const losses =
    Number(
      currentProfile.derrotas || 0
    );


  const matches =
    Number(
      currentProfile.partidas ??
      (
        wins +
        losses
      )
    );


  pointsNickname.textContent =
    nickname;


  pointsRole.textContent =
    formatRole(role);


  pointsTotal.textContent =
    points;


  winsTotal.textContent =
    wins;


  lossesTotal.textContent =
    losses;


  matchesTotal.textContent =
    matches;


  /*
    Por defecto el formulario se abre
    con el rol del perfil.
  */

  if (
    !selectedResult &&
    isPlayerRole(role)
  ) {

    playedRoleInput.value =
      role;

    updateRoleFields();

  }


  renderStars(points);

}



/* =====================================================
   STARS
===================================================== */

function renderStars(points) {

  const maximumVisible = 10;


  let starCount =
    points % maximumVisible;


  if (
    starCount === 0 &&
    points > 0
  ) {

    starCount =
      maximumVisible;

  }


  let level =
    "bronze";


  if (
    points >= 10 &&
    points < 20
  ) {

    level =
      "silver";

  }


  if (
    points >= 20 &&
    points < 30
  ) {

    level =
      "gold";

  }


  if (
    points >= 30
  ) {

    level =
      "rainbow";

  }


  starDisplay.className =
    `star-display ${level}`;


  if (starCount === 0) {

    starDisplay.innerHTML = `

      <span class="no-stars">
        Tu primera estrella está esperando. ✦
      </span>

    `;

    return;
  }


  starDisplay.innerHTML =
    Array(starCount)
      .fill(
        `<span class="progress-star">★</span>`
      )
      .join("");

}



/* =====================================================
   RESULT BUTTONS
===================================================== */

winButton.addEventListener(

  "click",

  () => {

    openMatchForm(
      "victoria"
    );

  }

);


lossButton.addEventListener(

  "click",

  () => {

    openMatchForm(
      "derrota"
    );

  }

);



/* =====================================================
   OPEN FORM
===================================================== */

function openMatchForm(result) {

  if (
    !currentUser ||
    !currentProfile
  ) {

    return;
  }


  selectedResult =
    result;


  winButton.classList.toggle(
    "selected",
    result === "victoria"
  );


  lossButton.classList.toggle(
    "selected",
    result === "derrota"
  );


  if (
    result === "victoria"
  ) {

    selectedResultBadge.textContent =
      "VICTORIA · +3";


    selectedResultBadge.className =
      "selected-result-badge";

  } else {

    selectedResultBadge.textContent =
      "DERROTA · +1";


    selectedResultBadge.className =
      "selected-result-badge derrota";

  }


  const profileRole =
    normalizeRole(
      currentProfile.rol
    );


  if (
    isPlayerRole(profileRole)
  ) {

    playedRoleInput.value =
      profileRole;

  }


  updateRoleFields();


  matchFormSection.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {

      matchFormSection.scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });

    },
    80
  );


  championInput.focus();

}



/* =====================================================
   CANCEL
===================================================== */

cancelMatchButton.addEventListener(

  "click",

  closeMatchForm

);



function closeMatchForm() {

  selectedResult =
    null;


  winButton?.classList.remove(
    "selected"
  );


  lossButton?.classList.remove(
    "selected"
  );


  matchFormSection?.classList.add(
    "hidden"
  );


  resetForm();

}



/* =====================================================
   ROLE FIELDS
===================================================== */

playedRoleInput.addEventListener(

  "change",

  updateRoleFields

);



function updateRoleFields() {

  const role =
    playedRoleInput.value;


  const isSupport =
    role === "support";


  if (isSupport) {

    visionField.classList.add(
      "field-priority"
    );


    visionField.classList.remove(
      "field-muted"
    );


    csField.classList.add(
      "field-muted"
    );


    csField.classList.remove(
      "field-priority"
    );


    visionInput.required =
      true;


    csInput.required =
      false;


    visionHelp.textContent =
      "Dato principal para Support.";


    csHelp.textContent =
      "Opcional para Support.";

  } else {

    csField.classList.add(
      "field-priority"
    );


    csField.classList.remove(
      "field-muted"
    );


    visionField.classList.add(
      "field-muted"
    );


    visionField.classList.remove(
      "field-priority"
    );


    csInput.required =
      true;


    visionInput.required =
      false;


    csHelp.textContent =
      "Dato principal para este rol.";


    visionHelp.textContent =
      "Opcional para este rol.";

  }

}



/* =====================================================
   NOTE COUNTER
===================================================== */

noteInput.addEventListener(

  "input",

  () => {

    noteCounter.textContent =
      `${noteInput.value.length} / 160`;

  }

);



/* =====================================================
   SUBMIT
===================================================== */

matchDetailsForm.addEventListener(

  "submit",

  event => {

    event.preventDefault();


    registerDetailedMatch();

  }

);



/* =====================================================
   REGISTER MATCH
===================================================== */

async function registerDetailedMatch() {

  if (
    !currentUser ||
    !currentProfile ||
    !selectedResult
  ) {

    return;

  }


  const result =
    selectedResult;


  const pointsEarned =
    result === "victoria"
      ? 3
      : 1;


  const champion =
    championInput.value
      .trim();


  const role =
    playedRoleInput.value;


  const kills =
    numberValue(
      killsInput.value
    );


  const deaths =
    numberValue(
      deathsInput.value
    );


  const assists =
    numberValue(
      assistsInput.value
    );


  const cs =
    optionalNumber(
      csInput.value
    );


  const vision =
    optionalNumber(
      visionInput.value
    );


  const duration =
    numberValue(
      durationInput.value
    );


  const note =
    noteInput.value
      .trim();



  /* VALIDACIONES */

  if (!champion) {

    championInput.focus();

    return;
  }


  if (
    !isPlayerRole(role)
  ) {

    return;
  }


  if (
    duration < 1
  ) {

    durationInput.focus();

    return;
  }


  if (
    role === "support" &&
    vision === null
  ) {

    visionInput.focus();


    showErrorMessage(
      "Para Support necesitamos los puntos de visión."
    );


    return;
  }


  if (
    role !== "support" &&
    cs === null
  ) {

    csInput.focus();


    showErrorMessage(
      "Falta ingresar el CS de la partida."
    );


    return;
  }



  try {

    setRegisterDisabled(
      true
    );


    const profileReference =
      doc(
        db,
        "usuarios",
        currentUser.uid
      );


    const matchReference =
      doc(
        collection(
          db,
          "usuarios",
          currentUser.uid,
          "partidas"
        )
      );


    await runTransaction(

      db,

      async transaction => {

        const profileSnapshot =
          await transaction.get(
            profileReference
          );


        if (!profileSnapshot.exists()) {

          throw new Error(
            "Perfil inexistente."
          );

        }


        const profileData =
          profileSnapshot.data();


        const previousPoints =
          Number(
            profileData.puntos || 0
          );


        const previousWins =
          Number(
            profileData.victorias || 0
          );


        const previousLosses =
          Number(
            profileData.derrotas || 0
          );


        const previousMatches =
          Number(
            profileData.partidas || 0
          );


        const newPoints =
          previousPoints +
          pointsEarned;


        const newWins =
          previousWins +
          (
            result === "victoria"
              ? 1
              : 0
          );


        const newLosses =
          previousLosses +
          (
            result === "derrota"
              ? 1
              : 0
          );


        const newMatches =
          previousMatches + 1;



        /* ACTUALIZAR STATS GENERALES */

        transaction.update(

          profileReference,

          {

            puntos:
              newPoints,

            victorias:
              newWins,

            derrotas:
              newLosses,

            partidas:
              newMatches,

            actualizadoPuntos:
              serverTimestamp()

          }

        );



        /* GUARDAR PARTIDA DETALLADA */

        transaction.set(

          matchReference,

          {

            usuarioId:
              currentUser.uid,

            resultado:
              result,

            puntos:
              pointsEarned,

            campeon:
              champion,

            rolJugado:
              role,

            kills:
              kills,

            deaths:
              deaths,

            assists:
              assists,

            cs:
              cs,

            vision:
              vision,

            duracion:
              duration,

            nota:
              note,

            creado:
              serverTimestamp()

          }

        );

      }

    );


    showResultMessage(
      result
    );


    if (
      result === "victoria"
    ) {

      launchConfetti();

    } else {

      shakePage();

    }


    closeMatchForm();


  } catch(error) {

    console.error(
      "Error registrando partida:",
      error
    );


    showErrorMessage(
      "No pudimos registrar la partida. ✧"
    );


  } finally {

    setRegisterDisabled(
      false
    );

  }

}



/* =====================================================
   RECENT MATCHES
===================================================== */

function listenRecentMatches(uid) {

  const matchesQuery =
    query(

      collection(
        db,
        "usuarios",
        uid,
        "partidas"
      ),

      orderBy(
        "creado",
        "desc"
      ),

      limit(8)

    );


  stopMatchesListener =
    onSnapshot(

      matchesQuery,

      snapshot => {

        const matches = [];


        snapshot.forEach(
          documentSnapshot => {

            matches.push({

              id:
                documentSnapshot.id,

              ...documentSnapshot.data()

            });

          }
        );


        renderRecentMatches(
          matches
        );

      },

      error => {

        console.error(
          "Error cargando partidas:",
          error
        );


        recentMatches.innerHTML = `

          <div class="points-empty">

            <span>✧</span>

            <p>
              No pudimos cargar tus partidas.
            </p>

          </div>

        `;

      }

    );

}



/* =====================================================
   RENDER HISTORY
===================================================== */

function renderRecentMatches(matches) {

  recentMatches.innerHTML =
    "";


  if (
    matches.length === 0
  ) {

    recentMatches.innerHTML = `

      <div class="points-empty">

        <span>☾</span>

        <p>
          Todavía no registraste ninguna partida.
        </p>

      </div>

    `;

    return;
  }


  matches.forEach(
    match => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "recent-match detailed-match";


      const resultLabel =
        match.resultado === "victoria"
          ? "VICTORIA"
          : "DERROTA";


      /*
        Compatibilidad con partidas antiguas
        que no tengan todavía detalles.
      */

      const hasDetails =
        Boolean(
          match.campeon
        );


      if (!hasDetails) {

        row.innerHTML = `

          <span
            class="match-result ${escapeHTML(match.resultado)}"
          >
            ${resultLabel}
          </span>


          <div class="detailed-match-main">

            <strong>
              Partida anterior
            </strong>

            <small>
              Sin estadísticas detalladas.
            </small>

          </div>


          <div class="detailed-match-right">

            <span class="match-earned">
              +${Number(match.puntos || 0)} pts
            </span>

            <span class="match-date">
              ${formatDate(match.creado)}
            </span>

          </div>

        `;


        recentMatches.appendChild(
          row
        );


        return;
      }



      const extraStats =
        buildExtraStats(
          match
        );


      row.innerHTML = `

        <span
          class="match-result ${escapeHTML(match.resultado)}"
        >
          ${resultLabel}
        </span>


        <div class="detailed-match-main">

          <div class="detailed-match-title">

            <strong>
              ${escapeHTML(match.campeon)}
            </strong>

            <span>
              ${formatRole(match.rolJugado)}
            </span>

          </div>


          <div class="detailed-match-stats">

            ${Number(match.kills || 0)}
            /
            ${Number(match.deaths || 0)}
            /
            ${Number(match.assists || 0)}

            ·

            ${extraStats}

            ·

            ${Number(match.duracion || 0)} min

          </div>


          ${
            match.nota

              ? `

                <div class="detailed-match-note">
                  “${escapeHTML(match.nota)}”
                </div>

              `

              : ""
          }

        </div>


        <div class="detailed-match-right">

          <span class="match-earned">
            +${Number(match.puntos || 0)} pts
          </span>

          <span class="match-date">
            ${formatDate(match.creado)}
          </span>

        </div>

      `;


      recentMatches.appendChild(
        row
      );

    }
  );

}



/* =====================================================
   EXTRA STATS
===================================================== */

function buildExtraStats(match) {

  const values = [];


  if (
    match.cs !== null &&
    match.cs !== undefined
  ) {

    values.push(
      `${match.cs} CS`
    );

  }


  if (
    match.vision !== null &&
    match.vision !== undefined
  ) {

    values.push(
      `${match.vision} visión`
    );

  }


  return (
    values.length
      ? values.join(" · ")
      : "Sin datos extra"
  );

}



/* =====================================================
   RANKING
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


        if (
          !isPlayerRole(role)
        ) {

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

          symbol:
            data.simbolo ||
            "✦",

          color:
            data.accentColor ||
            "#ef476a",

          points:
            Number(
              data.puntos || 0
            ),

          wins:
            Number(
              data.victorias || 0
            ),

          losses:
            Number(
              data.derrotas || 0
            )

        });

      }
    );



    players.sort(
      (a,b) => {

        if (
          b.points !== a.points
        ) {

          return (
            b.points -
            a.points
          );

        }


        if (
          b.wins !== a.wins
        ) {

          return (
            b.wins -
            a.wins
          );

        }


        return (
          a.nickname.localeCompare(
            b.nickname,
            "es",
            {
              sensitivity:
                "base"
            }
          )
        );

      }
    );


    renderRanking(
      players
    );

  },

  error => {

    console.error(
      "Error cargando ranking:",
      error
    );


    rankingList.innerHTML = `

      <div class="points-empty">

        <span>✧</span>

        <p>
          No pudimos cargar el ranking.
        </p>

      </div>

    `;

  }

);



/* =====================================================
   RENDER RANKING
===================================================== */

function renderRanking(players) {

  rankingList.innerHTML =
    "";


  if (
    players.length === 0
  ) {

    rankingList.innerHTML = `

      <div class="points-empty">

        <span>☾</span>

        <p>
          El ranking todavía está vacío.
        </p>

      </div>

    `;

    return;
  }


  players.forEach(
    (
      player,
      index
    ) => {

      const row =
        document.createElement(
          "div"
        );


      const current =
        currentUser &&
        player.id === currentUser.uid;


      let podiumClass = "";


      if (index === 0) {

        podiumClass =
          "rank-first";

      } else if (
        index === 1
      ) {

        podiumClass =
          "rank-second";

      } else if (
        index === 2
      ) {

        podiumClass =
          "rank-third";

      }


      row.className = `
        ranking-row
        ${podiumClass}
        ${current ? "current-user" : ""}
      `;


      row.style.setProperty(
        "--player-color",
        player.color
      );


      row.innerHTML = `

        <div class="ranking-position">

          ${String(index + 1).padStart(2,"0")}

        </div>


        <div class="ranking-player">

          <div class="ranking-player-top">

            <span class="ranking-symbol-player">
              ${escapeHTML(player.symbol)}
            </span>


            <strong>
              ${escapeHTML(player.nickname)}
            </strong>


            ${
              current

                ? `
                  <span class="ranking-you">
                    VOS
                  </span>
                `

                : ""
            }

          </div>


          <small>

            ${formatRole(player.role)}

            ·

            ${player.wins}V

            ${player.losses}D

          </small>

        </div>


        <div class="ranking-score">

          <strong>
            ${player.points}
          </strong>

          <span>
            PUNTOS
          </span>

        </div>

      `;


      rankingList.appendChild(
        row
      );

    }
  );

}



/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

  if (
    !matchDetailsForm
  ) {

    return;
  }


  matchDetailsForm.reset();


  killsInput.value =
    0;


  deathsInput.value =
    0;


  assistsInput.value =
    0;


  noteCounter.textContent =
    "0 / 160";


  if (
    currentProfile
  ) {

    const role =
      normalizeRole(
        currentProfile.rol
      );


    if (
      isPlayerRole(role)
    ) {

      playedRoleInput.value =
        role;

    }

  }


  updateRoleFields();

}



/* =====================================================
   BUTTON STATE
===================================================== */

function setRegisterDisabled(disabled) {

  winButton.disabled =
    disabled;


  lossButton.disabled =
    disabled;


  saveMatchButton.disabled =
    disabled;

}



/* =====================================================
   RESULT MESSAGE
===================================================== */

function showResultMessage(result) {

  const messages =
    result === "victoria"
      ? victoryMessages
      : defeatMessages;


  const message =
    messages[
      Math.floor(
        Math.random() *
        messages.length
      )
    ];


  showPopup(
    message,
    result
  );

}



/* =====================================================
   ERROR MESSAGE
===================================================== */

function showErrorMessage(
  message =
    "No pudimos registrar la partida. ✧"
) {

  showPopup(
    message,
    "derrota"
  );

}



/* =====================================================
   POPUP
===================================================== */

function showPopup(
  message,
  type
) {

  resultPopup.textContent =
    message;


  resultPopup.className =
    `result-popup visible ${type}`;


  window.clearTimeout(
    showPopup.timeout
  );


  showPopup.timeout =
    window.setTimeout(
      () => {

        resultPopup.className =
          "result-popup";

      },
      2800
    );

}



/* =====================================================
   CONFETTI
===================================================== */

function launchConfetti() {

  if (
    typeof confetti ===
    "undefined"
  ) {

    return;
  }


  confetti({

    particleCount:
      100,

    spread:
      85,

    origin: {
      y:
        .62
    }

  });

}



/* =====================================================
   SHAKE
===================================================== */

function shakePage() {

  const container =
    document.querySelector(
      ".points-container"
    );


  if (!container) {
    return;
  }


  container.classList.add(
    "points-shake"
  );


  setTimeout(
    () => {

      container.classList.remove(
        "points-shake"
      );

    },
    500
  );

}



/* =====================================================
   CLEAN LISTENERS
===================================================== */

function cleanUserListeners() {

  if (
    stopProfileListener
  ) {

    stopProfileListener();

    stopProfileListener =
      null;

  }


  if (
    stopMatchesListener
  ) {

    stopMatchesListener();

    stopMatchesListener =
      null;

  }

}



/* =====================================================
   HELPERS
===================================================== */

function normalizeRole(role) {

  return String(
    role || ""
  )
    .trim()
    .toLowerCase();

}



function formatRole(role) {

  const roles = {

    top:
      "TOP",

    jungle:
      "JUNGLE",

    mid:
      "MID",

    adc:
      "ADC",

    support:
      "SUPPORT"

  };


  return (
    roles[role] ||
    String(role)
      .toUpperCase()
  );

}



function isPlayerRole(role) {

  return [
    "top",
    "jungle",
    "mid",
    "adc",
    "support"
  ].includes(role);

}



function numberValue(value) {

  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return 0;
  }


  return Math.max(
    0,
    Math.floor(number)
  );

}



function optionalNumber(value) {

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {

    return null;
  }


  return numberValue(
    value
  );

}



function formatDate(timestamp) {

  if (
    !timestamp ||
    !timestamp.toDate
  ) {

    return "Ahora";
  }


  return timestamp
    .toDate()
    .toLocaleString(
      "es-UY",
      {

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit"

      }
    );

}



function escapeHTML(value) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ?? ""
    );


  return element.innerHTML;

}
