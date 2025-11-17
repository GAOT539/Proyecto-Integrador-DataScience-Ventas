import { fetchData } from "../services/api.service.js";

export const getExternalData = async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener datos",
      error: error.message
    });
  }
};
