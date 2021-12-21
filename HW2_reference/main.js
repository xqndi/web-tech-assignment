const CORPUS = "We propose two novel model architectures for computing continuous vector representations of words from very large data sets. The quality of these representations is measured in a word similarity task, and the results are compared to the previously best performing techniques based on different types of neural networks. We observe large improvements in accuracy at much lower computational cost, i.e. it takes less than a day to learn high quality word vectors from a 1.6 billion words data set. Furthermore, we show that these vectors provide state-of-the-art performance on our test set for measuring syntactic and semantic word similarities."

function preprocess(corpus) {
    // Question 11
    const docs = corpus.split(/(?<=[.]) (?=[^a-z])/);

    // Question 12
    docs.forEach((value, index) => {
        docs[index] = value
            .replace(/[.,-]/g, " ")
            .toLowerCase()
            .replace(/(?<=[^ ])(ies|y|ed|ing|s)(?= )/g, "");
    });
    console.log(docs);

    // Question 13
    docs.forEach((value, index) => {
        docs[index] = value
            // remove blocks of whitespaces and trailing whitespaces
            .replace(/  +/g, " ")
            .replace(/ $/g, "")
            // now simply tokenize by whitespaces
            .split(" ");
    });

    // Question 14
    const bows = [];
    docs.forEach((value, index) => {
        let bow_map = new Map();
        value.forEach((token) => {
            const ctr = bow_map.get(token);
            if (ctr) {
                bow_map.set(token, ctr+1);
            } else {
                bow_map.set(token, 1);
            }
        });
        bows.push(bow_map);
    });

    return bows;
}

// Question 15
function calculateIDF(word, docs) {
    const D_len = docs.length;
    let df = 0;
    for (const doc of docs) {
        if (doc.get(word)) { df++; }
    }
    if (df === 0) {
        return -1;
    }

    return Math.log10(D_len / df);
}

// Question 16
function calculateTF_IDF(docs, q) {
    let all_words = [];
    if (!q) {
        // create bag-of-words-vector
        for (const doc of docs) {
            for (const key of doc.keys()) {
                all_words.push(key);
            }
        }
    } else {
        all_words = Array.from(q[0].keys());
    }
    // make elements unique
    all_words = all_words.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    // calculate idf for every word
    const idf_map = new Map();
    for (const word of all_words) {
        const idf = calculateIDF(word, docs);
        idf_map.set(word, idf);
    }
    // console.log(idf_map);

    const all_doc_vectors = [];
    if (q) {
        const tf_idf_vector = new Map();
        idf_map.forEach(function (idf, key) {
            // TODO tf of query-terms - 1 or log10(2) ???
            const tf = Math.log10(1 + 1);
            tf_idf_vector.set(key, tf * idf);
        });
        all_doc_vectors.push(tf_idf_vector);
    }
    for (const doc of docs) {
        const tf_idf_vector = new Map();
        idf_map.forEach(function (idf, key) {
            let freq = doc.get(key);
            if (!freq) {
                freq = 0;
            }
            const tf = Math.log10(1 + freq);
            tf_idf_vector.set(key, tf * idf);
        });
        all_doc_vectors.push(tf_idf_vector);
    }
    return all_doc_vectors;
}

// Question 17
// helper function
function convertToVectors(docs) {
    const vectors = [];
    docs.forEach((map) => {vectors.push(Array.from(map.values()))})
    return vectors;
}

