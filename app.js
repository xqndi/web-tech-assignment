"use strict";
// In this file, we write the server implementation
const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const w2v = require('word2vec');
const res = require('express/lib/response');
const uuidv4 = require("uuid/v4");
const { resolve } = require('path');

const textParser = bodyParser.text();
const jsonParser = bodyParser.json();

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

app.post('/index-search', textParser, (req, res) => {
  // todo title and NOT body
  const questionRanking = rankQuestions(req.body);
  res.send(questionRanking);
});

app.get('/question/similar-questions/:qid', textParser, (req, res) => {
  const questionID = req.params.qid;
  if (!questionID) {
    res.status(400);
    res.send("invalid question-id!");
    return;
  }

  const currentQuestionVector = docModel.getVector(questionID.toString());
  const ranking = doSimilaritySearch(currentQuestionVector);

  // the question itself is of course most similar to itself
  // but we don't want to recommend the same question again
  // that's why we remove it from here
  delete ranking[questionID.toString() + "f"]
  res.send(ranking);
});

// TODO right path
// TODO change to <POST/GET>
app.get('/new', (req, res) => {
  res.sendFile(__dirname + '/static/new.html');
});

// TODO right path
app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/static/about.html');
});

app.post('/question/submit-answer', jsonParser, function (request, response) {
  const newObj = request.body;

  // TODO parse json-files once and not all the time...
  let AllAnswersJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/Answers_head.json"
    )));

  // generate (unique) key for new Answers / Questions
  AllAnswersJson[uuidv4()] = newObj;

  fs.writeFileSync(path.resolve(__dirname,
    "information_retrieval/data/Answers_head.json"),
    JSON.stringify(AllAnswersJson));

  // TODO what to send
  response.send("all good (?)");
});

app.post('/question/submit-question', jsonParser, function (request, response) {
  const newObj = request.body;

  // create w2v-representation for our new question-doc
  const qVector = createW2vForNewQuestion(newObj["Body"]);
  // TODO good handling
  if (!qVector) {
    response.send("couldn't create vector for question...");
    return;
  }

  // TODO parse json-files once and not all the time...
  let allQuestionsJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/Questions_head.json"
    )));

  const generatedKey = uuidv4();
  // generate (unique) key for new Answers / Questions
  allQuestionsJson[generatedKey] = newObj;

  fs.writeFileSync(path.resolve(__dirname,
    "information_retrieval/data/Questions_head.json"),
    JSON.stringify(allQuestionsJson));

  let fileData = fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/question_entities.txt"),
    {encoding: 'utf8', flag: 'r'}
    );
  let fileLines = fileData.split("\n");
  let nrLines = parseInt(fileLines[0].split(" ")[0]) + 1;
  console.log(nrLines);
  fileData = fileData.replace(/.+(?= )/, nrLines.toString());

  fileData += 
    generatedKey.toString() + " " + 
    qVector.toString().replace(/,/g, " ") +
    "\n";
    
  fs.writeFileSync(path.resolve(__dirname,
    "information_retrieval/data/question_entities.txt"),
    fileData);

  // TODO this seems very stupid
  w2v.loadModel("information_retrieval/data/question_entities.txt", function( error, model ) {
    docModel = model;
    // TODO what to send
    response.send(generatedKey);
    return;
  });
});


const data = require(path.resolve(
  __dirname, 'information_retrieval/data/Questions_head.json'));

app.get('/test', (req, res) => {

  var ranked_articles = rankArticles(data);

  res.send(ranked_articles.map(Title =>
    `<a href="http://localhost:3000/redirect_to_question.html">${Title.Title}</a><br>`).join(''));

})

app.get('/question/:qid', (req, res) => {
  res.sendFile(__dirname + "/static/question.html");
})



app.get('/q/:qid', (req, res) => {
  // res.send('Page for ' + req.params.qid);
  const questionID = req.params.qid;
  if (!questionID) {
    res.status(400);
    res.send("invalid question-id!");
    return;
  }

  const questionsJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/Questions_head.json"
    )));

  const answersJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/Answers_head.json"
    )));

    const jsonRes = {};

    // find question
    const q = questionsJson[questionID];
    jsonRes[[questionID]] = q;

    // then find its respective answers
    for (const [key, val] of Object.entries(answersJson)) {
      if (val["ParentId"] == questionID) {
        jsonRes[[key]] = val;
      }
    }
    res.json(jsonRes);
});

// Part 2
// We create embeddings of the query and use it for a similarity search on the pretrained document embeddings

app.get('/search', (req, res) => {
  res.send('API for ' + req.query["query"]);
});

app.get('/sim/:qid', (req, res) => {
  res.send('API for ' + req.params.qid);
});

// handling of missing sites
// TODO which way
app.get("/*", function (req, res, next) {
  // res.status(404).send('The requested resource/page was not found');
  res.sendFile(__dirname + '/static/404.html');
})

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
  const doc_vector = createW2vForNewQuestion(q);
  return doSimilaritySearch(doc_vector);
}

function createW2vForNewQuestion(q) {
  const q_string = preprocess(q);

  // transform query to document-vector
  let res_arr = q_string.split(" ");
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
  return doc_vector;
}

function doSimilaritySearch(doc_vector) {
  // now rank documents against our new query-vector
  const nearestVectors = docModel.getNearestWords(doc_vector, 5)

  const jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    "information_retrieval/data/Questions_head.json"
    )));

  let res = {};
  nearestVectors.forEach(jsonElement => {
    // this is so thrashy
    res[jsonElement["word"] + "f"] = jsonData[jsonElement["word"]]["Title"];
  });

  return res;
}