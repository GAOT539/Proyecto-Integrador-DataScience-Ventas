import axios from "axios";

export const fetchData = async () => {
  const url = "https://api.publicapis.org/entries"; // ejemplo
  const response = await axios.get(url);
  return response.data;
};
