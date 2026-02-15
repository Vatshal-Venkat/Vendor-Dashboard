def relationship_confidence(relationship: dict) -> float:
    base_score = 0.6

    if len(relationship["subject"]) > 3:
        base_score += 0.1

    if len(relationship["object"]) > 3:
        base_score += 0.1

    if relationship["relationship"] in ["owns", "controls", "acquired"]:
        base_score += 0.2

    return min(base_score, 0.95)
