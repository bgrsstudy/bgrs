const express = require('express');
const Groq = require('groq-sdk');
const client = new Groq({ apiKey: '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' });

const app = express();
const port = 3000;

// Array to store responses
const searchHistory = [];

app.use(express.static('public'));

// Main route
app.get('/', async (req, res) => {
  const searchTerm = req.query.query || '';
  let formattedResponses = '';

  if (searchTerm.toLowerCase() === 'clear chat') {
    // Clear chat history if the search term is "clear chat"
    searchHistory.length = 0;
    formattedResponses = `
      <div class="response-container">
        <h2>Chat has been cleared.</h2>
      </div>
    `;
  } else if (searchTerm) {
    try {
      const chatCompletion = await client.chat.completions.create({
        "messages": [{ "role": "user", "content": searchTerm }],
        "model": "llama3-70b-8192",
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": true,
        "stop": null
      });

      let responseText = '';
      for await (const chunk of chatCompletion) {
        responseText += chunk.choices[0]?.delta?.content || '';
      }

      responseText = responseText.replace(/\*\*/g, '').trim();

      // Save response to search history
      searchHistory.push({ term: searchTerm, response: responseText });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
      return;
    }
  } else {
    // Welcome message when no search term is provided
    formattedResponses = `
      <div class="response-container">
        <h2>Welcome to the Chatbot </h2>
        <p>Type a query in the search box below and press Search to get started!</p>
      </div>
    `;
  }

  // Generate HTML for all saved responses if available
  if (searchHistory.length > 0) {
    formattedResponses += searchHistory.map((entry, index) => `
      <div class="response-container">
        <h2>Response ${index + 1}: ${entry.term}</h2>
        <ul>
          ${entry.response.split('\n').map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  res.send(`
    <html>
      <head>
     <style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #eef2f5;
    margin: 0;
    padding: 20px;
    color: #333;
  }
  
  h1 {
    text-align: center;
    font-size: 28px;
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 30px;
  }
  
  .scroll-container {
    max-height: 400px;
    overflow-y: auto;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .scroll-container:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .response-container h2 {
    font-weight: 600;
    font-size: 18px;
    color: #34495e;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
    line-height: 1.6;
  }

  li {
    margin-bottom: 8px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .search-container {
    margin-top: 20px;
    text-align: center;
  }

  .search-container input[type="text"] {
    width: 80%;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccd1d9;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease;
  }

  .search-container input[type="text"]:focus {
    border-color: #3498db;
    outline: none;
  }

  .search-container button {
    padding: 10px 20px;
    font-size: 16px;
    color: #fff;
    background-color: #3498db;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .search-container button:hover {
    background-color: #2980b9;
  }
</style>

      </head>
      <body>
        <h1>Bgrs Gpt</h1>
        
        <div class="scroll-container">
          ${formattedResponses}
        </div>
        <div class="search-container">
          <form action="/" method="get">
            <input type="text" name="query" placeholder="Search...">
            <button type="submit">Search</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
