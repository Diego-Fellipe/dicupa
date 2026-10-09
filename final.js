
const photo = document.getElementById("herPhoto");
const music = document.getElementById("loveMusic");
const musicButton = document.getElementById("musicButton");
const subtitle = document.getElementById("subtitle");

// ------------------------------------------------------
// FOTO
// ------------------------------------------------------

const herPhoto = document.getElementById("herPhoto");

if (herPhoto) {
  // Endereço correto da foto publicada no GitHub Pages.
  herPhoto.onload = () => {
    console.log("Foto carregada com sucesso! ❤️");
  };

  herPhoto.onerror = () => {
    console.error(
      "Não foi possível carregar a foto:",
      herPhoto.src
    );
  };

  herPhoto.src =
    "https://diego-fellipe.github.io/dicupa/assets/foto-dela.jpg";
} else {
  console.error(
    'Não encontrei o elemento com id="herPhoto" no final.html.'
  );
}

// ------------------------------------------------------
// MÚSICA
// ------------------------------------------------------

if (musicButton && music) {
  musicButton.addEventListener("click", async () => {
    if (music.paused) {
      try {
        await music.play();
        musicButton.textContent = "♫ Pausar nossa música";
      } catch (error) {
        musicButton.textContent =
          "Não consegui tocar o áudio 😅";

        console.error(
          "Erro ao iniciar a música:",
          error
        );
      }
    } else {
      music.pause();
      musicButton.textContent = "♫ Tocar nossa música";
    }
  });

  music.addEventListener("ended", () => {
    musicButton.textContent = "♫ Tocar nossa música";
  });
} else {
  console.error(
    "Não encontrei o elemento de áudio ou o botão da música."
  );
}

// ------------------------------------------------------
// SURPRESA ADICIONAL
// ------------------------------------------------------

if (subtitle) {
  window.setTimeout(() => {
    subtitle.textContent =
      "E se eu pudesse escolher de novo, escolheria você. ❤️";
  }, 3200);
} else {
  console.error(
    'Não encontrei o elemento com id="subtitle".'
  );
}
