<template>
  <div class="welcome-container">
    
    <div class="abstract-graphic">
      <div class="shape circle-1"></div>
      <div class="shape semi-circle"></div>
      <div class="shape circle-2"></div>
      <div class="shape lines"></div>
    </div>

    <div class="text-content">
      <h1 class="title">Добро пожаловать,<br> <span class="highlight">{{ userName }}</span></h1>
      <p class="subtitle">Удобная запись и управление своими сеансами в один клик.</p>
      
      <button class="start-btn" @click="goToMain">
        Get Started
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Достаем имя пользователя из Telegram, если нет — пишем "Гость"
const tg = window.Telegram?.WebApp || null;
const userName = computed(() => {
  return tg?.initDataUnsafe?.user?.first_name || 'Гость';
});

// Переход на главную страницу (запись)
const goToMain = () => {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light'); // Легкая вибрация при нажатии
  }
  router.push('/booking'); 
};
</script>

<style scoped>
/* Фон как на скриншоте */
.welcome-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #eef2f6; 
  padding: 40px 24px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* --- АБСТРАКТНАЯ ГРАФИКА НА ЧИСТОМ CSS --- */
.abstract-graphic {
  position: relative;
  height: 45vh;
  width: 100%;
  margin-top: 20px;
  background: transparent;
  border-radius: 40px;
  overflow: hidden;
}

.shape { position: absolute; }

.circle-1 {
  width: 120px; height: 120px;
  background: #5e5ce6;
  border-radius: 50%;
  top: 20px; right: 20px;
}

.semi-circle {
  width: 150px; height: 75px;
  background: #007aff;
  border-radius: 0 0 150px 150px;
  top: 80px; left: 10px;
  transform: rotate(-45deg);
}

.circle-2 {
  width: 80px; height: 80px;
  background: #1c1c1e;
  border-radius: 50%;
  bottom: 40px; left: 60px;
}

.lines {
  width: 100%; height: 100%;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 10px,
    rgba(94, 92, 230, 0.2) 10px,
    rgba(94, 92, 230, 0.2) 12px
  );
  border-radius: 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 70%);
}
/* -------------------------------------- */

.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 40px;
  z-index: 10;
}

.title {
  font-size: 36px;
  font-weight: 800;
  color: #0b1a30;
  line-height: 1.1;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.highlight {
  color: #5e5ce6;
}

.subtitle {
  font-size: 16px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0 0 40px 0;
  font-weight: 500;
  max-width: 90%;
}

/* Кнопка как на референсе */
.start-btn {
  align-self: flex-start; /* Прижимаем влево */
  background: #ffffff;
  color: #0b1a30;
  border: none;
  padding: 18px 36px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:active {
  transform: scale(0.95);
  box-shadow: 0 5px 15px rgba(0,0,0,0.04);
}
</style>