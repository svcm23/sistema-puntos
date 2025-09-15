const heroLogo = document.getElementById("hero-logo");
window.addEventListener("scroll", ()=>{
  const y = window.scrollY;
  const scale = Math.max(0.5, 1 - y/600);
  const opacity = Math.max(0, 1 - y/400);
  heroLogo.style.transform = `scale(${scale})`;
  heroLogo.style.opacity = opacity;
});
