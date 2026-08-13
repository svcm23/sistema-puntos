/* =====================================================
   CRIMSON VEIL
   PLAYER PROFILE
===================================================== */

import {
  auth,
  db
} from "./firebase.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";



/* =====================================================
   ELEMENTS
===================================================== */

const loading =
  document.getElementById(
    "profileLoading"
  );


const profileContent =
  document.getElementById(
    "profileContent"
  );


const form =
  document.getElementById(
    "profileForm"
  );


const nicknameInput =
  document.getElementById(
    "nickname"
  );


const roleInput =
  document.getElementById(
    "role"
  );


const quoteInput =
  document.getElementById(
    "quote"
  );


const quoteCounter =
  document.getElementById(
    "quoteCounter"
  );


const profileCard =
  document.getElementById(
    "profileCard"
  );


const previewNickname =
  document.getElementById(
    "previewNickname"
  );


const previewRole =
  document.getElementById(
    "previewRole"
  );


const previewBottomRole =
  document.getElementById(
    "previewBottomRole"
  );


const previewRoleIcon =
  document.getElementById(
    "previewRoleIcon"
  );


const previewSymbol =
  document.getElementById(
    "previewSymbol"
  );


const previewQuote =
  document.getElementById(
    "previewQuote"
  );


const profilePoints =
  document.getElementById(
    "profilePoints"
  );


const profileWins =
  document.getElementById(
    "profileWins"
  );


const profileLosses =
  document.getElementById(
    "profileLosses"
  );


const symbolButtons =
  document.querySelectorAll(
    ".symbol-option"
  );


const colorButtons =
  document.querySelectorAll(
    ".color-option"
  );


const discardButton =
  document.getElementById(
    "discardChanges"
  );


const saveButton =
  document.getElementById(
    "saveProfileButton"
  );


const saveMessage =
  document.getElementById(
    "saveMessage"
  );


const profileError =
  document.getElementById(
    "profileError"
  );



/* =====================================================
   STATE
===================================================== */

let currentUser = null;

let originalProfile = null;


let profile = {

  nickname:
    "",

  role:
    "player",

  quote:
    "",

  symbol:
    "✦",

  color:
    "#ef476a",

  puntos:
    0,

  victorias:
    0,

  derrotas:
    0

};



/* =====================================================
   ROLE ICONS
===================================================== */

const roleIcons = {

  top:
    "fa-solid fa-shield-halved",

  jungle:
    "fa-solid fa-compass",

  mid:
    "fa-solid fa-wand-magic-sparkles",

  adc:
    "fa-solid fa-crosshairs",

  support:
    "fa-solid fa-hand-holding-heart",

  staff:
    "fa-solid fa-headset",

  coach:
    "fa-solid fa-clipboard"

};



/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(

  auth,

  async user => {

    /* ==========================
       NOT LOGGED IN
    ========================== */

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }


    currentUser =
      user;


    await loadProfile();

  }

);



/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadProfile() {

  try {

    showLoading();


    const profileRef =
      doc(
        db,
        "usuarios",
        currentUser.uid
      );


    const profileSnap =
      await getDoc(
        profileRef
      );


    if (
      !profileSnap.exists()
    ) {

      showProfileError(
        "No encontramos tu perfil en Crimson Veil."
      );

      return;

    }


    const data =
      profileSnap.data();


    profile = {

      nickname:
        data.nickname ||
        "Player",

      role:
        data.rol ||
        "player",

      quote:
        data.frase ||
        "",

      symbol:
        data.simbolo ||
        getDefaultSymbol(
          data.rol
        ),

      color:
        data.accentColor ||
        getDefaultColor(
          data.rol
        ),

      puntos:
        Number(
          data.puntos || 0
        ),

      victorias:
        Number(
          data.victorias || 0
        ),

      derrotas:
        Number(
          data.derrotas || 0
        )

    };


    originalProfile =
      structuredClone(
        profile
      );


    syncForm();

    renderProfile();

    showProfile();

  } catch(error) {

    console.error(
      "Error cargando perfil:",
      error
    );


    showProfileError(
      "No pudimos cargar tu perfil."
    );

  }

}



/* =====================================================
   FORM
===================================================== */

function syncForm() {

  nicknameInput.value =
    profile.nickname;


  roleInput.value =
    formatRole(
      profile.role
    );


  quoteInput.value =
    profile.quote;


  symbolButtons.forEach(
    button => {

      button.classList.toggle(

        "active",

        button.dataset.symbol ===
          profile.symbol

      );

    }
  );


  colorButtons.forEach(
    button => {

      button.classList.toggle(

        "active",

        button.dataset.color ===
          profile.color

      );

    }
  );


  updateCounter();

}



/* =====================================================
   RENDER
===================================================== */

