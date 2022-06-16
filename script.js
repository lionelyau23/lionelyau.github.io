const navBarLinks = document.querySelectorAll("#nav-bar a");

navBarLinks.forEach((a) =>
  a.addEventListener("click", () => {
    if (document.querySelector('#navbarNavAltMarkup').classList.contains('show')) {
      document.querySelector(".navbar-toggler").click();
    }
  })
);
