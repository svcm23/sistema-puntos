/* =====================================================
   CRIMSON VEIL
   POINTS SYSTEM
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
  document.getElementById(
    "playerArea"
  );


const pointsNickname =
  document.getElementById(
    "pointsNickname"
  );


const pointsRole =
  document.getElementById(
    "pointsRole"
  );


const pointsTotal =
  document.getElementById(
    "pointsTotal"
  );


const winsTotal =
  document.getElementById(
    "winsTotal"
  );


const lossesTotal =
  document.getElementById(
    "lossesTotal"
  );


const matchesTotal =
  document.getElementById(
    "matchesTotal"
  );


const starDisplay =
  document.getElementById(
    "starDisplay"
  );


const winButton =
  document.getElementById(
    "winButton"
  );


const lossButton =
  document.getElementById(
    "lossButton"
  );


const recentMatches =
  document.getElementById(
    "recentMatches"
  );


const rankingList =
  document.getElementById(
    "rankingList"
  );


const resultPopup =
  document.getElementById(
    "resultPopup"
  );



/* =====================================================
   STATE
===================================================== */

let currentUser =
  null;


let currentProfile =
  null;


let stopProfileListener =
  null;


let stopMatchesListener =
  null;



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

    currentUser =
      user;


    /*
      Si cambia la sesión,
      cerramos listeners anteriores.
    */

    cleanUserListeners();


    /* ==========================================
       NO LOGUEADA
    ========================================== */

    if (!user) {

      currentProfile =
        null;


      playerArea.classList.add(
        "hidden"
      );


      /*
        IMPORTANTE:

        No hacemos return sobre el ranking.

        El ranking tiene su propio listener
        global más abajo y sigue funcionando.
      */

      return;

    }



    /* ==========================================
       LOGUEADA
    ========================================== */

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
   CURRENT PROFILE
===================================================== */

