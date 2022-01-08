"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');

const path = require('path');
const model = require('word2vec/lib/model');
const res = require('express/lib/response');


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
        const dataRaw = fs.readFileSync(path.resolve(__dirname, inputFile));
        const json_data = JSON.parse(dataRaw);
    
        // create write-stream
        const stream = fs.createWriteStream(path.resolve(__dirname, outputFile))

        const dimensions = parseInt(w2v_model.size);

        const doc_embeddings = [];
        const totalLength = Object.entries(json_data).length;
        let progressCtr = 0;
        for (const [key, val] of Object.entries(json_data)) {
            console.log(progressCtr.toString() + " / " + totalLength.toString());
            let res_arr = preprocess(val["Body"]);
            res_arr = res_arr.split(" ");
            res_arr = [...new Set(res_arr)];

            const vecs = w2v_model.getVectors(res_arr);

            if (vecs.length == 0) {
                // TODO we have un real problemo here
                // what do we do
                console.log("no word vectors for body found");
                continue;
            }

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
            progressCtr++;
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
createCorpus("data/Answers.json", 'data/corpus.txt');

let readyToLoad = false;

w2v.word2vec(
    "information_retrieval/data/corpus.txt",
    "information_retrieval/data/word_vectors.txt", 
    {}, 
    // callback function to save resulting model to file
    function() {
        console.log("done training model");
        readyToLoad = true;
});

// wait until the above calculations are done...
function wait(){
    if (readyToLoad == false){
      setTimeout(wait,100);
    } else {
        w2v.loadModel("information_retrieval/data/word_vectors.txt", function( error, model ) {
            console.log("creating embeddings");
            createEmbeddings("data/Questions.json", model, 
            "data/entities.txt");
            console.log("all done now");
        });
    }
}
wait();

