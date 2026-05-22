<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')

// Solo permitimos correos @gmail.com, según el requerimiento del login simulado.
const isGmail = computed(() => /^[^\s@]+@gmail\.com$/i.test(email.value.trim()))

async function handleSubmit() {
  if (!isGmail.value) return
  const ok = await auth.login(email.value.trim())
  if (ok) {
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
      <div class="flex items-center gap-2 mb-6">
        <div class="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
          T
        </div>
        <h1 class="text-2xl font-bold text-slate-800">Tablo</h1>
      </div>

      <p class="text-sm text-slate-500 mb-6">
        Ingresa con tu correo de Gmail para entrar a tus tableros.
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
            Correo Gmail
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="tucorreo@gmail.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            :disabled="auth.loading"
          />
          <p v-if="email && !isGmail" class="mt-1 text-xs text-red-500">
            Debe ser un correo válido @gmail.com
          </p>
        </div>

        <p v-if="auth.error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {{ auth.error }}
        </p>

        <button
          type="submit"
          :disabled="!isGmail || auth.loading"
          class="w-full rounded-lg bg-blue-600 text-white font-medium py-2.5 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ auth.loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>
