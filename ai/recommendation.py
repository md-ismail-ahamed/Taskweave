from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

model = joblib.load("model.pkl")

class TaskInput(BaseModel):
    requiredSkills: list
    members: list

@app.post("/recommend")
def recommend_member(data: TaskInput):

    results = []

    print("🔥 API HIT")

    for member in data.members:

        skill_match_count = 0
        skill_level_sum = 0

        # 🔥 SKILL MATCH
        for skill in data.requiredSkills:
            for s in member.get("skills", []):
                if s["name"].lower() == skill.lower():
                    skill_match_count += 1
                    skill_level_sum += s["level"]

        # 🔥 WORKLOAD
        workload = member.get("capacityHours", 0)

        # 🔥 ML
        features = [[skill_match_count, skill_level_sum, workload]]
        probabilities = model.predict_proba(features)[0]
        ml_confidence = max(probabilities)

        # 🔥 SCORE
        raw_score = (
            (skill_match_count * 15) +
            (skill_level_sum * 2) +
            (ml_confidence * 20) -
            (workload * 5)
        )

        score = max(0, raw_score)

        results.append({
            "name": member["name"],
            "score": round(score, 2),
            "skillMatch": skill_match_count,
            "skillLevel": skill_level_sum,
            "workload": workload,
            "mlConfidence": round(ml_confidence, 2)
        })

    # 🔥 SORT BEST FIRST
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "recommendedMember": results[0]["name"],
        "score": results[0]["score"],
        "analysis": results   # ⭐ IMPORTANT
    }