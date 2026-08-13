// ============================================
// CRIMSON VEIL — NAVBAR USER
// ============================================

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ============================================
// ELEMENTS
// ============================================

const loginLink =
  document.getElementById("loginLink");

const loggedUser =
  document.getElementById("loggedUser");

const navNickname =
  document.getElementById("navNickname");

const userMenuButton =
  document.getElementById("userMenuButton");

const userDropdown =
  document.getElementById("userDropdown");

const logoutButton =
  document.getElementById("logoutButton");


// ============================================
// AUTH STATE
// ============================================

onAuthStateChanged(
  auth,

  async user => {
 console.log("🔥 AUTH STATE:", user);
    // ===========================
    // NO SESSION
    // ===========================

    if (!user) {

      loginLink?.classList.remove("hidden");

      loggedUser?.classList.add("hidden");

      return;
    }


    // ===========================
    // SESSION ACTIVE
    // ===========================

    loginLink?.classList.add("hidden");

    loggedUser?.classList.remove("hidden");


    try {

      const profileRef =
        doc(
          db,
          "usuarios",
          user.uid
        );


      const profileSnap =
        await getDoc(profileRef);


      if (profileSnap.exists()) {

        const profile =
          profileSnap.data();


        navNickname.textContent =
          profile.nickname ||
          "Player";

      } else {

        navNickname.textContent =
          user.email?.split("@")[0] ||
          "Player";

      }

    } catch(error) {

      console.error(
        "Error cargando perfil:",
        error
      );


      navNickname.textContent =
        user.email?.split("@")[0] ||
        "Player";

    }

  }
);


// ============================================
// DROPDOWN
// ============================================

userMenuButton?.addEventListener(
  "click",

  event => {

    event.stopPropagation();

    userDropdown?.classList.toggle(
      "visible"
    );

  }
);


// Cerrar al hacer clic afuera

document.addEventListener(
  "click",

  event => {

    if (
      !loggedUser?.contains(event.target)
    ) {

      userDropdown?.classList.remove(
        "visible"
      );

    }

  }
);


// ============================================
// LOGOUT
// ============================================

logoutButton?.addEventListener(
  "click",

  async () => {

    try {

      await signOut(auth);

      window.location.href =
        "index.html";

    } catch(error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

    }

  }
);
