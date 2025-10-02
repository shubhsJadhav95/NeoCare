import { useEffect, useState } from "react";
import { token } from "../config.js";

const useFetchData = (url) => {
  // Backend requests disabled for frontend-only development
  const [data] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);
  // Optionally, you can set mock data here for testing UI
  return { data, loading, error };
};

export default useFetchData;
