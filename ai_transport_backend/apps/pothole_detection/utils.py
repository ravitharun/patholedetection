def calculate_pothole_risk(width, depth, speed):
    if speed == 0:
        return 0
    return (width * depth) / speed