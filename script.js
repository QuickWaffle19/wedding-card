/* =========================================================
   DIGITAL WEDDING INVITATION — INTERACTIONS
   Update the values in CONFIG to customize the invitation.
   ========================================================= */
const CONFIG = {
  coupleNames: "Ridhwan & Fatin",
  // Local time in Malaysia (UTC+08:00). Format: YYYY-MM-DDTHH:mm:ss+08:00
  weddingDate: "2026-12-06T13:00:00+08:00",
  // Replace with your own Google Forms responder URL:
  rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLScSLkcvvFaE8dlWJIcGSt55h_9xpBLmlVy6pHbOWfQF15oG0Q/viewform?usp=header",
  // Replace with a precise Google Maps link for the venue:
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=KUASA%20KASEH%20EVENT%20HALL%20(KOTA%20PUTERI)%2C%201%20Jalan%20Kota%202%2F4%2C%20Kawasan%20Perindustrian%20Kota%20Puteri%2C%2081750%20Masai%2C%20Johor"
};

const intro = document.getElementById("intro");
const envelope = document.getElementById("envelope");
const openInvitationButton = document.getElementById("openInvitation");
const invitation = document.getElementById("invitation");
const languageToggle = document.getElementById("languageToggle");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const backgroundMusic = document.getElementById("backgroundMusic");
backgroundMusic.volume = 1.0;
const toast = document.getElementById("toast");

let currentLanguage = "ms";
let invitationOpened = false;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function openInvitation() {
  if (invitationOpened) return;
  invitationOpened = true;
  backgroundMusic.play()
    .then(() => updateMusicLabel())
    .catch(() => {
      showToast("Tap the music button to play music.");
    });
  envelope.classList.add("open");
  openInvitationButton.disabled = true;
  openInvitationButton.querySelector("span").textContent =
    currentLanguage === "ms" ? "Membuka..." : "Opening...";

  // Let the envelope animation play before revealing the invitation.
  setTimeout(() => {
    intro.classList.add("intro-away");
    intro.style.opacity = "0";
    intro.style.transform = "translateY(-12px)";
    setTimeout(() => {
      intro.classList.add("hidden");
      invitation.classList.remove("hidden");
      invitation.setAttribute("aria-hidden", "false");
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelectorAll(".section-shell").forEach((section, index) => {
        section.style.animationDelay = `${Math.min(index * 90, 450)}ms`;
        section.classList.add("fade-in");
      });
    }, 450);
  }, 950);
}

envelope.addEventListener("click", openInvitation);
openInvitationButton.addEventListener("click", openInvitation);

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-ms][data-en]").forEach((element) => {
    const value = element.dataset[language];
    if (value !== undefined) element.innerHTML = value;
  });
  languageToggle.textContent = language === "ms" ? "EN" : "BM";
  languageToggle.setAttribute(
    "aria-label",
    language === "ms" ? "Switch to English" : "Tukar ke Bahasa Melayu"
  );
  updateMusicLabel();
}
languageToggle.addEventListener("click", () => setLanguage(currentLanguage === "ms" ? "en" : "ms"));

function updateMusicLabel() {
  const isPlaying = !backgroundMusic.paused;
  musicLabel.textContent = currentLanguage === "ms"
    ? `Muzik: ${isPlaying ? "ON" : "OFF"}`
    : `Music: ${isPlaying ? "ON" : "OFF"}`;
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      updateMusicLabel();
    } catch (error) {
      showToast(currentLanguage === "ms"
        ? "Tambah fail assets/music.mp3 untuk mengaktifkan muzik."
        : "Add an assets/music.mp3 file to enable music.");
    }
  } else {
    backgroundMusic.pause();
    updateMusicLabel();
  }
});
backgroundMusic.addEventListener("ended", updateMusicLabel);

function updateCountdown() {
  const weddingTime = new Date(CONFIG.weddingDate).getTime();
  const now = Date.now();
  let remaining = weddingTime - now;

  if (Number.isNaN(weddingTime)) {
    document.getElementById("days").textContent = "---";
    return;
  }
  if (remaining <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      document.getElementById(id).textContent = "00";
    });
    return;
  }

  const day = Math.floor(remaining / (1000 * 60 * 60 * 24));
  remaining %= 1000 * 60 * 60 * 24;
  const hour = Math.floor(remaining / (1000 * 60 * 60));
  remaining %= 1000 * 60 * 60;
  const minute = Math.floor(remaining / (1000 * 60));
  const second = Math.floor((remaining % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = String(day).padStart(3, "0");
  document.getElementById("hours").textContent = String(hour).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minute).padStart(2, "0");
  document.getElementById("seconds").textContent = String(second).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

document.getElementById("rsvpLink").href = CONFIG.rsvpUrl;
document.getElementById("mapsLink").href = CONFIG.mapsUrl;

document.getElementById("shareButton").addEventListener("click", async () => {
  const shareData = {
    title: "Ridhwan & Fatin — Wedding Invitation",
    text: currentLanguage === "ms"
      ? "Jemputan perkahwinan Ridhwan & Fatin. Kami berharap dapat meraikan hari istimewa ini bersama anda."
      : "Ridhwan & Fatin's wedding invitation. We hope you can celebrate this special day with us.",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      // User cancelled the share sheet; no action needed.
    }
  } else if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(currentLanguage === "ms" ? "Pautan jemputan disalin!" : "Invitation link copied!");
    } catch (error) {
      showToast(currentLanguage === "ms"
        ? "Salin pautan dari bar alamat browser."
        : "Copy the link from your browser's address bar.");
    }
  } else {
    showToast(currentLanguage === "ms"
      ? "Salin pautan dari bar alamat browser."
      : "Copy the link from your browser's address bar.");
  }
});
