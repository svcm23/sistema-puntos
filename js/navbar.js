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
  document.getElementById(
    "loginLink"
  );


const loggedUser =
  document.getElementById(
    "loggedUser"
  );


const navNickname =
  document.getElementById(
    "navNickname"
  );


const userMenuButton =
  document.getElementById(
    "userMenuButton"
  );


const userDropdown =
  document.getElementById(
    "userDropdown"
  );


const logoutButton =
  document.getElementById(
    "logoutButton"
  );



// ============================================
// OPTIONAL ROLE LINKS
// ============================================

const coachNavLink =
  document.getElementById(
    "coachNavLink"
  );


const profileDropdownLink =
  document.getElementById(
    "profileDropdownLink"
  );


const coachDropdownLink =
  document.getElementById(
    "coachDropdownLink"
  );



// ============================================
// AUTH STATE
// ============================================

onAuthStateChanged(

  auth,

  async user => {

    console.log(
      "🔥 AUTH STATE:",
      user
    );


    // ==========================================
    // NO SESSION
    // ==========================================

    if (!user) {

      loginLink?.classList.remove(
        "hidden"
      );


      loggedUser?.classList.add(
        "hidden"
      );


      resetRoleLinks();


      return;

    }



    // ==========================================
    // SESSION ACTIVE
    // ==========================================

    loginLink?.classList.add(
      "hidden"
    );


    loggedUser?.classList.remove(
      "hidden"
    );


    try {

      const profileRef =
        doc(
          db,
          "usuarios",
          user.uid
        );


      const profileSnap =
        await getDoc(
          profileRef
        );


      // ========================================
      // PROFILE EXISTS
      // ========================================

      if (
        profileSnap.exists()
      ) {

        const profile =
          profileSnap.data();


        const nickname =
          profile.nickname ||
          user.email?.split("@")[0] ||
          "Player";


        navNickname.textContent =
          nickname;


        const userType =
          profile.tipoUsuario ||
          "player";


        applyUserType(
          userType
        );


      } else {

        navNickname.textContent =
          user.email?.split("@")[0] ||
          "Player";


        applyUserType(
          "player"
        );

      }


    } catch(error) {

      console.error(
        "Error cargando perfil:",
        error
      );


      navNickname.textContent =
        user.email?.split("@")[0] ||
        "Player";


      applyUserType(
        "player"
      );

    }

  }

);



// ============================================
// USER TYPE UI
// ============================================

function applyUserType(
  userType
) {

  resetRoleLinks();


  // ==========================================
  // COACH
  // ==========================================

  if (
    userType ===
    "coach"
  ) {

    coachNavLink?.classList.remove(
      "hidden"
    );


    coachDropdownLink?.classList.remove(
      "hidden"
    );


    /*
      El coach no necesita perfil
      de jugadora.
    */

    profileDropdownLink?.classList.add(
      "hidden"
    );


    return;

  }



  // ==========================================
  // PLAYER
  // ==========================================

  profileDropdownLink?.classList.remove(
    "hidden"
  );

}



// ============================================
// RESET ROLE LINKS
// ============================================

function resetRoleLinks() {

  coachNavLink?.classList.add(
    "hidden"
  );


  coachDropdownLink?.classList.add(
    "hidden"
  );


  profileDropdownLink?.classList.remove(
    "hidden"
  );

}



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



// ============================================
// CLOSE DROPDOWN OUTSIDE
// ============================================

document.addEventListener(

  "click",

  event => {

    if (
      !loggedUser?.contains(
        event.target
      )
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

      await signOut(
        auth
      );


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