function renderProfile() {

  const nickname =
    profile.nickname.trim() ||
    "Player";


  const quote =
    profile.quote.trim() ||
    "Crimson Veil";


  const role =
    profile.role ||
    "player";


  previewNickname.textContent =
    nickname;


  previewRole.textContent =
    formatRole(
      role
    );


  previewBottomRole.textContent =
    formatRole(
      role
    );


  previewRoleIcon.className =
    roleIcons[role] ||
    "fa-solid fa-user";


  previewSymbol.textContent =
    profile.symbol;


  previewQuote.textContent =
    quote;


  profileCard.dataset.role =
    role;


  profileCard.style.setProperty(
    "--player-accent",
    profile.color
  );


  profilePoints.textContent =
    profile.puntos;


  profileWins.textContent =
    profile.victorias;


  profileLosses.textContent =
    profile.derrotas;


  updateCounter();

}



/* =====================================================
   LIVE PREVIEW
===================================================== */

nicknameInput.addEventListener(

  "input",

  () => {

    profile.nickname =
      nicknameInput.value;


    renderProfile();

  }

);


quoteInput.addEventListener(

  "input",

  () => {

    profile.quote =
      quoteInput.value;


    renderProfile();

  }

);



/* =====================================================
   SYMBOL
===================================================== */

symbolButtons.forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        profile.symbol =
          button.dataset.symbol;


        symbolButtons.forEach(
          item => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        renderProfile();

      }

    );

  }

);



/* =====================================================
   COLOR
===================================================== */

colorButtons.forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        profile.color =
          button.dataset.color;


        colorButtons.forEach(
          item => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        renderProfile();

      }

    );

  }

);



/* =====================================================
   SAVE
===================================================== */

form.addEventListener(

  "submit",

  async event => {

    event.preventDefault();


    if (!currentUser) {

      return;

    }


    const nickname =
      profile.nickname.trim();


    if (!nickname) {

      showFormError(
        "El nickname no puede quedar vacío."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      clearFormError();


      const profileRef =
        doc(
          db,
          "usuarios",
          currentUser.uid
        );


      /*
        Solamente actualizamos campos
        personalizables.

        NO tocamos:
        - rol
        - puntos
        - victorias
        - derrotas
        - email
      */

      await updateDoc(

        profileRef,

        {
          nickname:
            nickname,

          frase:
            profile.quote.trim(),

          simbolo:
            profile.symbol,

          accentColor:
            profile.color,

          actualizado:
            serverTimestamp()
        }

      );


      profile.nickname =
        nickname;


      originalProfile =
        structuredClone(
          profile
        );


      showSaved();

    } catch(error) {

      console.error(
        "Error guardando perfil:",
        error
      );


      showFormError(
        "No pudimos guardar los cambios."
      );

    } finally {

      setSaving(
        false
      );

    }

  }

);



/* =====================================================
   DISCARD CHANGES
===================================================== */

discardButton.addEventListener(

  "click",

  () => {

    if (!originalProfile) {

      return;

    }


    profile =
      structuredClone(
        originalProfile
      );


    syncForm();

    renderProfile();

    clearFormError();

  }

);



/* =====================================================
   COUNTER
===================================================== */

function updateCounter() {

  quoteCounter.textContent =
    `${quoteInput.value.length} / 70`;

}



/* =====================================================
   UI STATES
===================================================== */

function showLoading() {

  loading.style.display =
    "flex";


  profileContent.classList.add(
    "profile-content-hidden"
  );

}


function showProfile() {

  loading.style.display =
    "none";


  profileContent.classList.remove(
    "profile-content-hidden"
  );

}


function showProfileError(text) {

  loading.innerHTML = `

    <span class="loading-symbol">
      ✧
    </span>

    <p>
      ${text}
    </p>

    <a
      href="index.html"
      class="btn btn-ghost"
    >
      Volver al inicio
    </a>

  `;

}


function showSaved() {

  saveMessage.classList.add(
    "visible"
  );


  setTimeout(
    () => {

      saveMessage.classList.remove(
        "visible"
      );

    },
    2000
  );

}


function showFormError(text) {

  profileError.textContent =
    text;


  profileError.classList.add(
    "visible"
  );

}


function clearFormError() {

  profileError.textContent =
    "";


  profileError.classList.remove(
    "visible"
  );

}


function setSaving(saving) {

  saveButton.disabled =
    saving;


  discardButton.disabled =
    saving;


  saveButton.innerHTML =
    saving

      ? `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Guardando...
      `

      : `
        <i class="fa-solid fa-check"></i>
        Guardar cambios
      `;

}



/* =====================================================
   HELPERS
===================================================== */

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
      "SUPPORT",

    staff:
      "STAFF",

    coach:
      "COACH",

    player:
      "PLAYER"

  };


  return (
    roles[role] ||
    String(role).toUpperCase()
  );

}


function getDefaultSymbol(role) {

  const symbols = {

    top:
      "✦",

    jungle:
      "☾",

    mid:
      "✧",

    adc:
      "❀",

    support:
      "♡"

  };


  return (
    symbols[role] ||
    "✦"
  );

}


function getDefaultColor(role) {

  const colors = {

    top:
      "#df526f",

    jungle:
      "#c34462",

    mid:
      "#f68aa1",

    adc:
      "#ed5878",

    support:
      "#ffa0b4"

  };


  return (
    colors[role] ||
    "#ef476a"
  );

}
