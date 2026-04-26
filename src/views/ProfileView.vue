<template>
  <div class="profile-container">
    <h2>Мои записи</h2>

    <div v-if="loading" class="loader">Загрузка...</div>

    <div v-else-if="bookings.length === 0" class="empty-state">Записей не найдено</div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.booking_id" class="booking-card">
        <div class="booking-header">
          <h3>{{ booking.service || 'Услуга не указана' }}</h3>
          <span :class="['status-badge', booking.payment_status]">
            {{ booking.payment_status === 'paid' ? 'Оплачено ✅' : 'Ожидает ⏳' }}
          </span>
        </div>
        
        <div class="booking-details">
          <p>📅 {{ booking.date || 'Нет даты' }}</p>
          <p>⏰ {{ booking.start_time || '??' }} - {{ booking.end_time || '??' }}</p>
          <p>💰 {{ booking.price || '0' }} KZT</p>
        </div>

        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const bookings = ref([]);
const loading = ref(true);

const fetchProfileData = async () => {
  // Инициализация Telegram WebApp
  const tg = window.Telegram?.WebApp;
  tg?.ready();

  // Берем ID пользователя из Telegram, либо используем твой тестовый ID
  const chatId = tg?.initDataUnsafe?.user?.id || '6046106147';

  try {
    // ВСТАВЬ СЮДА СВОЙ PRODUCTION URL ИЗ N8N (ИЗ ШАГА 1)
    // Очисти всё лишнее, оставь один чистый адрес
    const webhookUrl = `https://automatization019283.app.n8n.cloud/webhook/get-bookings?chat_id=${chatId}`;
    
    const response = await fetch(webhookUrl);
    const data = await response.json();
    
    // n8n возвращает массив строк из таблицы
    bookings.value = data; 
  } catch (error) {
    console.error('Ошибка при загрузке профиля:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfileData();
});
</script>

<style scoped>
/* Форсируем цвета через !important, чтобы никакие глобальные стили их не перебили */
.profile-container {
  padding: 16px;
  background-color: var(--tg-theme-bg-color, #fff) !important;
  color: var(--tg-theme-text-color, #000) !important;
  min-height: 100vh;
}

h2, h3, p {
  color: var(--tg-theme-text-color, #000) !important;
}

.booking-card {
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0) !important;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(128, 128, 128, 0.2);
}

.status-badge.paid { color: #31b545 !important; font-weight: bold; }
.status-badge.pending { color: #f1a208 !important; font-weight: bold; }

.booking-details p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
</style>