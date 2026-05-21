<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'

const session = ref(null)

const onLoginSuccess = (data) => {
  session.value = data
}

const logout = () => {
  session.value = null
}
</script>

<template>
  <div class="app-layout">
    <!-- Si la sesión no existe, mostramos el título base y el componente de login -->
    <div v-if="!session">
      <h1 class="main-title">Hola Mundo</h1>
      <Login @login-success="onLoginSuccess" />
    </div>
    
    <!-- Si la sesión existe, mostramos el perfil del usuario -->
    <div v-else class="profile-card">
      <h2>¡Bienvenido, {{ session.user.name }}!</h2>
      <img :src="session.user.avatar_url" alt="Avatar de usuario" class="avatar" />
      
      <div class="user-info">
        <p><strong>ID:</strong> {{ session.user.id }}</p>
        <p><strong>Email:</strong> {{ session.user.email }}</p>
      </div>
      
      <!-- Token de acceso acortado (opcional - para mostrar que obtuvimos la data) -->
      <p class="token-info">Autenticado correctamente usando Bearer Token.</p>
      
      <button @click="logout" class="logout-button">Cerrar Sesión</button>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.main-title {
  color: #42b983;
  text-align: center;
  margin-bottom: 40px;
}

.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.avatar {
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin: 15px 0;
  border: 4px solid #42b983;
}

.user-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}

.user-info p {
  margin: 5px 0;
  font-size: 0.9em;
}

.token-info {
  font-size: 0.8em;
  color: #888;
  margin-bottom: 20px;
}

.logout-button {
  padding: 10px 20px;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

.logout-button:hover {
  background-color: #c9302c;
}
</style>
