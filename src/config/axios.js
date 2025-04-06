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