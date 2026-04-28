<template>
  <nav class="modern-bottom-nav">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <div class="nav-content">
        <span class="icon">📅</span>
        <span class="label">Запись</span>
      </div>
    </router-link>

    <router-link to="/profile" class="nav-item" exact-active-class="active">
      <div class="nav-content">
        <span class="icon">👤</span>
        <span class="label">Профиль</span>
      </div>
    </router-link>
  </nav>
</template>

<script setup>
// Скрипт можно оставить пустым, так как роутер работает через HTML-теги
</script>

<style scoped>
/* Плавающая панель навигации
  Она оторвана от нижнего края экрана и имеет форму черной капсулы
*/
.modern-bottom-nav {
  position: fixed;
  bottom: 24px; /* Отступ от низа экрана */
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px); /* Ширина с учетом боковых отступов */
  max-width: 380px; /* Не даем ей растягиваться на планшетах */
  height: 68px;
  background-color: #151515; /* Глубокий черный, как наши карточки */
  border-radius: 34px; /* Идеальное скругление */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px; /* Внутренний отступ для кнопок */
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  
  /* Фикс для iPhone (учитывает полоску Home) */
  margin-bottom: env(safe-area-inset-bottom);
}

/* Базовый стиль для вкладок (Неактивное состояние)
*/
.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 52px;
  border-radius: 26px;
  text-decoration: none;
  color: #888888; /* Серый цвет для неактивных иконок */
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

/* Активное состояние (Магия анимации)
*/
.nav-item.active {
  /* Кнопка становится шире */
  flex: 1.4; 
  /* Наш фирменный неоновый цвет */
  background-color: #A7C0D8; 
  color: #111111; /* Текст и иконка становятся черными */
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2);
}

.nav-item.active .icon {
  transform: scale(1.1); /* Слегка увеличиваем иконку */
}

/* Плавно показываем текст только у активной вкладки */
.nav-item.active .label {
  max-width: 100px;
  opacity: 1;
  margin-left: 4px;
}
</style>