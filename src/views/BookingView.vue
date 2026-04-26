<template>
  <div class="booking-container">
    <h2>Запись на сеанс</h2>

    <div class="section">
      <label class="section-title">Выберите услугу:</label>
      <div class="services-list">
        <div 
          v-for="srv in services" 
          :key="srv.id"
          :class="['service-card', { active: selectedService?.id === srv.id }]"
          @click="selectService(srv)"
        >
          <div class="srv-info">
            <span class="srv-name">{{ srv.name }}</span>
            <span class="srv-details">{{ srv.duration }} мин • {{ srv.price }} ₸</span>
          </div>
          <div class="srv-radio">
            <div class="radio-inner" v-if="selectedService?.id === srv.id"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="selectedService">
      <label class="section-title">Выберите дату:</label>
      <input 
        type="date" 
        v-model="selectedDate" 
        @change="fetchAvailableSlots" 
        class="form-input"
      />
    </div>

    <div class="section" v-if="selectedDate && !isLoading">
      <label class="section-title">Доступное время:</label>
      
      <div v-if="slots.length === 0" class="error-msg">
        Нет свободного времени для этой услуги 😔
      </div>
      
      <div v-else class="ios-picker-container">
        <div class="picker-window"></div> <ul class="picker-wheel" @scroll="handleScroll" ref="wheel">
          <li class="spacer"></li>
          <li 
            v-for="time in slots" 
            :key="time"
            :class="['picker-item', { active: selectedTime === time }]"
            @click="scrollToTime(time)"
          >
            {{ time }}
          </li>
          <li class="spacer"></li>
        </ul>
      </div>
    </div>

    <div v-if="isLoading" class="loader">Ищем окошки...</div>

    <div class="summary-card" v-if="selectedTime">
      <div class="summary-row">
        <span>Услуга:</span> <strong>{{ selectedService.name }}</strong>
      </div>
      <div class="summary-row">
        <span>Время:</span> <strong>{{ selectedTime }} - {{ calculatedEndTime }}</strong>
      </div>
      <div class="summary-row total">
        <span>Итого:</span> <strong>{{ selectedService.price }} ₸</strong>
      </div>
      
      <button 
        class="submit-button"
        :disabled="isSubmitting"
        @click="submitBooking"
      >
        {{ isSubmitting ? 'Оформляем...' : 'Оплатить и Записаться' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const GET_SLOTS_URL = 'https://automatization019283.app.n8n.cloud/webhook/get-slots'
const POST_BOOKING_URL = 'https://automatization019283.app.n8n.cloud/webhook/create-booking'

// База услуг (в будущем можно тоже тянуть из Google Sheets)
const services = ref([
  { id: 1, name: 'Быстрая стрижка', duration: 30, price: 5000 },
  { id: 2, name: 'Стандартная процедура', duration: 60, price: 10000 },
  { id: 3, name: 'Сложный комплекс', duration: 90, price: 15000 }
])

const selectedService = ref(null)
const selectedDate = ref('')
const selectedTime = ref('')
const slots = ref([])
const wheel = ref(null)

const isLoading = ref(false)
const isSubmitting = ref(false)

// Вычисляем время конца для чека
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

// 1. GET ЗАПРОС с передачей длительности
const fetchAvailableSlots = async () => {
  if (!selectedDate.value || !selectedService.value) return
  
  selectedTime.value = '' 
  isLoading.value = true
  slots.value = []

  try {
    // Теперь мы отправляем n8n не только дату, но и сколько минут длится услуга!
    const url = `${GET_SLOTS_URL}?date=${selectedDate.value}&duration=${selectedService.value.duration}`
    const response = await fetch(url)
    
    if (!response.ok) throw new Error('Ошибка сервера')
    
    const data = await response.json()
    slots.value = data.slots || []
    
    // Автоматически выбираем первый слот
    if (slots.value.length > 0) {
      selectedTime.value = slots.value[0]
    }
  } catch (error) {
    console.error(error)
    alert('Не удалось загрузить расписание.')
  } finally {
    isLoading.value = false
  }
}

// Логика прокрутки для iOS барабана
const handleScroll = () => {
  if (!wheel.value || slots.value.length === 0) return
  const itemHeight = 40 // высота одного элемента
  const centerIndex = Math.round(wheel.value.scrollTop / itemHeight)
  if (slots.value[centerIndex]) {
    selectedTime.value = slots.value[centerIndex]
  }
}

const scrollToTime = (time) => {
  const index = slots.value.indexOf(time)
  if (index !== -1 && wheel.value) {
    wheel.value.scrollTo({ top: index * 40, behavior: 'smooth' })
  }
}

// 2. POST ЗАПРОС
const submitBooking = async () => {
  if (!selectedDate.value || !selectedTime.value) return
  isSubmitting.value = true

  try {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: '123456', first_name: 'Aks_VIP' }

    const payload = {
      chat_id: tgUser.id.toString(),
      customer_name: tgUser.first_name,
      service: selectedService.value.name, // Отправляем реальное имя услуги
      date: selectedDate.value,
      start_time: selectedTime.value,
      end_time: calculatedEndTime.value, // Отправляем точный конец
      price: selectedService.value.price.toString(),
      payment_status: "pending"
    }

    const response = await fetch(POST_BOOKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      alert('Успешно оформлено!')
      selectedDate.value = ''
      selectedTime.value = ''
      selectedService.value = null
    } else {
      alert('Ошибка при бронировании.')
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.booking-container { display: flex; flex-direction: column; padding: 20px; gap: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f2f2f7; min-height: 100vh; }
h2 { margin: 0; font-size: 24px; color: #000; font-weight: 700; }
.section-title { font-size: 14px; text-transform: uppercase; color: #6e6e73; font-weight: 600; margin-bottom: 8px; display: block; }
.form-input { width: 100%; padding: 14px; font-size: 16px; border: none; border-radius: 12px; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); box-sizing: border-box; }

/* Карточки услуг */
.services-list { display: flex; flex-direction: column; gap: 10px; }
.service-card { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px; border-radius: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 2px solid transparent; }
.service-card.active { border-color: #007aff; background: #f0f8ff; }
.srv-info { display: flex; flex-direction: column; gap: 4px; }
.srv-name { font-size: 16px; font-weight: 600; color: #000; }
.srv-details { font-size: 14px; color: #6e6e73; }
.srv-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #c7c7cc; display: flex; align-items: center; justify-content: center; }
.service-card.active .srv-radio { border-color: #007aff; }
.radio-inner { width: 12px; height: 12px; border-radius: 50%; background: #007aff; }

/* iOS Барабан */
.ios-picker-container { position: relative; height: 120px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
.picker-window { position: absolute; top: 40px; left: 0; right: 0; height: 40px; background: rgba(0, 122, 255, 0.1); border-top: 1px solid rgba(0, 122, 255, 0.3); border-bottom: 1px solid rgba(0, 122, 255, 0.3); pointer-events: none; z-index: 1; }
.picker-wheel { margin: 0; padding: 0; list-style: none; height: 120px; overflow-y: scroll; scroll-snap-type: y mandatory; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none; }
.picker-wheel::-webkit-scrollbar { display: none; }
.picker-item { height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #c7c7cc; scroll-snap-align: center; cursor: pointer; transition: 0.2s; }
.picker-item.active { color: #000; font-weight: 600; transform: scale(1.1); }
.spacer { height: 40px; }

/* Чек и кнопка */
.summary-card { background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 15px; color: #333; }
.total { border-top: 1px solid #eee; padding-top: 8px; margin-top: 4px; font-size: 18px; color: #000; }
.submit-button { background-color: #007aff; color: white; border: none; padding: 16px; font-size: 17px; font-weight: 600; border-radius: 12px; cursor: pointer; margin-top: 12px; width: 100%; }
.submit-button:disabled { opacity: 0.6; }
.loader, .error-msg { text-align: center; color: #6e6e73; padding: 20px 0; }
</style>