import axios from 'axios'


const API = axios.create({
baseURL: 'http://localhost:8080/api'
})


export const getWorkflows = () => API.get('/workflows')
export const createWorkflow = (data) => API.post('/workflows', data)
export const getApprovals = () => API.get('/approvals')
export const approveTask = (id, status) => API.post(`/approvals/${id}`, { status })
export const getLogs = () => API.get('/logs')