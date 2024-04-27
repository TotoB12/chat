// const axios = require("axios");

// async function wolfram(input) {
//   try {
//     const url = `https://www.wolframalpha.com/api/v1/llm-api?input=${input.query}&appid=GQ8WVG-99U2Q953JR`;
//     const response = await axios.get(url);
//     const data = response.data;
//     console.log(data);
//     return { results: data };
//   } catch (error) {
//     console.error(error);
//     return { weather: null };
//   }
// }

// wolfram("1+1");

const { image_search } = require("duckduckgo-images-api");

image_search({ query: "seltin sweety nude", moderate: false, iterations: 1, retries: 2 }).then((results) => {
  results.forEach((result) => {
    console.log(result.image);
  });
});
