"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');

const path = require('path');
const model = require('word2vec/lib/model');


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

function createCorpus(inputFile, outputFile) {
    // Create a corpus from the input file
    // Preprocess the strings
    // Write to the output file

    const dataRaw = fs.readFileSync(path.resolve(__dirname, inputFile));
    const json_data = JSON.parse(dataRaw);

    // create write-stream
    // file always is erased here (!)
    const stream = fs.createWriteStream(path.resolve(__dirname, outputFile))
    
    

    for (const [key, val] of Object.entries(json_data)) {
        const res_arr = preprocess(val["Body"]);
/*         for (const stringey of res_arr) {
            stream.write(stringey + "\n");
        } */
        stream.write(res_arr + "\n");
        /* stream.write(res_arr); */
    }
}

function createEmbeddings(inputFile, w2v_model, outputFile) {
    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
        // TODO change to async?
        const dataRaw = fs.readFileSync(path.resolve(__dirname, inputFile));
        const json_data = JSON.parse(dataRaw);
    
        // create write-stream
        // todo!! file always is erased here (!)
        const stream = fs.createWriteStream(path.resolve(__dirname, outputFile))

        const dimensions = parseInt(w2v_model.size);

        const doc_embeddings = [];
        for (const [key, val] of Object.entries(json_data)) {
            let res_arr = preprocess(val["Body"]);
            res_arr = res_arr.split(" ");
            res_arr = [...new Set(res_arr)];

            const vecs = w2v_model.getVectors(res_arr);

            // TODO this can throw an error if minCount is too high
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
            doc_embeddings.push([key, doc_vector]);
        }
        stream.write(doc_embeddings.length + " " + dimensions + "\n");
        doc_embeddings.forEach(obj => {
            stream.write(
                obj[0] + " " + 
                obj[1].toString().replace(/,/g, " ") + 
                "\n");
        });
}

// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings

// TODO remove head
// TODO why create corpus only with answers?
createCorpus("data/Answers_head.json", 'data/corpus.txt');
w2v.word2vec("information_retrieval/data/corpus.txt",
 "information_retrieval/data/word_vectors.txt",
 );

w2v.loadModel("information_retrieval/data/word_vectors.txt", function( error, model ) {
    createEmbeddings("data/Answers_head.json", model, 
    "data/answer_entities.txt");
    createEmbeddings("data/Questions_head.json", model, 
    "data/question_entities.txt");
});
/* createEmbeddings("data/Questions.json", "data/word_vectors.txt",
 "data/entities.txt"); */