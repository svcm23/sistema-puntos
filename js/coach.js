/* =====================================================
   CRIMSON VEIL
   COACH DASHBOARD
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
  getDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";



/* =====================================================
   ELEMENTS
===================================================== */

const coachLoading =
  document.getElementById(
    "coachLoading"
  );


const coachDenied =
  document.getElementById(
    "coachDenied"
  );


const coachDashboard =
  document.getElementById(
    "coachDashboard"
  );



/* TEAM SUMMARY */

const teamMatches =
  document.getElementById(
    "teamMatches"
  );


const teamWinrate =
  document.getElementById(
    "teamWinrate"
  );


const teamKda =
  document.getElementById(
    "teamKda"
  );


const teamPlayers =
  document.getElementById(
    "teamPlayers"
  );



/* PLAYERS */

const playerFilter =
  document.getElementById(
    "playerFilter"
  );


const coachPlayers =
  document.getElementById(
    "coachPlayers"
  );



/* PLAYER DETAIL */

const playerDetailSection =
  document.getElementById(
    "playerDetailSection"
  );


const detailNickname =
  document.getElementById(
    "detailNickname"
  );


const detailRole =
  document.getElementById(
    "detailRole"
  );


const detailSymbol =
  document.getElementById(
    "detailSymbol"
  );


const detailMatches =
  document.getElementById(
    "detailMatches"
  );


const detailWins =
  document.getElementById(
    "detailWins"
  );


const detailLosses =
  document.getElementById(
    "detailLosses"
  );


const detailWinrate =
  document.getElementById(
    "detailWinrate"
  );


const detailKda =
  document.getElementById(
    "detailKda"
  );


const championStats =
  document.getElementById(
    "championStats"
  );


const coachMatchHistory =
  document.getElementById(
    "coachMatchHistory"
  );



/* TEAM ACTIVITY */

const teamActivitySection =
  document.getElementById(
    "teamActivitySection"
  );


const teamMatchHistory =
  document.getElementById(
    "teamMatchHistory"
  );



/* =====================================================
   STATE
===================================================== */

let currentCoach =
  null;


let players =
  [];


let allMatches =
  [];


let selectedPlayerId =
  null;



/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(

  auth,

  async user => {

    if (!user) {

      denyAccess();

      return;

    }


    try {

      const profileReference =
        doc(
          db,
          "usuarios",
          user.uid
        );


      const profileSnapshot =
        await getDoc(
          profileReference
        );


      if (
        !profileSnapshot.exists()
      ) {

        denyAccess();

        return;

      }


      const profile =
        profileSnapshot.data();


      /*
        Solo alguien marcado explícitamente
        como coach puede entrar.
      */

      if (
        profile.tipoUsuario !==
        "coach"
      ) {

        denyAccess();

        return;

      }


      currentCoach = {

        id:
          user.uid,

        ...profile

      };


      await loadDashboard();


    } catch(error) {

      console.error(
        "Error verificando acceso de coach:",
        error
      );


      denyAccess();

    }

  }

);



/* =====================================================
   ACCESS STATES
===================================================== */

function denyAccess() {

  coachLoading?.classList.add(
    "hidden"
  );


  coachDashboard?.classList.add(
    "hidden"
  );


  coachDenied?.classList.remove(
    "hidden"
  );

}



function showDashboard() {

  coachLoading?.classList.add(
    "hidden"
  );


  coachDenied?.classList.add(
    "hidden"
  );


  coachDashboard?.classList.remove(
    "hidden"
  );

}



/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard() {

  try {

    await loadPlayers();


    await loadAllMatches();


    calculatePlayerStats();


    renderTeamSummary();


    renderPlayerFilter();


    renderPlayerCards();


    renderTeamActivity();


    showDashboard();


  } catch(error) {

    console.error(
      "Error cargando dashboard:",
      error
    );


    if (
      coachLoading
    ) {

      coachLoading.innerHTML = `

        <span class="coach-state-symbol">
          ✧
        </span>

        <p>
          No pudimos cargar las estadísticas.
        </p>

      `;

    }

  }

}



