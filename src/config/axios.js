import axios from "axios";
const openRouterApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer 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`,
    'HTTP-Referer': 'www.cvccleaning.co.uk',
    'X-Title':'Alex'
  }
});

export default openRouterApi;