function listenCurrentProfile(
  uid
) {

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

        if (
          !snapshot.exists()
        ) {

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
   RENDER CURRENT PLAYER
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
      currentProfile.puntos ||
      0
    );


  const wins =
    Number(
      currentProfile.victorias ||
      0
    );


  const losses =
    Number(
      currentProfile.derrotas ||
      0
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
    formatRole(
      role
    );


  pointsTotal.textContent =
    points;


  winsTotal.textContent =
    wins;


  lossesTotal.textContent =
    losses;


  matchesTotal.textContent =
    matches;


  renderStars(
    points
  );

}



/* =====================================================
   STARS
===================================================== */

function renderStars(
  points
) {

  const maximumVisible =
    10;


  let starCount =
    points %
    maximumVisible;


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


  if (
    starCount === 0
  ) {

    starDisplay.innerHTML = `

      <span class="no-stars">

        Tu primera estrella
        está esperando. ✦

      </span>

    `;


    return;

  }


  starDisplay.innerHTML =
    Array(
      starCount
    )
      .fill(
        `<span class="progress-star">★</span>`
      )
      .join("");

}



/* =====================================================
   REGISTER MATCH BUTTONS
===================================================== */

winButton.addEventListener(

  "click",

  () => {

    registerMatch(
      "victoria"
    );

  }

);


lossButton.addEventListener(

  "click",

  () => {

    registerMatch(
      "derrota"
    );

  }

);



/* =====================================================
   REGISTER MATCH
===================================================== */

async function registerMatch(
  result
) {

  if (
    !currentUser ||
    !currentProfile
  ) {

    return;

  }


  const pointsEarned =
    result === "victoria"
      ? 3
      : 1;


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


        if (
          !profileSnapshot.exists()
        ) {

          throw new Error(
            "Perfil inexistente."
          );

        }


        const profileData =
          profileSnapshot.data();


        const previousPoints =
          Number(
            profileData.puntos ||
            0
          );


        const previousWins =
          Number(
            profileData.victorias ||
            0
          );


        const previousLosses =
          Number(
            profileData.derrotas ||
            0
          );


        const previousMatches =
          Number(
            profileData.partidas ||
            0
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
          previousMatches +
          1;



        /* ==========================================
           UPDATE PROFILE
        ========================================== */

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



        /* ==========================================
           MATCH HISTORY
        ========================================== */

        transaction.set(

          matchReference,

          {

            usuarioId:
              currentUser.uid,

            resultado:
              result,

            puntos:
              pointsEarned,

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
      result ===
      "victoria"
    ) {

      launchConfetti();

    } else {

      shakePage();

    }

  } catch(error) {

    console.error(
      "Error registrando partida:",
      error
    );


    showErrorMessage();

  } finally {

    setRegisterDisabled(
      false
    );

  }

}



/* =====================================================
   RECENT MATCHES
===================================================== */

function listenRecentMatches(
  uid
) {

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

      limit(
        5
      )

    );


  stopMatchesListener =
    onSnapshot(

      matchesQuery,

      snapshot => {

        const matches =
          [];


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

            <span>
              ✧
            </span>

            <p>
              No pudimos cargar tus partidas.
            </p>

          </div>

        `;

      }

    );

}



/* =====================================================
   RENDER RECENT MATCHES
===================================================== */

function renderRecentMatches(
  matches
) {

  recentMatches.innerHTML =
    "";


  if (
    matches.length === 0
  ) {

    recentMatches.innerHTML = `

      <div class="points-empty">

        <span>
          ☾
        </span>

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
        "recent-match";


      const result =
        match.resultado ===
          "victoria"

          ? "VICTORIA"
          : "DERROTA";


      row.innerHTML = `

        <span
          class="match-result ${escapeHTML(match.resultado)}"
        >
          ${result}
        </span>


        <span class="match-date">

          ${formatDate(match.creado)}

        </span>


        <span class="match-earned">

          +${Number(match.puntos || 0)}
          pts

        </span>

      `;


      recentMatches.appendChild(
        row
      );

    }

  );

}



/* =====================================================
   GLOBAL RANKING
===================================================== */

const usersReference =
  collection(
    db,
    "usuarios"
  );


onSnapshot(

  usersReference,

  snapshot => {

    const players =
      [];


    snapshot.forEach(

      documentSnapshot => {

        const data =
          documentSnapshot.data();


        const role =
          normalizeRole(
            data.rol
          );


        if (
          !isPlayerRole(
            role
          )
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
              data.puntos ||
              0
            ),

          wins:
            Number(
              data.victorias ||
              0
            ),

          losses:
            Number(
              data.derrotas ||
              0
            )

        });

      }

    );



    /* ==========================================
       SORT
    ========================================== */

    players.sort(

      (
        a,
        b
      ) => {


        /* MÁS PUNTOS */

        if (
          b.points !==
          a.points
        ) {

          return (
            b.points -
            a.points
          );

        }


        /* MÁS VICTORIAS */

        if (
          b.wins !==
          a.wins
        ) {

          return (
            b.wins -
            a.wins
          );

        }


        /* NICKNAME */

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

        <span>
          ✧
        </span>

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

function renderRanking(
  players
) {

  rankingList.innerHTML =
    "";


  if (
    players.length === 0
  ) {

    rankingList.innerHTML = `

      <div class="points-empty">

        <span>
          ☾
        </span>

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


      const leader =
        index === 0;


      const current =
        currentUser &&
        player.id ===
          currentUser.uid;


      row.className =
        `
          ranking-row
          ${leader ? "leader" : ""}
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

              ${leader ? " ♛" : ""}

            </strong>

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
   RESULT MESSAGE
===================================================== */

function showResultMessage(
  result
) {

  const messages =
    result ===
      "victoria"

      ? victoryMessages
      : defeatMessages;


  const message =
    messages[
      Math.floor(
        Math.random() *
        messages.length
      )
    ];


  resultPopup.textContent =
    message;


  resultPopup.className =
    `result-popup visible ${result}`;


  setTimeout(
    () => {

      resultPopup.className =
        "result-popup";

    },
    2800
  );

}



/* =====================================================
   ERROR MESSAGE
===================================================== */

function showErrorMessage() {

  resultPopup.textContent =
    "No pudimos registrar la partida. ✧";


  resultPopup.className =
    "result-popup visible derrota";


  setTimeout(
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
   REGISTER BUTTON STATE
===================================================== */

function setRegisterDisabled(
  disabled
) {

  winButton.disabled =
    disabled;


  lossButton.disabled =
    disabled;

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
   NORMALIZE ROLE
===================================================== */

function normalizeRole(
  role
) {

  return String(
    role ||
    ""
  )
    .trim()
    .toLowerCase();

}



/* =====================================================
   FORMAT ROLE
===================================================== */

function formatRole(
  role
) {

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



/* =====================================================
   PLAYER ROLE
===================================================== */

function isPlayerRole(
  role
) {

  return [
    "top",
    "jungle",
    "mid",
    "adc",
    "support"
  ].includes(
    role
  );

}



/* =====================================================
   DATE
===================================================== */

function formatDate(
  timestamp
) {

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



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
  value
) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ??
      ""
    );


  return (
    element.innerHTML
  );

}
