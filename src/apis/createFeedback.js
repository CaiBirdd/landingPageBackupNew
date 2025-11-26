import http from '../utils/http'

export const createFeedbackAPI = (data) => http.post('/api/v1/feedback/', data)

