const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword;

  try {
    const response = await axios.get(`https://www.amazon.com/s?k=${keyword}`);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const products = Array.from(document.querySelectorAll('.s-result-item'))
      .map(product => {
        const title = product.querySelector('h2 a span')?.textContent || 'NotFound';
        const rating = product.querySelector('.a-icon-alt')?.textContent.split(' ')[0] || 'NotFound';
        const numberOfReviews = product.querySelector('.a-size-small .a-size-base')?.textContent || 'NotFound';
        const imageUrl = product.querySelector('.s-image')?.src || 'NotFound';

        return { title, rating, numberOfReviews, imageUrl };
      }).filter(product => product.title !== 'NotFound');

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Could not scrape Amazon :(' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});
