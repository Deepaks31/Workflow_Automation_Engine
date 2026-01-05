import axios from 'axios'


const API = axios.create({
baseURL: `${import.meta.env.VITE_API_URL}/api`
})


export const getWorkflows = () => API.get('/workflows')
export const createWorkflow = (data) => API.post('/workflows', data)
export const getApprovals = () => API.get('/approvals')
export const approveTask = (id, status) => API.post(`/approvals/${id}`, { status })
export const getLogs = () => API.get('/logs')