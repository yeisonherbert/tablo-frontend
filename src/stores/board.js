import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { projectsApi, tasksApi } from '@/services/api'

// Definición de las 4 columnas del tablero Kanban.
// El `id` coincide con el valor de `status` que entiende el backend.
export const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'to_do', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

const EMPTY_LISTS = () => ({
  backlog: [],
  to_do: [],
  in_progress: [],
  completed: [],
})

export const useBoardStore = defineStore('board', () => {
  const projects = ref([])
  const currentProject = ref(null)
  // Una lista (array) por columna; vuedraggable hace v-model sobre cada una.
  const lists = reactive(EMPTY_LISTS())
  const loading = ref(false)
  const error = ref('')

  // Reparte las tareas del proyecto en sus columnas según el `status`.
  function groupTasks(tasks = []) {
    const grouped = EMPTY_LISTS()
    for (const task of tasks) {
      const bucket = grouped[task.status] ? task.status : 'backlog'
      grouped[bucket].push(task)
    }
    for (const col of COLUMNS) {
      lists[col.id] = grouped[col.id]
    }
  }

  async function fetchProjects() {
    loading.value = true
    error.value = ''
    try {
      projects.value = await projectsApi.list()
      return projects.value
    } catch (e) {
      error.value = e.response?.data?.detail || 'No se pudieron cargar los proyectos.'
      return []
    } finally {
      loading.value = false
    }
  }

  async function selectProject(projectId) {
    loading.value = true
    error.value = ''
    try {
      currentProject.value = await projectsApi.get(projectId)
      groupTasks(currentProject.value.tasks)
    } catch (e) {
      error.value = e.response?.data?.detail || 'No se pudo cargar el proyecto.'
    } finally {
      loading.value = false
    }
  }

  async function createProject(name) {
    const project = await projectsApi.create({ name })
    projects.value.push(project)
    await selectProject(project.id)
    return project
  }

  async function createTask({ title, description = '' }) {
    if (!currentProject.value) return
    const task = await projectsApi.createTask(currentProject.value.id, {
      title,
      description,
    })
    // Toda tarea nace en 'backlog'.
    lists.backlog.push(task)
    return task
  }

  // Persiste el cambio de columna. La UI ya movió la tarjeta (v-model de
  // vuedraggable); aquí solo confirmamos el nuevo estado en el backend.
  // Si falla, recargamos el proyecto para no quedar desincronizados.
  async function moveTask(taskId, newStatus) {
    try {
      const updated = await tasksApi.updateStatus(taskId, newStatus)
      // Mantenemos en memoria el objeto que devuelve el backend.
      const list = lists[newStatus]
      const idx = list.findIndex((t) => t.id === taskId)
      if (idx !== -1) list[idx] = { ...list[idx], ...updated }
      return true
    } catch (e) {
      error.value = e.response?.data?.detail || 'No se pudo mover la tarea.'
      if (currentProject.value) await selectProject(currentProject.value.id)
      return false
    }
  }

  // Localiza una tarea en sus columnas. Devuelve { list, idx } o null.
  function findTask(taskId) {
    for (const col of COLUMNS) {
      const idx = lists[col.id].findIndex((t) => t.id === taskId)
      if (idx !== -1) return { list: lists[col.id], idx }
    }
    return null
  }

  // PUT /tasks/{id}/details — edita título y descripción.
  async function updateTaskDetails(taskId, { title, description }) {
    try {
      const updated = await tasksApi.updateDetails(taskId, { title, description })
      const found = findTask(taskId)
      if (found) found.list[found.idx] = { ...found.list[found.idx], ...updated }
      return true
    } catch (e) {
      error.value = e.response?.data?.detail || 'No se pudo actualizar la tarea.'
      return false
    }
  }

  // DELETE /tasks/{id} — borrado optimista; si falla, recargamos el proyecto.
  async function deleteTask(taskId) {
    const found = findTask(taskId)
    const removed = found ? found.list.splice(found.idx, 1)[0] : null
    try {
      await tasksApi.remove(taskId)
      return true
    } catch (e) {
      error.value = e.response?.data?.detail || 'No se pudo eliminar la tarea.'
      // Restauramos lo que quitamos para no perder la tarjeta en pantalla.
      if (found && removed) found.list.splice(found.idx, 0, removed)
      return false
    }
  }

  function reset() {
    projects.value = []
    currentProject.value = null
    Object.assign(lists, EMPTY_LISTS())
    error.value = ''
  }

  return {
    projects,
    currentProject,
    lists,
    loading,
    error,
    fetchProjects,
    selectProject,
    createProject,
    createTask,
    moveTask,
    updateTaskDetails,
    deleteTask,
    reset,
  }
})
