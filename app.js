"use strict";
// In this file, we write the server implementation
const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');
const path = require('path');

// Part 1
// For part one, we just serve the static files and a dummy endpoint to fetch data

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile('static/index.html');
});

const data = require(path.resolve(
  __dirname, 'static/test.json'));

app.get('/test', (req, res) => {

  var ranked_articles = rankArticles(data);

  res.send(ranked_articles.map(Title =>
    `<a href="http://localhost:3000/redirect_to_question.html">${Title.Title}</a><br>`).join(''));

})



app.get('/question', (req, res) => {
  res.sendFile('/home/oliver/Desktop/web-tech-assignment/static/question.html');
})



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

function rankArticles(inputFile) {
  
  //const json_data = JSON.parse(inputFile);

  
  var sorted_list = Object.keys(inputFile).map(key => inputFile[key]);
  
  sorted_list.sort((a, b) => (a.Score > b.Score) ? 1 : -1);
  return sorted_list;
}