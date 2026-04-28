<template>
  <div class="profile-container">
    
    <div class="header">
      <div class="greeting">
        <h1>Hello {{ userName }}</h1>
        <p>Welcome Back!</p>
      </div>
      <div class="avatar-placeholder">
        {{ userName.charAt(0).toUpperCase() }}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card dark">
        <div class="stat-icon">💳</div>
        <h3>{{ totalSpent }}k</h3>
        <p>Total Spent (KZT)</p>
      </div>
      <div class="stat-card light">
        <div class="stat-icon">📅</div>
        <h3>{{ filteredBookings.length }}</h3>
        <p>Bookings</p>
      </div>
    </div>

    <div class="filter-tabs">
      <button :class="{ active: filter === 'week' }" @click="filter = 'week'">Week</button>
      <button :class="{ active: filter === 'month' }" @click="filter = 'month'">Month</button>
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
    </div>

    <div v-if="loading" class="loader">Loading data...</div>
    <div v-else-if="filteredBookings.length === 0" class="empty-state">No bookings found.</div>

    <div v-else class="bookings-list">
      <h2 class="section-title">Recent Bookings</h2>
      
      <div v-for="booking in filteredBookings" :key="booking.booking_id" class="list-item-card">
        
        <div class="item-icon">
          <span v-if="booking.service.includes('стрижка')">✂️</span>
          <span v-else>✨</span>
        </div>

        <div class="item-info">
          <h4>{{ booking.service || 'Service' }}</h4>
          <p>{{ booking.date }} • {{ booking.start_time }}</p>
        </div>

        <div class="item-action">
          <span class="price">{{ booking.price }} ₸</span>
          
          <div class="status-wrapper">
            <span class="status-text">
              {{ 
                booking.payment_status === 'paid' ? 'Paid' : 
                booking.payment_status === 'pending' ? 'In Process' : 
                booking.payment_status === 'refunded' ? 'Refunded' : 'Declined' 
              }}
            </span>
            <span :class="['status-dot', booking.payment_status]"></span>
          </div>
        </div>

        <button 
          v-if="booking.payment_status === 'paid'"
          @click="handleRefund(booking.booking_id)"
          :disabled="isProcessing === booking.booking_id"
          class="refund-pill"
        >
          {{ isProcessing === booking.booking_id ? 'Wait...' : 'Refund' }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const tg = window.Telegram?.WebApp || null;
const chatId = tg?.initDataUnsafe?.user?.id || '6046106147'; 
const userName = tg?.initDataUnsafe?.user?.first_name || 'Aksunkar';

const bookings = ref([]);
const loading = ref(true);
const filter = ref('all'); 
const isProcessing = ref(null);

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
  const confirmMessage = "Are you sure you want to refund this booking?";
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
      await fetchProfileData(); 
    } else {
      alert("Error processing refund.");
    }
  } catch (error) {
    console.error(error);
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
    const diffDays = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));
    if (filter.value === 'week') return diffDays <= 7; 
    if (filter.value === 'month') return diffDays <= 30; 
    return true;
  });
});

// Считаем потраченные деньги для дашборда (переводим в тысячи, 'k')
const totalSpent = computed(() => {
  const total = bookings.value
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.price || 0), 0);
  return (total / 1000).toFixed(1);
});

onMounted(() => {
  if (tg) tg.expand(); 
  fetchProfileData();
});
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background-color: #ffffff;
  color: #111111;
  min-height: 100vh;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
}

/* Шапка */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.greeting h1 { margin: 0; font-size: 28px; font-weight: 800; color: #111; }
.greeting p { margin: 4px 0 0; font-size: 15px; color: #888; font-weight: 500; }
.avatar-placeholder {
  width: 50px; height: 50px;
  background: #f0f0f5;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: bold; color: #111;
}

/* Дашборд статы */
.stats-grid {
  display: flex; gap: 16px; margin-bottom: 30px;
}
.stat-card {
  flex: 1; padding: 20px; border-radius: 32px;
  display: flex; flex-direction: column; justify-content: center;
}
.stat-card.dark { background: #151515; color: #fff; }
.stat-card.light { background: #f4f5f7; color: #111; }
.stat-icon { font-size: 24px; margin-bottom: 12px; }
.stat-card h3 { margin: 0; font-size: 28px; font-weight: 800; }
.stat-card p { margin: 4px 0 0; font-size: 13px; font-weight: 500; opacity: 0.7; }

/* Табы */
.filter-tabs {
  display: flex; gap: 8px; margin-bottom: 24px;
  background: #f4f5f7; padding: 6px; border-radius: 20px;
}
.filter-tabs button {
  flex: 1; padding: 12px; border: none; background: transparent;
  border-radius: 16px; font-size: 14px; font-weight: 600; color: #888; cursor: pointer;
}
.filter-tabs button.active { background: #ffffff; color: #111; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Список записей */
.section-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; }
.list-item-card {
  background: #151515;
  border-radius: 28px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  color: #fff;
}
.item-icon {
  width: 48px; height: 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.item-info { flex: 1; min-width: 120px; }
.item-info h4 { margin: 0 0 4px; font-size: 16px; font-weight: 600; }
.item-info p { margin: 0; font-size: 13px; color: #999; }

/* --- Стили для статусов --- */
.item-action { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.price { font-size: 16px; font-weight: 700; }

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Сами точки */
.status-dot { width: 8px; height: 8px; border-radius: 50%; }

/* Зеленый/Желтый неон для оплаченных */
.status-dot.paid { background: #c4f000; box-shadow: 0 0 8px rgba(196, 240, 0, 0.4); }

/* Оранжевый для "В процессе" (pending) */
.status-dot.pending { background: #FF9F0A; box-shadow: 0 0 8px rgba(255, 159, 10, 0.4); }

/* Серый для возврата */
.status-dot.refunded { background: #8E8E93; }

/* Красный для ошибок или отклоненных */
.status-dot.declined, .status-dot.failed { background: #FF453A; box-shadow: 0 0 8px rgba(255, 69, 58, 0.4); }

/* Кнопка возврата */
.refund-pill {
  width: 100%; padding: 14px; margin-top: 8px;
  background: #ffffff; color: #111; border: none;
  border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer;
}
.refund-pill:disabled { opacity: 0.5; }
.loader, .empty-state { text-align: center; color: #888; margin-top: 40px; }
</style>