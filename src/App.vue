<template>
  <div class="app-container">
    
    <main class="content">
      <router-view />
    </main>

    <BottomNav />
    
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import BottomNav from './components/BottomNav.vue'

onMounted(() => {
  // Инициализация Telegram Web App при запуске
  const tg = window.Telegram ? window.Telegram.WebApp : null;

  if (tg) {
    // Сообщаем мессенджеру, что приложение загрузилось (убирает кружок загрузки)
    tg.ready();
    // Разворачиваем мини-апп на весь экран смартфона
    tg.expand();
  }
});
</script>

<style>
/* Глобальные стили и привязка к системной теме Telegram (Светлая/Темная) */
:root {
  --bg-color: var(--tg-theme-bg-color, #ffffff);
  --text-color: var(--tg-theme-text-color, #222222);
  --hint-color: var(--tg-theme-hint-color, #999999);
  --link-color: var(--tg-theme-link-color, #2481cc);
  --button-color: var(--tg-theme-button-color, #5288c1);
  --button-text-color: var(--tg-theme-button-text-color, #ffffff);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* Запрещаем скролл всей страницы, чтобы навбар стоял на месте */
}

.content {
  flex: 1;
  overflow-y: auto; /* Скроллится только эта часть с контентом */
  padding: 15px;
  /* Важно: добавляем отступ снизу, чтобы контент не прятался под BottomNav */
  padding-bottom: 80px; 
}
</style>