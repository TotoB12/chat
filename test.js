const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env['CO_API_KEY0'],
});

(async () => {
  const response = await cohere.chat({
    chatHistory: [],
    message: 'hi',
    // perform web search before answering the question. You can also use your own custom connector.
    // connectors: [{ id: 'web-search' }],
  });

  console.log(response);
})();
