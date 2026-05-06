# from ultralytics import YOLO
# import cv2
# import os

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # Load models
# pothole_model = YOLO(os.path.join(BASE_DIR, "best.pt"))
# lane_model = YOLO(os.path.join(BASE_DIR, "lane.pt"))
# signal_model = YOLO(os.path.join(BASE_DIR, "signal.pt"))

# CONF_THRESHOLD = 0.4


# def detect_smart(frame, mode="auto"):
#     detections = []

#     if mode == "pothole":
#         models = [("pothole", pothole_model)]
#     elif mode == "lane":
#         models = [("lane", lane_model)]
#     elif mode == "signal":
#         models = [("signal", signal_model)]
#     else:
#         models = [
#             ("pothole", pothole_model),
#             ("lane", lane_model),
#             ("signal", signal_model)
#         ]

#     for mtype, model in models:
#         results = model(frame)

#         if not results or results[0].boxes is None:
#             continue

#         for box in results[0].boxes:
#             conf = float(box.conf[0])
#             if conf < CONF_THRESHOLD:
#                 continue

#             x1, y1, x2, y2 = map(int, box.xyxy[0])

#             data = {
#                 "type": mtype,
#                 "confidence": conf
#             }

#             # 🚦 SIGNAL COLOR
#             if mtype == "signal":
#                 cls_id = int(box.cls[0])
#                 data["color"] = model.names[cls_id]

#                 if data["color"] == "red":
#                     color = (0, 0, 255)
#                 elif data["color"] == "yellow":
#                     color = (0, 255, 255)
#                 else:
#                     color = (0, 255, 0)
#             else:
#                 color = (255, 0, 0)

#             detections.append(data)

#             cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

#             if mtype == "signal":
#                 cv2.putText(frame, data["color"], (x1, y1-10),
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

#     return frame, detections


# NEW CODE
from ultralytics import YOLO
import cv2
import os
from django.conf import settings

BASE_DIR = settings.BASE_DIR

CONF_THRESHOLD = 0.4

# 🔥 Lazy loaded models
pothole_model = None
lane_model = None
signal_model = None


def load_models():
    global pothole_model, lane_model, signal_model

    if pothole_model is None:
        pothole_model = YOLO(os.path.join(BASE_DIR, "best.pt"))

    if lane_model is None:
        lane_model = YOLO(os.path.join(BASE_DIR, "lane.pt"))

    if signal_model is None:
        signal_model = YOLO(os.path.join(BASE_DIR, "signal.pt"))

    return pothole_model, lane_model, signal_model


def detect_smart(frame, mode="auto"):
    detections = []

    # ✅ Load models only when needed
    pothole_model, lane_model, signal_model = load_models()

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

    for mtype, model in models:
        results = model(frame)

        if not results or results[0].boxes is None:
            continue

        for box in results[0].boxes:
            conf = float(box.conf[0])
            if conf < CONF_THRESHOLD:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            data = {
                "type": mtype,
                "confidence": conf
            }

            # 🚦 SIGNAL COLOR
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

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            if mtype == "signal":
                cv2.putText(
                    frame,
                    data["color"],
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    color,
                    2
                )

    return frame, detections
