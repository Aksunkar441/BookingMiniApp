<template>
  <div class="profile-container">
    <h2 class="page-title">Мои записи</h2>

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
      <div v-for="(booking, index) in filteredBookings" :key="booking.booking_id" class="premium-card">
        
        <img :src="getDemoImage(index)" alt="Service Image" class="card-bg-image" />
        
        <span :class="['floating-badge', booking.payment_status]">
          {{ 
            booking.payment_status === 'paid' ? 'Оплачено ✅' : 
            booking.payment_status === 'refunded' ? 'Возврат 💸' : 'Отклонено ❌' 
          }}
        </span>

        <div class="glass-content">
          <h3 class="service-title">{{ booking.service || 'Услуга не указана' }}</h3>
          
          <div class="booking-details">
            <p>📅 {{ booking.date || 'Нет даты' }}</p>
            <p>⏰ {{ booking.start_time || '??' }} - {{ booking.end_time || '??' }} &nbsp; | &nbsp; 💰 {{ booking.price || '0' }} KZT</p>
          </div>

          <button 
            v-if="booking.payment_status === 'paid'"
            @click="handleRefund(booking.booking_id)"
            :disabled="isProcessing === booking.booking_id"
            class="refund-btn"
          >
            {{ isProcessing === booking.booking_id ? 'Обработка...' : 'Cancel' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const tg = window.Telegram?.WebApp || null;
const chatId = tg?.initDataUnsafe?.user?.id || '6046106147'; 

const bookings = ref([]);
const loading = ref(true);
const filter = ref('week'); 
const isProcessing = ref(null);

// МАССИВ ДЕМО-КАРТИНОК
const demoImages = [
  'https://wallpapercave.com/wp/wp13739182.jpg', // 1. Твоя ссылка
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop', // 2. Интерьер барбершопа (замена фото 2)
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'  // 3. Эстетичный салон
];

// Функция, которая по кругу выдает картинку в зависимости от номера записи
const getDemoImage = (index) => {
  return demoImages[index % demoImages.length];
};

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

const handleRefund = async (bookingId) => {
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
    const webhookUrl = 'https://automatization019283.app.n8n.cloud/webhook/test-refund';
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, chat_id: chatId })
    });

    if (response.ok) {
      if(tg) tg.showAlert("Отменено успешно!");
      else alert("Отменено успешно!");
      await fetchProfileData(); 
    } else {
      const errorData = await response.json();
      if(tg) tg.showAlert(errorData.message || "Ошибка");
      else alert(errorData.message || "Ошибка");
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
  } finally {
    isProcessing.value = null;
  }
};

const filteredBookings = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); 
  return bookings.value.filter(booking => {
    if (filter.value === 'all') return true;
    const bookingDate = new Date(booking.date);
    const diffTime = now - bookingDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (filter.value === 'week') return diffDays <= 7; 
    if (filter.value === 'month') return diffDays <= 30; 
    return true;
  });
});

onMounted(() => {
  if (tg) tg.expand(); 
  fetchProfileData();
});
</script>

<style scoped>
/* Базовые настройки */
.profile-container {
  padding: 16px;
  background-color: var(--tg-theme-bg-color, #f8f9fa) !important;
  color: var(--tg-theme-text-color, #000) !important;
  min-height: 100vh;
  font-family: var(--tg-theme-font-family, -apple-system, BlinkMacSystemFont, sans-serif);
}

.page-title {
  margin-bottom: 20px;
  font-size: 26px;
  font-weight: 700;
}

/* Вкладки */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background-color: var(--tg-theme-secondary-bg-color, #e9ecef) !important;
  padding: 4px;
  border-radius: 14px;
}

.filter-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--tg-theme-text-color, #000);
  cursor: pointer;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-tabs button.active {
  background-color: var(--tg-theme-bg-color, #fff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-weight: 600;
}

/* ПРЕМИУМ КАРТОЧКА (Стиль Sophie Bennett) */
.premium-card {
  position: relative;
  width: 100%;
  height: 380px; /* Высокая карточка */
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: #000; /* Фон на случай долгой загрузки картинки */
}

.card-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Плавающий бейдж статуса */
.floating-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.floating-badge.paid { background: rgba(255,255,255,0.85); color: #28a745; }
.floating-badge.refunded { background: rgba(255,255,255,0.85); color: #6c757d; }
.floating-badge.pending { background: rgba(255,255,255,0.85); color: #dc3545; }

/* Матовое стекло (Glassmorphism) для контента */
.glass-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 24px 20px;
  /* Градиент от прозрачного к фону темы Telegram */
  background: linear-gradient(to top, var(--tg-theme-bg-color, rgba(255,255,255,1)) 40%, rgba(255,255,255,0.6));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.3);
}

.service-title {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--tg-theme-text-color, #111) !important;
}

.booking-details p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #555) !important;
  font-weight: 500;
}

/* Новая кнопка Cancel (стильная, серая) */
.refund-btn {
  margin-top: 16px;
  width: auto;
  padding: 10px 24px;
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
  border: 1px solid var(--tg-theme-hint-color, #dcdcdc);
  color: var(--tg-theme-text-color, #666);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.refund-btn:disabled {
  opacity: 0.6;
}

.refund-btn:active:not(:disabled) {
  transform: scale(0.96);
  background-color: rgba(0,0,0,0.05);
}

.loader, .empty-state {
  text-align: center;
  margin-top: 60px;
  font-size: 16px;
  color: var(--tg-theme-hint-color, #888);
}
</style>