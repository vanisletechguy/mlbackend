// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const kmeans = require('./kmeans');

const app = express();
app.use(cors());
app.use(express.json());

////////////////////////////////////////////////////////////////////////////////
// GET: OLDdata
////////////////////////////////////////////////////////////////////////////////
app.get('/OLDdata', (req, res) => {
    const results = [];
    fs.createReadStream('csvfile.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        });
});

////////////////////////////////////////////////////////////////////////////////
// GET:     /data
////////////////////////////////////////////////////////////////////////////////
app.get('/data', (req, res) => {
    const results = [];
    fs.createReadStream('csvfile.csv')
        .pipe(csv())
        .on('data', (data) => {
            // Transform the data into the expected format
            results.push({ 
                x: parseFloat(data.A), 
                y: parseFloat(data.B), 
                z: parseFloat(data.C) 
            });
        })
        .on('end', () => {
            res.json(results);
        });
});

////////////////////////////////////////////////////////////////////////////////
// POST:    /cluster-data
////////////////////////////////////////////////////////////////////////////////
//
app.post('/cluster-data', (req, res) => {
    try {
        const { data, K } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Data is empty or not in expected format');
        }

        // Check if K is provided and a number; if not, pass undefined
        const specificK = (typeof K === 'number') ? K : undefined;

        const clusteredData = kmeans(data, specificK);
        console.log("Clustered data (including centroids):", clusteredData);
        res.json(clusteredData);

    } catch (error) {
        console.error('Error in clustering data:', error);
        res.status(500).send('Error in clustering data');
    }
});

////////////////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

