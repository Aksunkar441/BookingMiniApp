<template>
  <div class="profile-container">
    <h2>Мои записи</h2>

    <div class="filter-tabs">
      <button :class="{ active: filter === 'week' }" @click="filter = 'week'">Неделя</button>
      <button :class="{ active: filter === 'month' }" @click="filter = 'month'">Месяц</button>
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">Все</button>
    </div>

    <div v-if="loading" class="loader">Загружаем данные... ⏳</div>

    <div v-else-if="filteredBookings.length === 0" class="empty-state">
      В этом периоде записей нет
    </div>

    <div v-else class="bookings-list">
      <div v-for="booking in filteredBookings" :key="booking.booking_id" class="booking-card">
        
        <div class="booking-header">
          <h3>{{ booking.service || 'Услуга не указана' }}</h3>
          <span :class="['status-badge', booking.payment_status]">
            {{ 
              booking.payment_status === 'paid' ? 'Оплачено ✅' : 
              booking.payment_status === 'refunded' ? 'Возврат 💸' : 'Отклонено ❌' 
            }}
          </span>
        </div>
        
        <div class="booking-details">
          <p>📅 {{ booking.date || 'Нет даты' }}</p>
          <p>⏰ {{ booking.start_time || '??' }} - {{ booking.end_time || '??' }}</p>
          <p>💰 {{ booking.price || '0' }} KZT</p>
        </div>

        <button 
          v-if="booking.payment_status === 'paid'"
          @click="handleRefund(booking.booking_id)"
          :disabled="isProcessing === booking.booking_id"
          class="refund-btn"
        >
          {{ isProcessing === booking.booking_id ? 'Обработка...' : 'Вернуть деньги' }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Инициализируем Telegram Web App
const tg = window.Telegram?.WebApp || null;
// Берем реальный ID пользователя, либо тестовый, если открыто в браузере
const chatId = tg?.initDataUnsafe?.user?.id || '6046106147'; 

const bookings = ref([]);
const loading = ref(true);
const filter = ref('week'); 
const isProcessing = ref(null);

// 1. Получение данных (твой ПЕРВЫЙ воркфлоу)
const fetchProfileData = async () => {
  loading.value = true;
  try {
    const webhookUrl = `https://automatization019283.app.n8n.cloud/webhook/get-bookings?chat_id=${chatId}`;
    const response = await fetch(webhookUrl);
    const data = await response.json();
    bookings.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Ошибка загрузки:", error);
  } finally {
    loading.value = false;
  }
};

// 2. Тестовый возврат (твой НОВЫЙ воркфлоу)
const handleRefund = async (bookingId) => {
  // Используем нативный попап Telegram, если он доступен
  const confirmMessage = "Вы уверены, что хотите отменить запись и вернуть деньги?";
  if (tg) {
    tg.showConfirm(confirmMessage, async (confirmed) => {
      if (confirmed) await executeRefund(bookingId);
    });
  } else {
    if (confirm(confirmMessage)) await executeRefund(bookingId);
  }
};

const executeRefund = async (bookingId) => {
  isProcessing.value = bookingId;
  try {
    // ВАЖНО: Убедись, что тут стоит Production URL твоего воркфлоу возврата!
    const webhookUrl = 'https://automatization019283.app.n8n.cloud/webhook/test-refund';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, chat_id: chatId })
    });

    if (response.ok) {
      if(tg) tg.showAlert("Тестовый возврат выполнен успешно! 💸");
      else alert("Тестовый возврат выполнен успешно! 💸");
      
      await fetchProfileData(); // Сразу обновляем список, чтобы сменился статус
    } else {
      const errorData = await response.json();
      if(tg) tg.showAlert(errorData.message || "Ошибка при возврате");
      else alert(errorData.message || "Ошибка при возврате");
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
  } finally {
    isProcessing.value = null;
  }
};

// 3. Логика фильтрации
const filteredBookings = computed(() => {
  const now = new Date();
  // Убираем часы/минуты для точного сравнения дней
  now.setHours(0, 0, 0, 0); 

  return bookings.value.filter(booking => {
    if (filter.value === 'all') return true;
    
    const bookingDate = new Date(booking.date);
    const diffTime = now - bookingDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (filter.value === 'week') {
      // Показывать будущие записи и прошедшие за последние 7 дней
      return diffDays <= 7; 
    }
    if (filter.value === 'month') {
      // Показывать будущие записи и прошедшие за последние 30 дней
      return diffDays <= 30; 
    }
    return true;
  });
});

onMounted(() => {
  if (tg) tg.expand(); // Разворачиваем Mini App на весь экран
  fetchProfileData();
});
</script>

<style scoped>
/* Цвета подстраиваются под тему Telegram автоматически */
.profile-container {
  padding: 16px;
  background-color: var(--tg-theme-bg-color, #ffffff) !important;
  color: var(--tg-theme-text-color, #000000) !important;
  min-height: 100vh;
  font-family: var(--tg-theme-font-family, sans-serif);
}

h2, h3, p {
  color: var(--tg-theme-text-color, #000000) !important;
}

/* Стили вкладок фильтрации */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0) !important;
  padding: 4px;
  border-radius: 12px;
}

.filter-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--tg-theme-text-color, #000000);
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-tabs button.active {
  background-color: var(--tg-theme-bg-color, #ffffff);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}

/* Карточки и бейджи */
.loader, .empty-state {
  text-align: center;
  margin-top: 40px;
  color: var(--tg-theme-hint-color, #888888);
}

.booking-card {
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0) !important;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.booking-details p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  font-size: 14px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}
.status-badge.paid { background-color: rgba(49, 181, 69, 0.15); color: #31b545 !important; }
.status-badge.refunded { background-color: rgba(128, 128, 128, 0.15); color: #888888 !important; }
/* Изменили цвет для статуса 'pending' (Отклонено), сделав его серым */
.status-badge.pending { background-color: rgba(128, 128, 128, 0.15); color: #888888 !important; }

/* Кнопка возврата - НОВЫЙ серый стиль */
.refund-btn {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  background-color: transparent;
  /* Серая граница и серый текст */
  border: 1px solid #c0c0c0;
  color: #808080;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refund-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refund-btn:active:not(:disabled) {
  /* Легкий серый фон при нажатии */
  background-color: rgba(192, 192, 192, 0.1);
  transform: scale(0.98);
}
</style>