/* =====================================================
   LOAD PLAYERS
===================================================== */

async function loadPlayers() {

  const usersSnapshot =
    await getDocs(
      collection(
        db,
        "usuarios"
      )
    );


  players =
    [];


  usersSnapshot.forEach(

    documentSnapshot => {

      const data =
        documentSnapshot.data();


      const role =
        normalizeRole(
          data.rol
        );


      /*
        Solo roles reales de jugadora.
      */

      if (
        !isPlayerRole(role)
      ) {

        return;

      }


      /*
        Seguridad extra:
        si alguien tuviera rol de juego
        pero tipoUsuario coach,
        tampoco lo mostramos.
      */

      if (
        data.tipoUsuario ===
        "coach"
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

        matches:
          [],

        totalMatches:
          0,

        wins:
          0,

        losses:
          0,

        winrate:
          0,

        kda:
          0

      });

    }

  );


  players.sort(

    (a,b) => {

      const roleDifference =
        roleOrder(a.role) -
        roleOrder(b.role);


      if (
        roleDifference !==
        0
      ) {

        return roleDifference;

      }


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
   LOAD ALL MATCHES
===================================================== */

async function loadAllMatches() {

  allMatches =
    [];


  await Promise.all(

    players.map(

      async player => {

        try {

          const matchesQuery =
            query(

              collection(
                db,
                "usuarios",
                player.id,
                "partidas"
              ),

              orderBy(
                "creado",
                "desc"
              )

            );


          const matchesSnapshot =
            await getDocs(
              matchesQuery
            );


          const matches =
            [];


          matchesSnapshot.forEach(

            documentSnapshot => {

              const data =
                documentSnapshot.data();


              const match = {

                id:
                  documentSnapshot.id,

                playerId:
                  player.id,

                playerNickname:
                  player.nickname,

                playerRole:
                  player.role,

                ...data

              };


              matches.push(
                match
              );


              allMatches.push(
                match
              );

            }

          );


          player.matches =
            matches;


        } catch(error) {

          console.error(
            `Error cargando partidas de ${player.nickname}:`,
            error
          );


          player.matches =
            [];

        }

      }

    )

  );


  allMatches.sort(

    (a,b) =>

      timestampToMillis(
        b.creado
      ) -

      timestampToMillis(
        a.creado
      )

  );

}



/* =====================================================
   CALCULATE PLAYER STATS
===================================================== */

function calculatePlayerStats() {

  players.forEach(

    player => {

      const total =
        player.matches.length;


      const wins =
        player.matches.filter(

          match =>
            match.resultado ===
            "victoria"

        ).length;


      const losses =
        player.matches.filter(

          match =>
            match.resultado ===
            "derrota"

        ).length;


      const detailedMatches =
        player.matches.filter(

          match =>
            Boolean(
              match.campeon
            )

        );


      player.totalMatches =
        total;


      player.wins =
        wins;


      player.losses =
        losses;


      player.winrate =
        total > 0

          ? (
              wins /
              total
            ) * 100

          : 0;


      player.kda =
        calculateAverageKda(
          detailedMatches
        );

    }

  );

}



/* =====================================================
   TEAM SUMMARY
===================================================== */

function renderTeamSummary() {

  const totalMatches =
    players.reduce(

      (
        total,
        player
      ) =>

        total +
        player.totalMatches,

      0

    );


  const totalWins =
    players.reduce(

      (
        total,
        player
      ) =>

        total +
        player.wins,

      0

    );


  const detailedMatches =
    allMatches.filter(

      match =>
        Boolean(
          match.campeon
        )

    );


  const winrate =
    totalMatches > 0

      ? (
          totalWins /
          totalMatches
        ) * 100

      : 0;


  const averageKda =
    calculateAverageKda(
      detailedMatches
    );


  teamMatches.textContent =
    totalMatches;


  teamWinrate.textContent =
    `${formatPercentage(winrate)}%`;


  teamKda.textContent =
    averageKda.toFixed(2);


  teamPlayers.textContent =
    players.length;

}



/* =====================================================
   PLAYER FILTER
===================================================== */

function renderPlayerFilter() {

  playerFilter.innerHTML = `

    <option value="all">
      Todo el equipo
    </option>

  `;


  players.forEach(

    player => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        player.id;


      option.textContent =
        `${player.nickname} · ${formatRole(player.role)}`;


      playerFilter.appendChild(
        option
      );

    }

  );

}



/* =====================================================
   FILTER CHANGE
===================================================== */

playerFilter?.addEventListener(

  "change",

  () => {

    const value =
      playerFilter.value;


    if (
      value ===
      "all"
    ) {

      selectedPlayerId =
        null;


      clearActiveCards();


      playerDetailSection?.classList.add(
        "hidden"
      );


      teamActivitySection?.classList.remove(
        "hidden"
      );


      return;

    }


    selectPlayer(
      value
    );

  }

);



/* =====================================================
   PLAYER CARDS
===================================================== */

function renderPlayerCards() {

  coachPlayers.innerHTML =
    "";


  if (
    players.length ===
    0
  ) {

    coachPlayers.innerHTML = `

      <div class="coach-empty">

        <span>
          ☾
        </span>

        <p>
          Todavía no hay jugadoras disponibles.
        </p>

      </div>

    `;


    return;

  }


  players.forEach(

    player => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "coach-player-card";


      card.dataset.playerId =
        player.id;


      card.style.setProperty(
        "--player-color",
        safeColor(
          player.color
        )
      );


      card.innerHTML = `

        <div class="coach-player-top">

          <div class="coach-player-name">

            <strong>
              ${escapeHTML(player.nickname)}
            </strong>

            <small>
              ${formatRole(player.role)}
            </small>

          </div>


          <span
            class="coach-player-symbol"
            style="color:${safeColor(player.color)}"
          >
            ${escapeHTML(player.symbol)}
          </span>

        </div>


        <div class="coach-player-stats">

          <div class="coach-player-stat">

            <span>
              PARTIDAS
            </span>

            <strong>
              ${player.totalMatches}
            </strong>

          </div>


          <div class="coach-player-stat">

            <span>
              WINRATE
            </span>

            <strong>
              ${formatPercentage(player.winrate)}%
            </strong>

          </div>


          <div class="coach-player-stat">

            <span>
              KDA
            </span>

            <strong>
              ${player.kda.toFixed(2)}
            </strong>

          </div>

        </div>

      `;


      card.addEventListener(

        "click",

        () => {

          playerFilter.value =
            player.id;


          selectPlayer(
            player.id
          );

        }

      );


      coachPlayers.appendChild(
        card
      );

    }

  );

}



