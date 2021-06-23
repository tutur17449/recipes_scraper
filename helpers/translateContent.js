const axios = require("axios");

// ****************************************************
// @desc    Get french traduction from string
// ****************************************************
exports.getTraduction = async (data) => {
  const options = {
    method: "POST",
    url: "https://api.reverso.net/translate/v1/translation",
    data: {
      format: "text",
      from: "eng",
      input: data,
      options: {
        origin: "reversomobile",
        sentenceSplitter: false,
        contextResults: true,
        languageDetection: true,
      },
      to: "fra",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.translation[0];
  } catch (err) {
    throw err;
  }
};
