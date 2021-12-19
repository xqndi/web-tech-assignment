# Infos on the word2vec model

We use the node library from: https://www.npmjs.com/package/word2vec  
The library is only available under UNIX-like OS. But it can be used in WSL on Windows.  
It uses the word2vec toolkit under the hood: https://code.google.com/archive/p/word2vec/  
The two papers on the topic are: https://arxiv.org/pdf/1301.3781.pdf and https://arxiv.org/pdf/1310.4546.pdf  

Training the model can be done using the word2vec function on a preprocessed corpus file.  
The model provides several functions such as a similarity search.  
Additonally, we can use the vectors in mathematical operations, e.g., add vectors together to form an average vector.  
