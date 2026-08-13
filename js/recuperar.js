// ============================================
// CRIMSON VEIL — PASSWORD RECOVERY
// ============================================

import {
  auth
} from "./firebase.js";


import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


// ============================================
// ELEMENTS
// ============================================

const recoveryForm =
  document.getElementById(
    "recoveryForm"
  );


const recoveryEmail =
  document.getElementById(
    "recoveryEmail"
  );


const recoveryMessage =
  document.getElementById(
    "recoveryMessage"
  );


const submitButton =
  recoveryForm.querySelector(
    'button[type="submit"]'
  );


// ============================================
// SUBMIT
// ============================================

recoveryForm.addEventListener(
  "submit",

  async event => {

    event.preventDefault();


    const email =
      recoveryEmail
        .value
        .trim();


    if (!email) {

      showError(
        "Ingresá tu email."
      );

      return;

    }


    try {

      setLoading(true);

      showMessage(
        "Enviando enlace..."
      );


      await sendPasswordResetEmail(
        auth,
        email
      );


      showSuccess(
        "Listo ✦ Revisá tu correo para cambiar la contraseña."
      );


      recoveryEmail.value =
        "";

    } catch(error) {

      console.error(
        error
      );


      showError(
        getFirebaseError(
          error.code
        )
      );

    } finally {

      setLoading(false);

    }

  }
);


// ============================================
// UI
// ============================================

function showMessage(text) {

  recoveryMessage.textContent =
    text;

  recoveryMessage.className =
    "recovery-message";

}


function showSuccess(text) {

  recoveryMessage.textContent =
    text;

  recoveryMessage.className =
    "recovery-message success";

}


function showError(text) {

  recoveryMessage.textContent =
    text;

  recoveryMessage.className =
    "recovery-message error";

}


function setLoading(loading) {

  submitButton.disabled =
    loading;


  recoveryEmail.disabled =
    loading;

}


// ============================================
// ERRORS
// ============================================

function getFirebaseError(code) {

  switch(code) {

    case "auth/invalid-email":
      return "El email ingresado no es válido.";

    case "auth/user-not-found":
      return "No encontramos una cuenta con ese email.";

    case "auth/too-many-requests":
      return "Demasiados intentos. Probá nuevamente más tarde.";

    case "auth/network-request-failed":
      return "No se pudo conectar con Firebase.";

    default:
      return "No pudimos enviar el correo. Probá nuevamente.";

  }

}
