const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

function showLogin() {
  document.getElementById("visitorPage").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

function showVisitor() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("visitorPage").style.display = "block";
}

function login() {
  const user = username.value;
  const pass = password.value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem("adminLogged", "true");
    showAdmin();
  } else {
    alert("Identifiants incorrects");
  }
}

function logout() {
  localStorage.removeItem("adminLogged");
  location.reload();
}

function showAdmin() {
  visitorPage.style.display = "none";
  loginPage.style.display = "none";
  adminPanel.style.display = "block";
}

if (localStorage.getItem("adminLogged") === "true") {
  showAdmin();
}