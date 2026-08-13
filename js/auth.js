/* ============================================
   FIREBASE
============================================ */

import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";


import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


import {
  getFirestore,
  doc,
  setDoc
} from
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


const firebaseConfig = {

  apiKey:
    "AIzaSyC8_wsFs6jfyva62xoBDLUeZJh42Orv7-I",

  authDomain:
    "sistema-puntos-b46dd.firebaseapp.com",

  projectId:
    "sistema-puntos-b46dd",

  storageBucket:
    "sistema-puntos-b46dd.appspot.com",

  messagingSenderId:
    "412750867994",

  appId:
    "1:412750867994:web:0627943ce5605d99c3eba3",

  measurementId:
    "G-5KCWW7FDC8"
};


const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(app);


const db =
  getFirestore(app);



/* ============================================
   ELEMENTOS
============================================ */

const loginTab =
  document.getElementById(
    "loginTab"
  );


const registerTab =
  document.getElementById(
    "registerTab"
  );


const loginForm =
  document.getElementById(
    "loginForm"
  );


const registerForm =
  document.getElementById(
    "registerForm"
  );


const message =
  document.getElementById(
    "authMessage"
  );



/* ============================================
   TABS
============================================ */

loginTab.addEventListener(
  "click",
  () => {

    loginTab.classList.add(
      "active"
    );

    registerTab.classList.remove(
      "active"
    );


    loginForm.classList.remove(
      "hidden"
    );

    registerForm.classList.add(
      "hidden"
    );


    clearMessage();

  }
);



registerTab.addEventListener(
  "click",
  () => {

    registerTab.classList.add(
      "active"
    );

    loginTab.classList.remove(
      "active"
    );


    registerForm.classList.remove(
      "hidden"
    );

    loginForm.classList.add(
      "hidden"
    );


    clearMessage();

  }
);



/* ============================================
   REGISTRO
============================================ */

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

      showMessage(
        "Creando tu cuenta..."
      );


      /* Crear usuario */

      const credential =
        await createUserWithEmailAndPassword(

          auth,

          email,

          password

        );


      const user =
        credential.user;



      /*
        Crear perfil Firestore.

        El UID del usuario se convierte
        en el ID de su perfil.
      */

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


          creado:
            new Date()

        }

      );


      showSuccess(
        "Cuenta creada ✦"
      );


      setTimeout(
        () => {

          window.location.href =
            "index.html";

        },
        900
      );


    } catch(error) {

      console.error(
        error
      );


      showError(
        firebaseErrorMessage(
          error.code
        )
      );

    }

  }
);



/* ============================================
   LOGIN
============================================ */

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


    try {

      showMessage(
        "Ingresando..."
      );


      await signInWithEmailAndPassword(

        auth,

        email,

        password

      );


      showSuccess(
        "Bienvenida al Veil ✦"
      );


      setTimeout(
        () => {

          window.location.href =
            "index.html";

        },
        700
      );


    } catch(error) {

      console.error(
        error
      );


      showError(
        firebaseErrorMessage(
          error.code
        )
      );

    }

  }

);



/* ============================================
   SI YA ESTÁ LOGUEADA
============================================ */

onAuthStateChanged(

  auth,

  user => {

    if (user) {

      console.log(
        "Usuario autenticado:",
        user.uid
      );

    }

  }

);



/* ============================================
   DEFAULT PROFILE
============================================ */

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



/* ============================================
   MENSAJES
============================================ */

function clearMessage() {

  message.textContent =
    "";

  message.className =
    "auth-message";

}



function showMessage(text) {

  message.textContent =
    text;

  message.className =
    "auth-message";

}



function showSuccess(text) {

  message.textContent =
    text;

  message.className =
    "auth-message success";

}



function showError(text) {

  message.textContent =
    text;

  message.className =
    "auth-message error";

}



/* ============================================
   FIREBASE ERRORS
============================================ */

function firebaseErrorMessage(code) {

  switch(code) {

    case "auth/email-already-in-use":

      return "Ese email ya tiene una cuenta.";


    case "auth/invalid-email":

      return "El email no es válido.";


    case "auth/weak-password":

      return "La contraseña debe tener al menos 6 caracteres.";


    case "auth/user-not-found":

      return "No existe una cuenta con ese email.";


    case "auth/wrong-password":

      return "La contraseña es incorrecta.";


    case "auth/invalid-login-credentials":

      return "Email o contraseña incorrectos.";


    case "auth/too-many-requests":

      return "Demasiados intentos. Probá nuevamente más tarde.";


    default:

      return "Ocurrió un error. Probá nuevamente.";

  }

}
