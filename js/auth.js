// ============================================
// CRIMSON VEIL — AUTH
// ============================================

import {
  auth,
  db
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ============================================
// ELEMENTS
// ============================================

const tabs =
  document.querySelectorAll(
    ".auth-tab"
  );

const loginForm =
  document.getElementById(
    "loginForm"
  );

const registerForm =
  document.getElementById(
    "registerForm"
  );

const authMessage =
  document.getElementById(
    "authMessage"
  );

const forgotPassword =
  document.getElementById(
    "forgotPassword"
  );


// ============================================
// TABS
// ============================================

tabs.forEach(tab => {

  tab.addEventListener(
    "click",

    () => {

      const target =
        tab.dataset.tab;


      tabs.forEach(item => {

        item.classList.remove(
          "active"
        );

      });


      tab.classList.add(
        "active"
      );


      loginForm.classList.toggle(
        "active",
        target === "login"
      );


      registerForm.classList.toggle(
        "active",
        target === "register"
      );


      clearMessage();

    }
  );

});


// ============================================
// PASSWORD VISIBILITY
// ============================================

document
  .querySelectorAll(
    ".password-toggle"
  )
  .forEach(button => {

    button.addEventListener(
      "click",

      () => {

        const input =
          button
            .parentElement
            .querySelector("input");


        const icon =
          button
            .querySelector("i");


        if (
          input.type === "password"
        ) {

          input.type =
            "text";

          icon.className =
            "fa-regular fa-eye-slash";

        } else {

          input.type =
            "password";

          icon.className =
            "fa-regular fa-eye";

        }

      }
    );

  });


// ============================================
// REGISTER
// ============================================

registerForm.addEventListener(
  "submit",

  async event => {

    event.preventDefault();


    const nickname =
      document
        .getElementById(
          "registerNickname"
        )
        .value
        .trim();


    const role =
      document
        .getElementById(
          "registerRole"
        )
        .value;


    const email =
      document
        .getElementById(
          "registerEmail"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "registerPassword"
        )
        .value;


    if (
      !nickname ||
      !role ||
      !email ||
      !password
    ) {

      showError(
        "Completá todos los campos."
      );

      return;

    }


    try {

      setFormsDisabled(true);

      showLoading(
        "Creando tu cuenta..."
      );


      // ==================================
      // FIREBASE AUTH
      // ==================================

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        credential.user;


      // ==================================
      // FIRESTORE PROFILE
      // ==================================

      await setDoc(

        doc(
          db,
          "usuarios",
          user.uid
        ),

        {
          uid:
            user.uid,

          nickname:
            nickname,

          rol:
            role,

          email:
            email,

          simbolo:
            getDefaultSymbol(role),

          frase:
            "",

          accentColor:
            getDefaultColor(role),

          puntos:
            0,

          victorias:
            0,

          derrotas:
            0,

          partidas:
            0,

          creado:
            serverTimestamp()
        }

      );


      showSuccess(
        "Bienvenida al Veil ✦"
      );


      setTimeout(
        () => {

          window.location.href =
            "perfil.html";

        },

        800
      );

    } catch(error) {

      console.error(error);

      showError(
        firebaseErrorMessage(
          error.code
        )
      );

    } finally {

      setFormsDisabled(false);

    }

  }
);


// ============================================
// LOGIN
// ============================================

loginForm.addEventListener(
  "submit",

  async event => {

    event.preventDefault();


    const email =
      document
        .getElementById(
          "loginEmail"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "loginPassword"
        )
        .value;


    if (
      !email ||
      !password
    ) {

      showError(
        "Ingresá tu email y contraseña."
      );

      return;

    }


    try {

      setFormsDisabled(true);

      showLoading(
        "Ingresando..."
      );


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      showSuccess(
        "Bienvenida nuevamente ✦"
      );


      setTimeout(
        () => {

          window.location.href =
            "index.html";

        },

        650
      );

    } catch(error) {

      console.error(error);


      showError(
        firebaseErrorMessage(
          error.code
        )
      );

    } finally {

      setFormsDisabled(false);

    }

  }
);


// ============================================
// PASSWORD RESET
// ============================================

forgotPassword?.addEventListener(
  "click",

  async () => {

    const email =
      document
        .getElementById(
          "loginEmail"
        )
        .value
        .trim();


    if (!email) {

      showError(
        "Escribí primero tu email."
      );

      return;

    }


    try {

      await sendPasswordResetEmail(
        auth,
        email
      );


      showSuccess(
        "Te enviamos un correo para cambiar tu contraseña."
      );

    } catch(error) {

      console.error(error);


      showError(
        firebaseErrorMessage(
          error.code
        )
      );

    }

  }
);


// ============================================
// ALREADY LOGGED IN
// ============================================

onAuthStateChanged(
  auth,

  user => {

    if (!user) {
      return;
    }


    console.log(
      "Sesión activa:",
      user.uid
    );

  }
);


// ============================================
// DEFAULT PROFILE
// ============================================

function getDefaultSymbol(role) {

  const symbols = {
    top: "✦",
    jungle: "☾",
    mid: "✧",
    adc: "❀",
    support: "♡"
  };


  return (
    symbols[role] ||
    "✦"
  );

}


function getDefaultColor(role) {

  const colors = {
    top: "#df526f",
    jungle: "#c34462",
    mid: "#f68aa1",
    adc: "#ed5878",
    support: "#ffa0b4"
  };


  return (
    colors[role] ||
    "#ef476a"
  );

}


// ============================================
// UI HELPERS
// ============================================

function clearMessage() {

  authMessage.textContent =
    "";

  authMessage.className =
    "auth-message";

}


function showLoading(text) {

  authMessage.textContent =
    text;

  authMessage.className =
    "auth-message";

}


function showSuccess(text) {

  authMessage.textContent =
    text;

  authMessage.className =
    "auth-message success";

}


function showError(text) {

  authMessage.textContent =
    text;

  authMessage.className =
    "auth-message error";

}


function setFormsDisabled(disabled) {

  document
    .querySelectorAll(
      ".auth-form input, .auth-form select, .auth-form button"
    )
    .forEach(element => {

      element.disabled =
        disabled;

    });

}


// ============================================
// FIREBASE ERRORS
// ============================================

function firebaseErrorMessage(code) {

  switch(code) {

    case "auth/email-already-in-use":

      return "Ese email ya tiene una cuenta.";


    case "auth/invalid-email":

      return "El email ingresado no es válido.";


    case "auth/weak-password":

      return "La contraseña debe tener al menos 6 caracteres.";


    case "auth/invalid-login-credentials":
    case "auth/invalid-credential":

      return "Email o contraseña incorrectos.";


    case "auth/user-not-found":

      return "No existe una cuenta con ese email.";


    case "auth/wrong-password":

      return "La contraseña es incorrecta.";


    case "auth/too-many-requests":

      return "Demasiados intentos. Probá nuevamente más tarde.";


    case "auth/network-request-failed":

      return "No pudimos conectarnos. Revisá tu conexión.";


    default:

      return "Ocurrió un error. Probá nuevamente.";

  }

}
