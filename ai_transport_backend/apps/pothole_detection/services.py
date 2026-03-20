from .ai_model import detect_potholes

def process_pothole_detection(image_path):
    detections = detect_potholes(image_path)

    potholes = []
    for d in detections:
        potholes.append(d)

    return potholes