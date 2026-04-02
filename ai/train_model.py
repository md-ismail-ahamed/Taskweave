import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.read_csv("task_allocation_dataset.csv")


X = data[["skill_match_count", "skill_level_sum", "workload"]]


y = data["assigned_member"]


model = RandomForestClassifier()
model.fit(X, y)


joblib.dump(model, "model.pkl")

print("Model trained and saved as model.pkl")