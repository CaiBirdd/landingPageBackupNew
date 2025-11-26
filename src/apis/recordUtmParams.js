import http from '../utils/http'

export const recordUtmParamsAPI = (data) => http.post('/api/v1/utm/track', data)

