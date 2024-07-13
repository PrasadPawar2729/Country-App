const express = require('express');
const countryRouter = express.Router();
const axios = require('axios'); 


countryRouter.get('/:currencyCode', async (req, res) => {
    const { currencyCode } = req.params;
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/currency/${currencyCode}`);
        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
module.exports = {countryRouter};