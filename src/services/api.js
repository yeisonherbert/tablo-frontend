import http from './http'

// Capa fina sobre los endpoints REST de Tablo.
// Cada función devuelve directamente el `data` de la respuesta.

export const authApi = {
  // POST /auth/login  ->  { access_token, token_type }
  login(email) {
    return http.post('/auth/login', { email }).then((r) => r.data)
  },
}

export const projectsApi = {
  // GET /projects -> Project[]
  list() {
    return http.get('/projects').then((r) => r.data)
  },

  // POST /projects -> Project
  create(payload) {
    return http.post('/projects', payload).then((r) => r.data)
  },

  // GET /projects/{id} -> Project con participantes y tareas
  get(projectId) {
    return http.get(`/projects/${projectId}`).then((r) => r.data)
  },

  // POST /projects/{id}/members -> Project | Member
  addMember(projectId, email) {
    return http.post(`/projects/${projectId}/members`, { email }).then((r) => r.data)
  },

  // POST /projects/{id}/tasks -> Task (nace en 'backlog')
  createTask(projectId, payload) {
    return http.post(`/projects/${projectId}/tasks`, payload).then((r) => r.data)
  },
}

export const tasksApi = {
  // PATCH /tasks/{id} -> Task con el nuevo estado
  updateStatus(taskId, status) {
    return http.patch(`/tasks/${taskId}`, { status }).then((r) => r.data)
  },

  // PUT /tasks/{id}/details -> Task con título/descripción actualizados
  updateDetails(taskId, payload) {
    return http.put(`/tasks/${taskId}/details`, payload).then((r) => r.data)
  },

  // DELETE /tasks/{id}
  remove(taskId) {
    return http.delete(`/tasks/${taskId}`).then((r) => r.data)
  },
}
