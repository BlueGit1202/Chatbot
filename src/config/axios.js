import axios from "axios";
const apiKey = import.meta.env.VITE_API_KEY
const openRouterApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'www.cvccleaning.co.uk',
    'X-Title':'Alex'
  }
});

export default openRouterApi;