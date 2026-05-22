<script setup>
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  // Definición de la columna: { id, title }
  column: { type: Object, required: true },
  // Array de tareas de esta columna (referencia reactiva del store).
  list: { type: Array, required: true },
})

const emit = defineEmits(['move'])

// vuedraggable dispara `change` con uno de: added | removed | moved.
// Solo nos interesa `added`: significa que una tarjeta entró a ESTA columna,
// así que pedimos persistir su nuevo estado (el id de la columna destino).
function onChange(event) {
  if (event.added) {
    emit('move', {
      taskId: event.added.element.id,
      status: props.column.id,
    })
  }
}
</script>

<template>
  <section class="flex flex-col w-72 shrink-0 bg-slate-200/70 rounded-xl max-h-full">
    <header class="flex items-center justify-between px-3 py-2.5">
      <h2 class="text-sm font-semibold text-slate-700">{{ column.title }}</h2>
      <span class="text-xs font-medium text-slate-500 bg-slate-300/70 rounded-full px-2 py-0.5">
        {{ list.length }}
      </span>
    </header>

    <draggable
      :list="list"
      group="tasks"
      item-key="id"
      class="flex-1 overflow-y-auto px-2 pb-3 space-y-2 min-h-[60px]"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      :animation="160"
      @change="onChange"
    >
      <template #item="{ element }">
        <TaskCard :task="element" />
      </template>
    </draggable>
  </section>
</template>
