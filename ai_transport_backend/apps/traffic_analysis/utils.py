def classify_traffic(density):
    if density < 5:
        return "Low"
    elif density < 15:
        return "Medium"
    return "High"