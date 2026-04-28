<template>
  <div class="booking-container">
    
    <div class="header">
      <h2>Book a Session</h2>
      <p>Select service and time</p>
    </div>

    <div class="section">
      <div class="services-list">
        <div 
          v-for="srv in services" 
          :key="srv.id"
          :class="['service-card', { active: selectedService?.id === srv.id }]"
          @click="selectService(srv)"
        >
          <div class="srv-info">
            <span class="srv-name">{{ srv.name }}</span>
            <span class="srv-details">{{ srv.duration }} min</span>
          </div>
          <div class="srv-price">{{ srv.price }} ₸</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="selectedService">
      <label class="section-title">Select Date</label>
      <input 
        type="date" 
        v-model="selectedDate" 
        @change="fetchAvailableSlots" 
        :min="new Date().toISOString().split('T')[0]"
        class="form-input"
      />
    </div>

    <div class="section" v-if="selectedDate && !isLoading">
      <label class="section-title">Available Time</label>
      <div v-if="slots.length === 0" class="error-msg">No slots available 😔</div>
      
      <div v-else class="time-grid">
        <button 
          v-for="time in slots" 
          :key="time"
          :class="['time-pill', { active: selectedTime === time }]"
          @click="selectedTime = time"
        >
          {{ time }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loader">Searching slots...</div>

    <div class="summary-card" v-if="selectedTime">
      <div class="summary-content">
        <div class="sum-row">
          <span class="label">Service</span>
          <span class="val">{{ selectedService.name }}</span>
        </div>
        <div class="sum-row">
          <span class="label">Time</span>
          <span class="val">{{ selectedTime }}</span>
        </div>
        <div class="sum-divider"></div>
        <div class="sum-row total">
          <span>Total</span>
          <span>{{ selectedService.price }} ₸</span>
        </div>
      </div>
      
      <button 
        class="submit-button"
        :disabled="isSubmitting"
        @click="submitBooking"
      >
        {{ isSubmitting ? 'Processing...' : 'Confirm & Pay' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const GET_SLOTS_URL = 'https://automatization019283.app.n8n.cloud/webhook/get-slots'
const POST_BOOKING_URL = 'https://automatization019283.app.n8n.cloud/webhook/create-booking'

const services = ref([
  { id: 1, name: 'Quick Haircut', duration: 30, price: 5000 },
  { id: 2, name: 'Standard Wash & Cut', duration: 60, price: 10000 },
  { id: 3, name: 'Premium Complex', duration: 90, price: 15000 }
])

const selectedService = ref(null)
const selectedDate = ref('')
const selectedTime = ref('')
const slots = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

const calculatedEndTime = computed(() => {
  if (!selectedTime.value || !selectedService.value) return ''
  const [hours, minutes] = selectedTime.value.split(':').map(Number)
  const totalMins = hours * 60 + minutes + selectedService.value.duration
  const endH = Math.floor(totalMins / 60).toString().padStart(2, '0')
  const endM = (totalMins % 60).toString().padStart(2, '0')
  return `${endH}:${endM}`
})

const selectService = (srv) => {
  selectedService.value = srv
  selectedTime.value = ''
  if (selectedDate.value) fetchAvailableSlots()
}

const fetchAvailableSlots = async () => {
  if (!selectedDate.value || !selectedService.value) return
  selectedTime.value = '' 
  isLoading.value = true
  slots.value = []
  try {
    const url = `${GET_SLOTS_URL}?date=${selectedDate.value}&duration=${selectedService.value.duration}`
    const response = await fetch(url)
    const data = await response.json()
    slots.value = data.slots || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const submitBooking = async () => {
  if (!selectedDate.value || !selectedTime.value) return
  isSubmitting.value = true
  try {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: '6046106147', first_name: 'David' }
    const payload = {
      chat_id: tgUser.id.toString(),
      customer_name: tgUser.first_name,
      service: selectedService.value.name, 
      date: selectedDate.value,
      start_time: selectedTime.value,
      end_time: calculatedEndTime.value, 
      price: selectedService.value.price.toString(),
      payment_status: "pending"
    }
    const response = await fetch(POST_BOOKING_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    if (response.ok) {
      alert('Success! Invoice sent to bot.')
      selectedDate.value = ''; selectedTime.value = ''; selectedService.value = null;
    } else {
      alert('Booking error.')
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.booking-container {
  padding: 24px; background: #ffffff; min-height: 100vh;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
}
.header { margin-bottom: 32px; }
.header h2 { margin: 0; font-size: 28px; font-weight: 800; color: #111; }
.header p { margin: 4px 0 0; color: #888; font-weight: 500; }

.section { margin-bottom: 24px; }
.section-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 12px; display: block; }

/* Услуги */
.services-list { display: flex; flex-direction: column; gap: 12px; }
.service-card {
  padding: 20px; border-radius: 24px; background: #f4f5f7;
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; transition: 0.3s;
}
.service-card.active { background: #151515; color: #fff; }
.srv-name { font-size: 16px; font-weight: 700; display: block; margin-bottom: 4px; }
.srv-details { font-size: 13px; color: #888; }
.service-card.active .srv-details { color: #aaa; }
.srv-price { font-size: 16px; font-weight: 800; }

/* Инпут даты */
.form-input {
  width: 100%; padding: 18px; border-radius: 20px; border: none;
  background: #f4f5f7; font-size: 16px; font-weight: 600; color: #111; box-sizing: border-box;
}

/* Сетка времени вместо барабана (современнее) */
.time-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.time-pill {
  flex: 1 1 calc(33% - 10px); padding: 14px; border-radius: 16px;
  background: #f4f5f7; border: none; font-size: 15px; font-weight: 600;
  color: #111; cursor: pointer; transition: 0.2s;
}
.time-pill.active { background: #c4f000; color: #111; box-shadow: 0 4px 12px rgba(196, 240, 0, 0.4); }

/* Финальный Чек (Темная карточка) */
.summary-card {
  margin-top: 32px; background: #151515; border-radius: 32px; padding: 24px; color: #fff;
}
.summary-content { margin-bottom: 24px; }
.sum-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
.sum-row .label { color: #888; }
.sum-row .val { font-weight: 600; }
.sum-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 16px 0; }
.sum-row.total { font-size: 20px; font-weight: 800; margin-bottom: 0; }

/* Кнопка Оплаты */
.submit-button {
  width: 100%; padding: 18px; border-radius: 20px; border: none;
  background: #fff; color: #111; font-size: 16px; font-weight: 800; cursor: pointer;
}
.submit-button:disabled { opacity: 0.6; }
.loader, .error-msg { text-align: center; color: #888; padding: 20px 0; font-weight: 500;}
</style>