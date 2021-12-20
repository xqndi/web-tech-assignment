"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');

const path = require('path');


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
        // remove special characters
        .replace(/[^a-z|0-9|\.]/g, " ")
        // replace whitespace-chains
        .replace(/ +/g, " ");
        
    str = str.split(/(?<=[.]) (?=[a-z])/);

    const res = [];
    str.forEach(element => {
        res.push(element.replace(".", " "))
        //.replace(/[^A-Z0-9]/ig, " ")
    });
    return res;
}

function createCorpus(inputFile, outputFile) {
    // Create a corpus from the input file
    // Preprocess the strings
    // Write to the output file

    // TODO change to async?
    const dataRaw = fs.readFileSync(path.resolve(__dirname, inputFile));
    const json_data = JSON.parse(dataRaw);

    // create write-stream
    // file always is erased here (!)
    const stream = fs.createWriteStream(path.resolve(__dirname, outputFile))
    
    

    for (const [key, val] of Object.entries(json_data)) {
        const res_arr = preprocess(val["Body"]);
        for (const stringey of res_arr) {
            stream.write(stringey + "\n");
        }
    }
}

function embeddings(model, cleanedString) {
    // Convert a cleaned string to an embedding representation using a pretrained model
    // E.g., by averaging the word embeddings
}

function createEmbeddings(inputFile, modelFile, outputFile) {
    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
}

// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings

// TODO remove head
createCorpus("data/Answers.json", 'data/corpus.txt');
w2v.word2vec("information_retrieval/data/corpus.txt", "information_retrieval/data/word_vectors.txt");
w2v.loadModel("information_retrieval/data/word_vectors.txt", function( error, model ) {
    console.log(model);
});
w2vcreateEmbeddings("data/Answers.csv", "data/word_vectors.txt", "data/entities.txt");
createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt");