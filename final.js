
const photo = document.getElementById("herPhoto");
const music = document.getElementById("loveMusic");
const musicButton = document.getElementById("musicButton");
const subtitle = document.getElementById("subtitle");

// Caso a foto não seja encontrada, avisa no console.
photo.addEventListener("error", () => {
  console.error(
    "Não foi possível carregar a foto. Confira assets/foto-dela.jpg."
  );
});

// Música: você pode colocar o arquivo depois.
musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicButton.textContent = "♫ Pausar nossa música";
    } catch (error) {
      musicButton.textContent = "Não consegui tocar o áudio 😅";
      console.error("Erro ao iniciar a música:", error);
    }
  } else {
    music.pause();
    musicButton.textContent = "♫ Tocar nossa música";
  }
});

music.addEventListener("ended", () => {
  musicButton.textContent = "♫ Tocar nossa música";
});

// Pequena surpresa adicional quando a foto termina de girar.
window.setTimeout(() => {
  subtitle.textContent =
    "E se eu pudesse escolher de novo, escolheria você. ❤️";
}, 3200);
