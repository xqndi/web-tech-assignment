"use strict";
// In this file, we write the server implementation
const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const w2v = require('word2vec');

const textParser = bodyParser.text();

// word model for word embeddings 
// doc model for document embeddings
let wordModel, docModel;

// TODO need good way to load model!!
// here, it could be that the model still loads 
// when we already want to use it!!
w2v.loadModel("information_retrieval/data/word_vectors.txt", function( error, model ) {
  wordModel = model;
});
w2v.loadModel("information_retrieval/data/question_entities.txt", function( error, model ) {
  docModel = model;
});

// Part 1
// For part one, we just serve the static files and a dummy endpoint to fetch data

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile('static/index.html');
});

app.post('/index-search',textParser, (req, res) => {
  const questionRanking = rankQuestions(req.body);
  res.send(questionRanking);
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
  
  sorted_list.sort((a, b) => (a.Score < b.Score) ? 1 : -1);
  return sorted_list;
}

function preprocess(originalString) {
  // Write a standard preprocessing pipeline for strings

  // TODO optimize this, could be VERY inefficient...
  let str = originalString
      // remove tags
      .replace(/(\<.*?\>)/g, "")
      // to lowercase letters
      .toLowerCase()
      // replace newlines
      .replace(/\n/g, " ")
      // remove links
      .replace(/(http:\/.*? )/g, "")
      // .replace(/'s/g, " is")
      // remove special characters
      .replace(/[^a-z|0-9|\.]/g, " ")
      // replace whitespace-chains
      .replace(/ +/g, " ");
      
  str = str.replace(/\./g, "") 
  return str.trim();
}

function rankQuestions(q) {
  const q_string = preprocess(q);

  // transform query to document-vector
  let res_arr = q_string.split(" ");
  console.log(res_arr);
  res_arr = [...new Set(res_arr)];

  const dimensions = parseInt(wordModel.size);

  const vecs = wordModel.getVectors(res_arr);

  // todo propper handling
  if (vecs.length < 1) {
    return;
  }
  // .slice() to copy by value!!
  const doc_vector = vecs[0].values.slice();

  vecs.slice(1).forEach(element => {
      for (let i = 0; i < dimensions; i++) {
          doc_vector[i] += element.values[i];
      }
  });
  const nr_elements = vecs.length;
  for (let i = 0; i < dimensions; i++) {
      doc_vector[i] /= nr_elements;
  }

  // now rank documents against our new query-vector
  const res = docModel.getNearestWords(doc_vector, 5)
  console.log(res);

  return res;
}