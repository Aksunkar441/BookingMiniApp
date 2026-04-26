<template>
  <nav class="tg-bottom-nav">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <div class="icon-wrapper">
        <span class="icon">📅</span>
      </div>
      <span class="label">Запись</span>
    </router-link>

    <router-link to="/profile" class="nav-item" exact-active-class="active">
      <div class="icon-wrapper">
        <span class="icon">👤</span>
      </div>
      <span class="label">Профиль</span>
    </router-link>
  </nav>
</template>

<style scoped>
/* Панель прибита к низу экрана */
.tg-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  /* Используем цвета из темы пользователя Telegram */
  background-color: var(--tg-theme-bg-color, #ffffff);
  border-top: 0.5px solid var(--tg-theme-hint-color, #c8c7cc);
  
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  /* Добавляем безопасный отступ для новых iPhone (челка снизу) */
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  /* Неактивные элементы получают цвет подсказок Telegram */
  color: var(--tg-theme-hint-color, #999999);
  flex: 1;
  height: 100%;
  transition: all 0.2s ease;
}

.icon {
  font-size: 24px;
  line-height: 1;
}

.label {
  font-size: 11px;
  margin-top: 4px;
  font-weight: 500;
}

/* Стили для активной вкладки (когда пользователь находится на этой странице) */
.nav-item.active {
  /* Активный элемент окрашивается в фирменный цвет ссылок/кнопок Telegram */
  color: var(--tg-theme-button-color, #3390ec);
}

.nav-item.active .icon-wrapper {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>
 <script>
 export default {
    name : "Navbar"
 }
 </script>