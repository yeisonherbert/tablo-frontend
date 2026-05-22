<script setup>
import { ref, nextTick } from 'vue'
import { useBoardStore } from '@/stores/board'

const props = defineProps({
  task: { type: Object, required: true },
})

const board = useBoardStore()

const editing = ref(false)
const saving = ref(false)
const draftTitle = ref('')
const draftDescription = ref('')
const titleInput = ref(null)

async function startEdit() {
  draftTitle.value = props.task.title
  draftDescription.value = props.task.description || ''
  editing.value = true
  await nextTick()
  titleInput.value?.focus()
}

function cancelEdit() {
  editing.value = false
}

async function saveEdit() {
  const title = draftTitle.value.trim()
  if (!title || saving.value) return
  saving.value = true
  const ok = await board.updateTaskDetails(props.task.id, {
    title,
    description: draftDescription.value.trim(),
  })
  saving.value = false
  if (ok) editing.value = false
}

async function removeTask() {
  if (!window.confirm(`¿Eliminar la tarea "${props.task.title}"?`)) return
  await board.deleteTask(props.task.id)
}
</script>

<template>
  <!-- Modo edición: formulario inline. @mousedown.stop evita que arranque el drag. -->
  <article
    v-if="editing"
    class="bg-white rounded-lg shadow-sm border border-blue-300 ring-2 ring-blue-200 p-3"
    @mousedown.stop
  >
    <form class="space-y-2" @submit.prevent="saveEdit">
      <input
        ref="titleInput"
        v-model="draftTitle"
        type="text"
        placeholder="Título"
        class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <textarea
        v-model="draftDescription"
        rows="3"
        placeholder="Descripción (opcional)"
        class="w-full resize-none rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      ></textarea>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 transition"
          @click="cancelEdit"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="!draftTitle.trim() || saving"
          class="rounded-md bg-blue-600 text-white px-2.5 py-1 text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  </article>

  <!-- Modo vista -->
  <article
    v-else
    class="group relative bg-white rounded-lg shadow-sm border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
  >
    <h3 class="text-sm font-medium text-slate-800 break-words pr-12">
      {{ task.title }}
    </h3>
    <p v-if="task.description" class="mt-1 text-xs text-slate-500 break-words line-clamp-3">
      {{ task.description }}
    </p>

    <!-- Acciones: visibles al pasar el cursor. @mousedown.stop evita el drag. -->
    <div
      class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition"
    >
      <button
        type="button"
        title="Editar tarea"
        class="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
        @mousedown.stop
        @click.stop="startEdit"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.506l-3.06.84a.5.5 0 0 1-.614-.614l.84-3.06a2 2 0 0 1 .506-.878l8.5-8.5Z" />
        </svg>
      </button>
      <button
        type="button"
        title="Eliminar tarea"
        class="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
        @mousedown.stop
        @click.stop="removeTask"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 2a1 1 0 0 0-.894.553L6.382 4H4a1 1 0 0 0 0 2h.05l.81 9.717A2 2 0 0 0 6.853 18h6.294a2 2 0 0 0 1.993-1.283L15.95 6H16a1 1 0 1 0 0-2h-2.382l-.724-1.447A1 1 0 0 0 12 2H8Zm1 5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0V7Zm-2.5.5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6Zm5 0a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </article>
</template>
