import axios from 'axios';

const BASE_URL = 'http://localhost:8085/api/pharmafast';

export const submitDeliveryRequest = async (payload) => {
  const res = await axios.post(`${BASE_URL}/submit-request`, payload);
  return res.data;
};

export const getNearbyStores = async ({ latitude, longitude, radiusKm = 5 }) => {
  const res = await axios.get(`${BASE_URL}/nearby-stores`, {
    params: { latitude, longitude, radiusKm }
  });
  return res.data;
};
