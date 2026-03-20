from ultralytics import YOLO

# load model
model = YOLO("yolov8n.pt")

def detect_potholes(image_path):
    results = model(image_path)

    detections = []

    for r in results:
        for box in r.boxes:
            detections.append({
                "class": int(box.cls[0]),
                "confidence": float(box.conf[0]),
                "bbox": box.xyxy[0].tolist()
            })

    return detections