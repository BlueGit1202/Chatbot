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