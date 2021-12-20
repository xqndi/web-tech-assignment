# Example Dataset

* Will be used for testing

Get data from: https://www.kaggle.com/stackoverflow/statsquestions
Convert data to json via [Python conversion script](../csv_to_json.py)

Commands to run: `python csv_to_json.py ../data/Answers` and `python csv_to_json.py ../data/Questions` respectively.

Generate a subset for development with the head command: `head Questions.json > dummy_Questions.json`

# Files in folder

For part 1:
- Raw CSV files downloaded from URL
- JSON converted files (inclusive subsets for development)

For part 2:
- Corpus file generated from JSON data
- Word vectors file generated from corpus
- Entity embeddings generated using word vectors
