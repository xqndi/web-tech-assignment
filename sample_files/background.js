"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');

function preprocess(originalString) {
    // Write a standard preprocessing pipeline for strings
    return "";
}

function createCorpus(inputFile, outputFile) {
    // Create a corpus from the input file
    // Preprocess the strings
    // Write to the output file
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
createCorpus("data/Answers.json", 'data/corpus.txt');
w2v.word2vec("data/corpus.txt", "data/word_vectors.txt");
createEmbeddings("data/Answers.csv", "data/word_vectors.txt", "data/entities.txt");
createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt");
