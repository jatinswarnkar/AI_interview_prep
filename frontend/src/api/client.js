import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API endpoints matching Django backend routes.
 */
export const createSession = () => client.post('/sessions/');

export const getSession = (id) => client.get(`/sessions/${id}/`);

export const deleteSession = (id) => client.delete(`/sessions/${id}/`);

export const uploadResume = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/sessions/${id}/resume/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const submitJobDescription = (id, rawText) => {
  return client.post(`/sessions/${id}/job-description/`, { raw_text: rawText });
};

export const runAnalysis = (id) => {
  return client.post(`/sessions/${id}/analyze/`);
};

export default client;