/* =====================================================
   SELECT PLAYER
===================================================== */

function selectPlayer(playerId) {

  const player =
    players.find(

      item =>
        item.id ===
        playerId

    );


  if (!player) {

    return;

  }


  selectedPlayerId =
    player.id;


  clearActiveCards();


  const cards =
    document.querySelectorAll(
      ".coach-player-card"
    );


  cards.forEach(

    card => {

      if (
        card.dataset.playerId ===
        player.id
      ) {

        card.classList.add(
          "active"
        );

      }

    }

  );


  renderPlayerDetail(
    player
  );


  teamActivitySection?.classList.add(
    "hidden"
  );


  playerDetailSection?.classList.remove(
    "hidden"
  );


  setTimeout(

    () => {

      playerDetailSection?.scrollIntoView({

        behavior:
          "smooth",

        block:
          "start"

      });

    },

    60

  );

}



/* =====================================================
   CLEAR ACTIVE CARDS
===================================================== */

function clearActiveCards() {

  document
    .querySelectorAll(
      ".coach-player-card"
    )
    .forEach(

      card => {

        card.classList.remove(
          "active"
        );

      }

    );

}



/* =====================================================
   PLAYER DETAIL
===================================================== */

function renderPlayerDetail(player) {

  detailNickname.textContent =
    player.nickname;


  detailRole.textContent =
    formatRole(
      player.role
    );


  detailSymbol.textContent =
    player.symbol;


  detailSymbol.style.color =
    safeColor(
      player.color
    );


  detailMatches.textContent =
    player.totalMatches;


  detailWins.textContent =
    player.wins;


  detailLosses.textContent =
    player.losses;


  detailWinrate.textContent =
    `${formatPercentage(player.winrate)}%`;


  detailKda.textContent =
    player.kda.toFixed(2);


  renderChampionStats(
    player
  );


  renderPlayerMatches(
    player
  );

}



/* =====================================================
   CHAMPION PERFORMANCE
===================================================== */

function renderChampionStats(player) {

  championStats.innerHTML =
    "";


  const matches =
    player.matches.filter(

      match =>
        Boolean(
          match.campeon
        )

    );


  if (
    matches.length ===
    0
  ) {

    championStats.innerHTML = `

      <div class="coach-empty">

        <span>
          ✧
        </span>

        <p>
          Todavía no hay partidas detalladas
          para esta jugadora.
        </p>

      </div>

    `;


    return;

  }


  const champions =
    {};


  matches.forEach(

    match => {

      const championName =
        String(
          match.campeon
        ).trim();


      const key =
        championName.toLowerCase();


      if (
        !champions[key]
      ) {

        champions[key] = {

          name:
            championName,

          matches:
            0,

          wins:
            0,

          losses:
            0,

          kills:
            0,

          deaths:
            0,

          assists:
            0

        };

      }


      const champion =
        champions[key];


      champion.matches++;


      if (
        match.resultado ===
        "victoria"
      ) {

        champion.wins++;

      } else if (
        match.resultado ===
        "derrota"
      ) {

        champion.losses++;

      }


      champion.kills +=
        safeNumber(
          match.kills
        );


      champion.deaths +=
        safeNumber(
          match.deaths
        );


      champion.assists +=
        safeNumber(
          match.assists
        );

    }

  );


  const championArray =
    Object.values(
      champions
    );


  championArray.sort(

    (a,b) => {

      if (
        b.matches !==
        a.matches
      ) {

        return (
          b.matches -
          a.matches
        );

      }


      return (
        b.wins -
        a.wins
      );

    }

  );


  championArray.forEach(

    champion => {

      const winrate =
        champion.matches > 0

          ? (
              champion.wins /
              champion.matches
            ) * 100

          : 0;


      const kda =
        calculateKda(

          champion.kills,

          champion.deaths,

          champion.assists

        );


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "champion-stat-row";


      row.innerHTML = `

        <span class="champion-stat-name">
          ${escapeHTML(champion.name)}
        </span>


        <span>

          ${champion.matches}

          ${
            champion.matches === 1
              ? "partida"
              : "partidas"
          }

        </span>


        <span>
          ${champion.wins}V · ${champion.losses}D
        </span>


        <strong>
          ${formatPercentage(winrate)}% WR
        </strong>

      `;


      row.title =
        `KDA promedio: ${kda.toFixed(2)}`;


      championStats.appendChild(
        row
      );

    }

  );

}



/* =====================================================
   PLAYER MATCH HISTORY
===================================================== */

function renderPlayerMatches(player) {

  coachMatchHistory.innerHTML =
    "";


  if (
    player.matches.length ===
    0
  ) {

    coachMatchHistory.innerHTML = `

      <div class="coach-empty">

        <span>
          ☾
        </span>

        <p>
          Esta jugadora todavía no registró partidas.
        </p>

      </div>

    `;


    return;

  }


  player.matches
    .slice(
      0,
      15
    )
    .forEach(

      match => {

        coachMatchHistory.appendChild(

          createMatchRow(
            match,
            false
          )

        );

      }

    );

}



/* =====================================================
   TEAM ACTIVITY
===================================================== */

function renderTeamActivity() {

  teamMatchHistory.innerHTML =
    "";


  if (
    allMatches.length ===
    0
  ) {

    teamMatchHistory.innerHTML = `

      <div class="coach-empty">

        <span>
          ☾
        </span>

        <p>
          El equipo todavía no registró partidas.
        </p>

      </div>

    `;


    return;

  }


  allMatches
    .slice(
      0,
      20
    )
    .forEach(

      match => {

        teamMatchHistory.appendChild(

          createMatchRow(
            match,
            true
          )

        );

      }

    );

}



