const axios = require("axios");

const sendVideoToLaravel = async (videoUrl, categoryID, token,description) => {
  try {
    console.log(categoryID)
    const response = await axios.post(
      "https://sherlyn-vigorous-pattie.ngrok-free.dev/api/videos",
      {
        video_url: videoUrl,
        caption: description,
        category_id: categoryID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Laravel Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending video to Laravel:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendVideoToLaravel };