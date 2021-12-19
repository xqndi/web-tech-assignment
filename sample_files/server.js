"use strict";
// In this file, we write the server implementation
const express = require('express');
const app = express();
const port = 3000;

// Part 1
// For part one, we just serve the static files and a dummy endpoint to fetch data

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendfile('static/index.html');
});

app.get('/q/:qid', (req, res) => {
  res.send('Page for ' + req.params.qid);
});

// Part 2
// We create embeddings of the query and use it for a similarity search on the pretrained document embeddings

app.get('/search', (req, res) => {
  res.send('API for ' + req.query["query"]);
});

app.get('/sim/:qid', (req, res) => {
  res.send('API for ' + req.params.qid);
});
