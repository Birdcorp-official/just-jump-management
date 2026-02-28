// ================================
// JUST JUMP MANAGEMENT - APP.JS
// ================================

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

let isAdmin = false;

// 🕒 Créneaux horaires disponibles
const timeSlots = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00"
];

// 🔔 Bannière
function showBanner(text) {
  const banner = document.getElementById("banner");
  banner.innerText = text;
  banner.style.display = "block";
  setTimeout(() => banner.style.display = "none", 3000);
}

// 🔐 LOGIN
function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    showBanner("Connexion réussie");
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  } else {
    showBanner("Erreur identifiants");
  }
}

function logout() {
  isAdmin = false;
  showBanner("Déconnecté");
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
}

// 🕒 Remplir horaires
function populateTimeSelect() {
  const select = document.getElementById("timeSelect");
  select.innerHTML = '<option value="">Choisir un horaire</option>';

  timeSlots.forEach(slot => {
    const opt = document.createElement("option");
    opt.value = slot;
    opt.textContent = slot;
    select.appendChild(opt);
  });
}

// ➕ Ajouter session avec durée 1h
function addSession() {
  if (!isAdmin) return showBanner("Connexion admin requise");

  const time = document.getElementById("timeSelect").value;
  const people = parseInt(document.getElementById("peopleInput").value);
  const names = document.getElementById("namesInput").value;

  if (!time) return showBanner("Choisis un horaire");
  if (!people || people < 1) return showBanner("Nombre invalide");

  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  const [h, m] = time.split(":");
  const startTime = new Date();
  startTime.setHours(h, m, 0);

  sessions.push({
    id: Date.now(),
    time,
    people,
    names,
    start: startTime.getTime(),
    end: startTime.getTime() + 60 * 60 * 1000 // 1 heure
  });

  localStorage.setItem("sessions", JSON.stringify(sessions));

  document.getElementById("peopleInput").value = "";
  document.getElementById("namesInput").value = "";

  renderPlanning();
  showBanner("Session ajoutée ✔");
}

// ❌ Supprimer session
function deleteSession(id) {
  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  sessions = sessions.filter(s => s.id !== id);
  localStorage.setItem("sessions", JSON.stringify(sessions));
  renderPlanning();
}

// ⏱️ Calcul temps restant
function getRemainingTime(end) {
  const diff = end - Date.now();
  if (diff <= 0) return null;

  const minutes = Math.floor(diff / 60000);
  return `${minutes} min restantes`;
}

// 🧹 Supprimer sessions terminées
function cleanFinishedSessions() {
  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  const now = Date.now();

  sessions = sessions.filter(s => s.end > now);
  localStorage.setItem("sessions", JSON.stringify(sessions));
}

// 👥 Compteur total
function countPeople(sessions) {
  return sessions.reduce((sum, s) => sum + s.people, 0);
}

// 📅 Planning
function renderPlanning() {
  cleanFinishedSessions();

  const container = document.getElementById("planning");
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  container.innerHTML = "";

  document.getElementById("counter").innerText =
    "Personnes présentes : " + countPeople(sessions);

  // 🔹 Afficher seulement les créneaux ayant des sessions
  const slotsWithSessions = [...new Set(sessions.map(s => s.time))];

  slotsWithSessions.forEach(slot => {
    const div = document.createElement("div");
    div.className = "slot";

    const slotSessions = sessions.filter(s => s.time === slot);

    div.innerHTML = `<strong>${slot}</strong><br>`;

    slotSessions.forEach(s => {
      const remaining = getRemainingTime(s.end);

      div.innerHTML += `
        <div class="sessionItem">
          👥 ${s.people} pers<br>
          ${s.names ? "🧍 " + s.names + "<br>" : ""}
          ⏱️ ${remaining || "Terminé"}
          ${isAdmin ? `<br><button onclick="deleteSession(${s.id})">🗑</button>` : ""}
        </div>
        <hr>
      `;
    });

    container.appendChild(div);
  });
}

// 🚀 Init
window.onload = () => {
  populateTimeSelect();
  renderPlanning();
  setInterval(renderPlanning, 30000); // mise à jour auto
};