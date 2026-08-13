/* =====================================================
   CRIMSON VEIL
   PROFILE VISUAL DEMO
===================================================== */

const STORAGE_KEY =
  "crimsonVeil_profile_demo";


/* =====================================================
   ELEMENTS
===================================================== */

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


const symbolButtons =
  document.querySelectorAll(
    ".symbol-option"
  );


const colorButtons =
  document.querySelectorAll(
    ".color-option"
  );


const resetButton =
  document.getElementById(
    "resetProfile"
  );


const saveMessage =
  document.getElementById(
    "saveMessage"
  );



/* =====================================================
   DEFAULT DATA
===================================================== */

const defaultProfile = {

  nickname:
    "QueenStranger",

  role:
    "mid",

  quote:
    "Beneath the veil.",

  symbol:
    "✧",

  color:
    "#f68aa1"

};


let profile = {
  ...defaultProfile
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
    "fa-solid fa-hand-holding-heart"

};



/* =====================================================
   LOAD
===================================================== */

function loadProfile() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!saved) {

    renderProfile();

    return;

  }


  try {

    profile = {
      ...defaultProfile,
      ...JSON.parse(saved)
    };

  } catch(error) {

    console.error(
      "No se pudo cargar el perfil.",
      error
    );

  }


  syncForm();

  renderProfile();

}


function syncForm() {

  nicknameInput.value =
    profile.nickname;


  roleInput.value =
    profile.role;


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
    "Beneath the veil.";


  const role =
    profile.role;


  previewNickname.textContent =
    nickname;


  previewRole.textContent =
    role.toUpperCase();


  previewBottomRole.textContent =
    role.toUpperCase();


  previewRoleIcon.className =
    roleIcons[role] ||
    roleIcons.mid;


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


  updateCounter();

}



/* =====================================================
   LIVE INPUT
===================================================== */

nicknameInput.addEventListener(
  "input",
  () => {

    profile.nickname =
      nicknameInput.value;

    renderProfile();

  }
);


roleInput.addEventListener(
  "change",
  () => {

    profile.role =
      roleInput.value;

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
          item =>
            item.classList.remove(
              "active"
            )
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
          item =>
            item.classList.remove(
              "active"
            )
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
   COUNTER
===================================================== */

function updateCounter() {

  quoteCounter.textContent =
    `${quoteInput.value.length} / 70`;

}



/* =====================================================
   SAVE
===================================================== */

form.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(profile)
    );


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
);



/* =====================================================
   RESET
===================================================== */

resetButton.addEventListener(
  "click",
  () => {

    profile = {
      ...defaultProfile
    };


    localStorage.removeItem(
      STORAGE_KEY
    );


    syncForm();

    renderProfile();

  }
);



/* =====================================================
   INIT
===================================================== */

loadProfile();
