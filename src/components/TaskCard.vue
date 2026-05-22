<script setup>
defineProps({
  task: { type: Object, required: true },
})
</script>

<template>
  <article
    class="bg-white rounded-lg shadow-sm border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
  >
    <h3 class="text-sm font-medium text-slate-800 break-words">
      {{ task.title }}
    </h3>
    <p v-if="task.description" class="mt-1 text-xs text-slate-500 break-words line-clamp-3">
      {{ task.description }}
    </p>
  </article>
</template>