// from stackoverflow (user: DiffXP)
// ----------------------------------------------------------------------
function calculateCosineSimilarity(A,B){
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for(let i = 0; i < A.length; i++){
        dotProduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    const divisor = mA * mB;
    // TODO how to handle zero-vector?
    if (divisor === 0) {
        return -1;
    }
    return (dotProduct) / (divisor);
}

// Question 18
const SINGLE_TERM_QUERY = "architecture";

dot = (a, b) => a.map((x, i) => a[i] * b[i])
    .reduce((m, n) => m + n);

// ----------------------------------------------------------------------

// Question 19
const QUERY = "vector representation";
function rankDocumentsForQueryDot(q, docs) {
    const dot_scores = new Map();
    for (let i = 0; i < docs.length; i++) {
        const res = dot(q, docs[i]);
        const title = "doc" + (i+1).toString();
        dot_scores.set(title, res);
    }
    // from stackoverflow (user: Miroslav Savovski)
    // ------------------------------------------------------------------
    return new Map(
        [...dot_scores.entries()]
            .sort((a, b) => b[1] - a[1]));
    // ------------------------------------------------------------------
}
function rankDocumentsForQueryCosine(q, docs) {
    const cosine_scores = new Map();
    for (let i = 0; i < docs.length; i++) {
        const res = calculateCosineSimilarity(q, docs[i]);
        const title = "doc" + (i+1).toString();
        cosine_scores.set(title, res);
    }
    // from stackoverflow (user: Miroslav Savovski)
    // ------------------------------------------------------------------
    return new Map(
        [...cosine_scores.entries()]
            .sort((a, b) => b[1] - a[1]));
    // ------------------------------------------------------------------
}

// Question 20
const WORD_2_VEC_TEXT = "63 4\n" +
    "we -0.018 0.117 0.053 0.256\n" +
    "propose -0.106 0.016 0.208 0.218\n" +
    "two 0.032 -0.106 0.002 0.052\n" +
    "novel 0.055 -0.116 -0.037 0.175\n" +
    "model 0.181 0.124 0.09 0.208\n" +
    "architecture 0.063 -0.028 0.149 0.201\n" +
    "for -0.012 -0.047 0.045 0.063\n" +
    "comput -0.025 -0.015 -0.081 0.087\n" +
    "vector 0.125 -0.229 0.115 0.128\n" +
    "representation -0.049 -0.177 0.022 -0.048\n" +
    "word 0.359 0.042 0.09 0.055\n" +
    "from 0.058 -0.0 0.076 0.053\n" +
    "ver -0.074 0.311 0.029 -0.05\n" +
    "large 0.045 0.148 -0.127 0.17\n" +
    "data -0.173 -0.143 0.044 -0.033\n" +
    "set 0.03 0.26 0.193 0.088\n" +
    "the 0.08 0.105 0.05 0.053\n" +
    "qualit -0.136 0.058 0.019 0.041\n" +
    "these -0.016 0.094 0.092 0.12\n" +
    "i -0.226 -0.02 0.091 0.237\n" +
    "in 0.07 0.087 0.088 0.062\n" +
    "task 0.244 0.185 0.128 -0.08\n" +
    "result -0.028 -0.089 -0.018 -0.0\n" +
    "are -0.097 -0.026 0.09 0.032\n" +
    "compar -0.087 0.082 0.023 0.026\n" +
    "best -0.127 0.022 0.287 0.153\n" +
    "perform -0.043 -0.032 -0.146 -0.086\n" +
    "technique 0.229 0.126 0.309 -0.004\n" +
    "ba -0.205 0.12 -0.031 -0.022\n" +
    "on 0.027 -0.091 0.028 0.204\n" +
    "different 0.027 -0.076 0.027 0.137\n" +
    "type -0.041 0.093 -0.015 0.254\n" +
    "neural 0.079 0.025 -0.21 0.367\n" +
    "network -0.08 -0.027 0.1 0.048\n" +
    "observe -0.11 -0.014 0.114 0.178\n" +
    "improvement -0.239 0.183 -0.009 -0.027\n" +
    "at -0.059 -0.038 0.073 0.109\n" +
    "much 0.169 0.064 -0.084 0.174\n" +
    "lower -0.148 -0.171 -0.11 0.297\n" +
    "computational 0.114 -0.303 0.322 0.116\n" +
    "cost 0.118 -0.046 0.052 0.049\n" +
    "e -0.069 0.153 -0.025 0.173\n" +
    "it 0.084 -0.0 0.053 0.1\n" +
    "take -0.051 0.004 0.025 -0.035\n" +
    "les -0.12 0.096 0.169 -0.03\n" +
    "than -0.077 -0.104 -0.002 0.21\n" +
    "da -0.138 -0.032 0.205 0.233\n" +
    "learn -0.097 0.031 -0.151 0.05\n" +
    "high 0.077 0.01 -0.08 0.182\n" +
    "1 0.051 -0.093 0.065 0.114\n" +
    "6 0.126 -0.031 0.016 0.053\n" +
    "billion 0.045 0.026 0.1 0.14\n" +
    "furthermore 0.035 -0.043 0.035 0.094\n" +
    "show -0.019 -0.061 -0.141 0.01\n" +
    "that -0.016 -0.028 0.083 0.05\n" +
    "provide -0.198 -0.186 -0.113 -0.056\n" +
    "state 0.014 -0.049 0.074 -0.007\n" +
    "art 0.023 -0.064 0.006 0.215\n" +
    "performance -0.011 0.089 0.051 -0.081\n" +
    "our -0.198 0.173 0.085 0.371\n" +
    "test -0.143 -0.037 0.136 -0.062\n" +
    "syntactic -0.041 -0.188 -0.258 -0.046\n" +
    "semantic 0.68 -0.203 0.231 0.18"
function parseWord2VecString(w2v_string) {
    let list = w2v_string.split("\n");
    list = list.slice(1);
    // console.log(list);

    const w2v_map = new Map();
    list.forEach(((value, index) => {
        list[index] = value.split(" ");
        const vector = [];
        list[index].slice(1).forEach(((dimension_str) => {
            vector.push(parseFloat(dimension_str));
        }));
        w2v_map.set(list[index][0], vector);
    }));
    // console.log(w2v_map);
    return w2v_map;
}

function createW2vForDocument(doc, w2v_map, length) {
    const document_w2v_map = new Map();
    for (const key of doc.keys()) {
        const element = w2v_map.get(key);
        if (element) {
            document_w2v_map.set(key, element);
        }
    }
    const vector = [];
    const doc_length = document_w2v_map.size;
    const all = Array.from(document_w2v_map.values());
    for (let it = 0; it < length; it++) {
        let sum = 0;
        for (let jt = 0; jt < doc_length; jt++) {
            sum += all[jt][it];
        }
        // TODO round correctly
        vector.push(Number((sum/doc_length).toFixed(4)));
        // vector.push(sum/doc_length);
    }
    return vector;
}

// Question 21
// TODO not really sure what to do here...

// Question 22
// helper functions
function addVector(v1,v2) {
    return v1.map((e,i) => e + v2[i]);
}
function subtractVector(v1,v2) {
    return v1.map((e,i) => e - v2[i]);
}
function absoluteVector(v1) {
    return v1.map((e) => Math.abs(e));
}
function distanceBetweenVectors(v1, v2) {
    const dist = subtractVector(v1, v2);
    let squared_length = 0;
    dist.forEach(val => squared_length+=Math.pow(val,2));
    return Math.sqrt(squared_length);
}

function filterRelationships(A, B, C, base_map) {
    // FORMULA: B - A + C = D
    const a_vec = base_map.get(A);
    const b_vec = base_map.get(B);
    const c_vec = base_map.get(C);

    console.log(a_vec);
    console.log(b_vec);
    console.log(c_vec);

    const D = addVector(subtractVector(b_vec, a_vec), c_vec);
    console.log(D);


    const res_map = new Map();
    for (const [key, vector] of base_map.entries()) {
        // TODO subtraction for similarity ?!
        const score = subtractVector(D, vector);
        let sum = 0;
        score.forEach(val => sum+=Math.pow(val,2));
        res_map.set(key, Math.sqrt(sum));
    }
    return new Map(
        [...res_map.entries()]
            .sort((a, b) => a[1] - b[1]));
}

// Question 23
function findMostSimilarWords(doc, base_map) {
    const distance_map = new Map();
    for (const [key, vector] of base_map.entries()) {
        const similarity = distanceBetweenVectors(doc, vector);
        distance_map.set(key, similarity);
    }
    return new Map(
        [...distance_map.entries()]
            .sort((a, b) => a[1] - b[1]));
}

// main and function calling for Questions 20-24
// ######################################################################
const w2v_map = parseWord2VecString(WORD_2_VEC_TEXT);
const bag = preprocess(CORPUS);
const document1_w2v_vec = createW2vForDocument(bag[0], w2v_map, 4);
console.log(document1_w2v_vec);
console.log(w2v_map);

// Question 20
// next lines simply for formatting
/*let str = "";
document1_w2v_vec.forEach((value => str += (value + ", ")));
str = str.slice(0, -2);
console.log(str);*/

// Question 21
/*const cos_sim = calculateCosineSimilarity(
    w2v_map.get("representation"),
    w2v_map.get("result"));
console.log(cos_sim);*/

// Question 22
/*console.log(w2v_map);
const res = filterRelationships("syntactic", "semantic", "task", w2v_map);
console.log(res.keys());*/

// Question 23
/*const res = findMostSimilarWords(document1_w2v_vec, w2v_map);
console.log(res.keys());*/

// Question 24
/*const doc2_w2v = createW2vForDocument(bag[1], w2v_map, 4);
const doc3_w2v = createW2vForDocument(bag[2], w2v_map, 4);
const cosine_similarity = calculateCosineSimilarity(doc2_w2v, doc3_w2v);
console.log(cosine_similarity);*/

// ######################################################################



// ######################################################################
// prepare corpus / docs
/*
const bags = preprocess(CORPUS);
const doc_tf_idf_maps = calculateTF_IDF(bags, null);
const doc_vectors = convertToVectors(doc_tf_idf_maps);
const d0_d1_sim = calculateCosineSimilarity(doc_vectors[0], doc_vectors[1]);
// console.log(d0_d1_sim);

const bag = preprocess(CORPUS);
const q = preprocess(QUERY);
const maps = calculateTF_IDF(bag, q);
const vectors = convertToVectors(maps);
console.log(vectors);
const rankings = rankDocumentsForQueryDot(vectors[0], vectors.slice(1));
console.log(rankings);
console.log(rankings.keys())
*/

