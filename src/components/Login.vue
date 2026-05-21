<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-success'])

const email = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!email.value) return
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('http://api-ta-publi-pd7ev4ypjzty-1383114515.us-east-2.elb.amazonaws.com/auth/login', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })

    if (!response.ok) {
      throw new Error('Error al autenticar')
    }

    const data = await response.json()
    // Emitimos la respuesta exitosa al componente padre (App.vue)
    emit('login-success', data)
  } catch (err) {
    error.value = 'Ocurrió un error. Verifica el correo o tu conexión.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-card">
    <h2>Iniciar Sesión</h2>
    <p class="subtitle">Ingresa tu email para continuar</p>
    
    <form @submit.prevent="handleLogin">
      <input 
        type="email" 
        v-model="email" 
        placeholder="ej. yeison@gmail.com" 
        required 
      />
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Autenticando...' : 'Entrar' }}
      </button>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 350px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
  background: white;
}
.subtitle {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 20px;
}
input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1em;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #3aa876;
}
button:disabled {
  background-color: #a0d8c0;
  cursor: not-allowed;
}
.error {
  color: #d9534f;
  margin-top: 15px;
  font-size: 0.9em;
}
</style>
