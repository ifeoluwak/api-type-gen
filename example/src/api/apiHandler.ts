import axios from 'axios';

async function handleRequest(req: any) {
  console.log({ uri: req.url });
  return req;
}

async function handleResponse(res: any) {
  return res;
}

async function handleErrorResponse(err: any) {
  return Promise.reject(err);
}

axios.interceptors.request.use(
  async req => handleRequest(req),
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  async res => handleResponse(res),
  async err => handleErrorResponse(err)
);

export default axios.create({
  // baseURL: "https://staging-api.services.befitapp.net/identity", // Replace with your actual base URL
  timeout: 5000, // Set a reasonable timeout
  headers: {
    'Content-Type': 'application/json', // Set the default content type
    accept: 'application/json',
  },
});
