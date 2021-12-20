import pandas as pd
import sys

def convert(file, dummy=True):
    df: pd.DataFrame = pd.read_csv(file + ".csv", sep=",", quotechar="\"", encoding="latin-1", index_col=0)
    df.to_json(file + ".json", orient="index", indent=2)
    if dummy:
        df.head().to_json(file + "_head.json", orient="index", indent=2)

if __name__ == "__main__":
    convert(sys.argv[1])
