<template>
  <nav class="modern-bottom-nav">
    <router-link to="/booking" class="nav-item" active-class="active">
      <div class="nav-content">
        <span class="icon">📅</span>
        <span class="label">Запись</span>
      </div>
    </router-link>

    <router-link to="/profile" class="nav-item" active-class="active">
      <div class="nav-content">
        <span class="icon">👤</span>
        <span class="label">Профиль</span>
      </div>
    </router-link>
  </nav>
</template>

<script setup>
// Скрипт пустой, логика переходов работает через router-link
</script>

<style scoped>
/* Плавающая панель навигации */
.modern-bottom-nav {
  position: fixed;
  bottom: 24px; 
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px); 
  max-width: 380px; 
  height: 68px;
  background-color: #151515; 
  border-radius: 34px; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px; 
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-bottom: env(safe-area-inset-bottom);
}

/* Базовый стиль для вкладок (Неактивное состояние) */
.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 52px;
  border-radius: 26px;
  text-decoration: none;
  color: #888888; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

/* Скрываем текст, когда вкладка неактивна */
.label {
  font-size: 15px;
  font-weight: 700;
  max-width: 0;
  opacity: 0;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Активное состояние (Магия анимации) */
.nav-item.active {
  flex: 1.4; 
  /* Твой выбранный стильный цвет (Dusty Blue) */
  background-color: #A7C0D8; 
  color: #111111; 
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2);
}

.nav-item.active .icon {
  transform: scale(1.1); 
}

/* Плавно показываем текст только у активной вкладки */
.nav-item.active .label {
  max-width: 100px;
  opacity: 1;
  margin-left: 4px;
}
</style>