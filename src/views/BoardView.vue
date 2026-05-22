<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore, COLUMNS } from '@/stores/board'
import BoardColumn from '@/components/BoardColumn.vue'

const auth = useAuthStore()
const board = useBoardStore()
const router = useRouter()

const { projects, currentProject, lists, loading, error } = storeToRefs(board)

const newTaskTitle = ref('')

onMounted(async () => {
  const list = await board.fetchProjects()
  if (list.length) {
    await board.selectProject(list[0].id)
  }
})

async function onProjectChange(event) {
  await board.selectProject(event.target.value)
}

async function handleCreateProject() {
  const name = window.prompt('Nombre del nuevo proyecto:')
  if (name?.trim()) await board.createProject(name.trim())
}

async function handleAddTask() {
  const title = newTaskTitle.value.trim()
  if (!title) return
  await board.createTask({ title })
  newTaskTitle.value = ''
}

// Disparado por BoardColumn cuando una tarjeta entra en una columna nueva.
// Persiste el cambio de estado de forma asíncrona vía PATCH /tasks/{id}.
function handleMove({ taskId, status }) {
  board.moveTask(taskId, status)
}

function handleLogout() {
  auth.logout()
  board.reset()
  router.replace('/login')
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Barra superior -->
    <header class="flex items-center justify-between gap-4 px-4 py-3 bg-blue-700 text-white shadow">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
          T
        </div>
        <span class="text-lg font-bold">Tablo</span>

        <select
          v-if="projects.length"
          class="ml-3 rounded-md bg-blue-600 border border-blue-400 px-2 py-1.5 text-sm outline-none"
          :value="currentProject?.id"
          @change="onProjectChange"
        >
          <option v-for="p in projects" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>

        <button
          class="ml-1 rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-sm transition"
          @click="handleCreateProject"
        >
          + Proyecto
        </button>
      </div>

      <div class="flex items-center gap-3 text-sm">
        <span class="hidden sm:inline opacity-90">{{ auth.user?.email }}</span>
        <button
          class="rounded-md bg-white/15 hover:bg-white/25 px-3 py-1.5 transition"
          @click="handleLogout"
        >
          Salir
        </button>
      </div>
    </header>

    <p v-if="error" class="bg-red-50 text-red-700 text-sm px-4 py-2">{{ error }}</p>

    <!-- Sin proyectos -->
    <div
      v-if="!loading && !projects.length"
      class="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-500"
    >
      <p>Aún no tienes proyectos.</p>
      <button
        class="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
        @click="handleCreateProject"
      >
        Crear mi primer proyecto
      </button>
    </div>

    <!-- Tablero -->
    <main v-else class="flex-1 flex flex-col overflow-hidden">
      <div class="px-4 pt-3">
        <form class="flex gap-2 max-w-md" @submit.prevent="handleAddTask">
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="Nueva tarea (entra en Backlog)…"
            class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            :disabled="!currentProject"
          />
          <button
            type="submit"
            :disabled="!currentProject || !newTaskTitle.trim()"
            class="rounded-lg bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            Añadir
          </button>
        </form>
      </div>

      <div class="flex-1 flex gap-4 overflow-x-auto p-4">
        <BoardColumn
          v-for="col in COLUMNS"
          :key="col.id"
          :column="col"
          :list="lists[col.id]"
          @move="handleMove"
        />
      </div>
    </main>
  </div>
</template>
