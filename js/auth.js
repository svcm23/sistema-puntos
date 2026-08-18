// ============================================
// CRIMSON VEIL — AUTH
// ============================================

import {
  auth,
  db
} from "./firebase.js";


import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


import {
  doc,
  getDoc,
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
// PASSWORD TOGGLE
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
            .closest(".password-field")
            .querySelector("input");


        const icon =
          button
            .querySelector("i");


        const isVisible =
          input.type === "text";


        input.type =
          isVisible
            ? "password"
            : "text";


        icon.className =
          isVisible
            ? "fa-regular fa-eye"
            : "fa-regular fa-eye-slash";

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

      setDisabled(true);


      showMessage(
        "Creando tu cuenta..."
      );


      // ==========================================
      // AUTH
      // ==========================================

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        credential.user;



      // ==========================================
      // FIRESTORE PROFILE
      // ==========================================

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


          /*
            Todas las cuentas creadas desde
            el registro público son PLAYER.
          */

          tipoUsuario:
            "player",


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

        750
      );


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

      setDisabled(false);

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

      setDisabled(true);


      showMessage(
        "Ingresando..."
      );


      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        credential.user;



      // ==========================================
      // LOAD PROFILE
      // ==========================================

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



      // Si por algún motivo no existe perfil
      if (
        !profileSnapshot.exists()
      ) {

        throw new Error(
          "profile-not-found"
        );

      }


      const profile =
        profileSnapshot.data();



      // ==========================================
      // COACH
      // ==========================================

      if (
        profile.tipoUsuario ===
        "coach"
      ) {

        showSuccess(
          "Bienvenido al Coach Hub ✦"
        );


        setTimeout(

          () => {

            window.location.href =
              "coach.html";

          },

          600
        );


        return;

      }



      // ==========================================
      // PLAYER
      // ==========================================

      showSuccess(
        "Bienvenida nuevamente ✦"
      );


      setTimeout(

        () => {

          window.location.href =
            "index.html";

        },

        600
      );


    } catch(error) {

      console.error(
        error
      );


      if (
        error.message ===
        "profile-not-found"
      ) {

        showError(
          "Tu cuenta existe, pero no encontramos tu perfil."
        );

        return;

      }


      showError(
        getFirebaseError(
          error.code
        )
      );


    } finally {

      setDisabled(false);

    }

  }

);



// ============================================
// DEFAULT PROFILE
// ============================================

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



// ============================================
// UI
// ============================================

function clearMessage() {

  authMessage.textContent =
    "";


  authMessage.className =
    "auth-message";

}



function showMessage(text) {

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



function setDisabled(disabled) {

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
// ERRORS
// ============================================

function getFirebaseError(code) {

  switch(code) {

    case "auth/email-already-in-use":
      return "Ese email ya tiene una cuenta.";


    case "auth/invalid-email":
      return "El email ingresado no es válido.";


    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";


    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Email o contraseña incorrectos.";


    case "auth/user-not-found":
      return "No existe una cuenta con ese email.";


    case "auth/wrong-password":
      return "La contraseña es incorrecta.";


    case "auth/too-many-requests":
      return "Demasiados intentos. Probá nuevamente más tarde.";


    case "auth/network-request-failed":
      return "No se pudo conectar con Firebase.";


    default:
      return "Ocurrió un error. Probá nuevamente.";

  }

}