/* =====================================================
   CREATE MATCH ROW
===================================================== */

function createMatchRow(
  match,
  showPlayer
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "coach-match-row";


  const result =
    match.resultado ===
      "victoria"

      ? "VICTORIA"
      : "DERROTA";


  const resultClass =
    match.resultado ===
      "victoria"

      ? "victoria"
      : "derrota";


  const champion =
    match.campeon ||
    "Partida anterior";


  const role =
    formatRole(
      normalizeRole(
        match.rolJugado ||
        match.playerRole
      )
    );


  const primaryText =
    showPlayer
      ? match.playerNickname
      : champion;


  const secondaryText =
    showPlayer
      ? `${champion} · ${role}`
      : role;


  const hasDetails =
    Boolean(
      match.campeon
    );


  const kdaText =
    hasDetails

      ? `${safeNumber(match.kills)} / ${safeNumber(match.deaths)} / ${safeNumber(match.assists)}`

      : "—";


  const eloText =
    match.elo
      ? escapeHTML(match.elo)
      : "—";


  wrapper.innerHTML = `

    <span
      class="coach-match-result ${resultClass}"
    >
      ${result}
    </span>


    <div class="coach-match-player">

      <strong>
        ${escapeHTML(primaryText)}
      </strong>

      <small>
        ${escapeHTML(secondaryText)}
      </small>

    </div>


    <div class="coach-match-kda">
      ${kdaText}
    </div>


    <div class="coach-match-elo">
      ${eloText}
    </div>


    ${
      match.nota

        ? `

          <div class="coach-match-note">
            “${escapeHTML(match.nota)}”
          </div>

        `

        : ""
    }

  `;


  return wrapper;

}



/* =====================================================
   KDA CALCULATIONS
===================================================== */

function calculateAverageKda(matches) {

  if (
    matches.length ===
    0
  ) {

    return 0;

  }


  const totalKills =
    matches.reduce(

      (
        total,
        match
      ) =>

        total +
        safeNumber(
          match.kills
        ),

      0

    );


  const totalDeaths =
    matches.reduce(

      (
        total,
        match
      ) =>

        total +
        safeNumber(
          match.deaths
        ),

      0

    );


  const totalAssists =
    matches.reduce(

      (
        total,
        match
      ) =>

        total +
        safeNumber(
          match.assists
        ),

      0

    );


  return calculateKda(

    totalKills,

    totalDeaths,

    totalAssists

  );

}



function calculateKda(
  kills,
  deaths,
  assists
) {

  /*
    Si no murió ninguna vez, usamos 1
    solo para no dividir entre cero.
  */

  const divisor =
    deaths > 0
      ? deaths
      : 1;


  return (
    kills +
    assists
  ) /
  divisor;

}



/* =====================================================
   HELPERS
===================================================== */

function normalizeRole(role) {

  return String(
    role ||
    ""
  )
    .trim()
    .toLowerCase();

}



function isPlayerRole(role) {

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
    String(
      role ||
      ""
    ).toUpperCase()
  );

}



function roleOrder(role) {

  const order = {

    top:
      1,

    jungle:
      2,

    mid:
      3,

    adc:
      4,

    support:
      5

  };


  return (
    order[role] ||
    99
  );

}



function safeNumber(value) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(number)
  ) {

    return 0;

  }


  return number;

}



function formatPercentage(value) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(number)
  ) {

    return "0";

  }


  return number.toFixed(
    0
  );

}



function timestampToMillis(timestamp) {

  if (
    !timestamp
  ) {

    return 0;

  }


  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  if (
    timestamp.seconds
  ) {

    return (
      timestamp.seconds *
      1000
    );

  }


  return 0;

}



function safeColor(color) {

  const value =
    String(
      color ||
      ""
    ).trim();


  if (
    /^#[0-9a-fA-F]{6}$/.test(
      value
    )
  ) {

    return value;

  }


  return "#ef476a";

}



function escapeHTML(value) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ??
      ""
    );


  return element.innerHTML;

}
