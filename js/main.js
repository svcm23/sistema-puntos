/* =============================================
   CRIMSON VEIL
   HOME
============================================= */


const heroLogo =
  document.getElementById(
    "hero-logo"
  );


const nav =
  document.getElementById(
    "main-nav"
  );



/* =============================================
   SCROLL
============================================= */

function handleScroll() {

  const scrollY =
    window.scrollY;



  /* -----------------------------------------
     NAV
  ------------------------------------------ */

  if (nav) {

    if (scrollY > 25) {

      nav.classList.add(
        "scrolled"
      );

    } else {

      nav.classList.remove(
        "scrolled"
      );

    }

  }



  /* -----------------------------------------
     LOGO HERO
  ------------------------------------------ */

  if (heroLogo) {

    const scale =
      Math.max(
        .72,
        1 - scrollY / 1100
      );


    const opacity =
      Math.max(
        0,
        1 - scrollY / 650
      );


    const moveUp =
      Math.min(
        70,
        scrollY * .10
      );


    heroLogo.style.transform = `

      translateY(-${moveUp}px)

      scale(${scale})

    `;


    heroLogo.style.opacity =
      opacity;

  }

}



window.addEventListener(

  "scroll",

  handleScroll,

  {
    passive:
      true
  }

);



handleScroll();



/* =============================================
   PLAYER CARD HOVER

   Muy sutil.
============================================= */

const playerCards =
  document.querySelectorAll(
    ".player-card"
  );


playerCards.forEach(card => {

  card.addEventListener(
    "mousemove",
    event => {

      const rect =
        card.getBoundingClientRect();


      const x =
        event.clientX -
        rect.left;


      const y =
        event.clientY -
        rect.top;


      card.style.setProperty(
        "--mouse-x",
        `${x}px`
      );


      card.style.setProperty(
        "--mouse-y",
        `${y}px`
      );

    }
  );

});
