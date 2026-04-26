<template>
  <div class="profile-container">
    <h2>Мои записи</h2>

    <div v-if="loading" class="loader">
      Загружаем историю... ⏳
    </div>

    <div v-else-if="bookings.length === 0" class="empty-state">
      У вас пока нет активных записей.
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in bookings" :key="booking.booking_id" class="booking-card">
        <div class="booking-header">
          <h3>{{ booking.service }}</h3>
          <span :class="['status-badge', booking.payment_status]">
            {{ booking.payment_status === 'paid' ? 'Оплачено ✅' : 'Ожидает ⏳' }}
          </span>
        </div>
        <div class="booking-details">
          <p>📅 {{ booking.date }}</p>
          <p>⏰ {{ booking.start_time }} - {{ booking.end_time }}</p>
          <p>💰 {{ booking.price }} KZT</p>
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
.profile-container {
  padding: 16px;
  font-family: var(--tg-theme-font-family, sans-serif);
  color: var(--tg-theme-text-color, #000);
  background-color: var(--tg-theme-bg-color, #fff);
  min-height: 100vh;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.loader, .empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--tg-theme-hint-color, #999);
}

.booking-card {
  background-color: var(--tg-theme-secondary-bg-color, #f5f5f5);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.booking-header h3 {
  margin: 0;
  font-size: 18px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.paid {
  background-color: #e6f4ea;
  color: #1e8e3e;
}

.status-badge.pending {
  background-color: #fef7e0;
  color: #f9ab00;
}

.booking-details p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #666);
}
</style>