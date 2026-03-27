import os
import cv2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 🔥 LOWERED for better detection
CONF_THRESHOLD = 0.2

# 🔥 Global model variables (lazy loading)
pothole_model = None
lane_model = None
signal_model = None


def load_models():
    global pothole_model, lane_model, signal_model

    try:
        from ultralytics import YOLO

        if pothole_model is None:
            pothole_model = YOLO(os.path.join(BASE_DIR, "best.pt"))

        if lane_model is None:
            lane_model = YOLO(os.path.join(BASE_DIR, "lane.pt"))

        if signal_model is None:
            signal_model = YOLO(os.path.join(BASE_DIR, "signal.pt"))

    except Exception as e:
        print("⚠️ Model loading failed:", e)
        return False

    return True


def detect_smart(frame, mode="auto"):
    detections = []

    # 🔥 Improve contrast (helps detect faint potholes)
    frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=20)

    if not load_models():
        return frame, [{
            "type": "error",
            "message": "AI model not loaded"
        }]

    # Select models
    if mode == "pothole":
        models = [("pothole", pothole_model)]
    elif mode == "lane":
        models = [("lane", lane_model)]
    elif mode == "signal":
        models = [("signal", signal_model)]
    else:
        models = [
            ("pothole", pothole_model),
            ("lane", lane_model),
            ("signal", signal_model)
        ]

    # Run detection
    for mtype, model in models:
        try:
            # 🔥 UPDATED LINE (VERY IMPORTANT)
            results = model(frame, imgsz=800)

            if not results or results[0].boxes is None:
                continue

            for box in results[0].boxes:
                conf = float(box.conf[0])

                # 🔥 Confidence filter
                if conf < CONF_THRESHOLD:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                data = {
                    "type": mtype,
                    "confidence": conf
                }

                # 🚦 Signal color
                if mtype == "signal":
                    cls_id = int(box.cls[0])
                    data["color"] = model.names[cls_id]

                    if data["color"] == "red":
                        color = (0, 0, 255)
                    elif data["color"] == "yellow":
                        color = (0, 255, 255)
                    else:
                        color = (0, 255, 0)
                else:
                    color = (255, 0, 0)

                detections.append(data)

                # 🔥 Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # 🔥 Add label text
                label = f"{mtype} {conf:.2f}"
                cv2.putText(
                    frame,
                    label,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    color,
                    2
                )

        except Exception as e:
            print(f"⚠️ Error in {mtype} detection:", e)

    return frame, detections