from ultralytics import YOLO
import cv2
import os
from django.conf import settings

BASE_DIR = settings.BASE_DIR

CONF_THRESHOLD = 0.4

# 🔥 Lazy Loaded Models
pothole_model = None
lane_model = None
signal_model = None


# 📦 LOAD MODELS ONLY WHEN REQUIRED
def load_models():
    global pothole_model
    global lane_model
    global signal_model

    try:
        if pothole_model is None:
            pothole_model = YOLO(
                os.path.join(BASE_DIR, "best.pt")
            )

        if lane_model is None:
            lane_model = YOLO(
                os.path.join(BASE_DIR, "lane.pt")
            )

        if signal_model is None:
            signal_model = YOLO(
                os.path.join(BASE_DIR, "signal.pt")
            )

    except Exception as err:
        print("❌ Model Load Error:", err)

    return (
        pothole_model,
        lane_model,
        signal_model,
    )


# 🎨 GET BOUNDING BOX COLOR
def get_detection_color(
    detection_type,
    signal_color=None,
):
    if detection_type == "signal":
        if signal_color == "red":
            return (0, 0, 255)

        if signal_color == "yellow":
            return (0, 255, 255)

        return (0, 255, 0)

    if detection_type == "lane":
        return (255, 255, 0)

    return (255, 0, 0)


# 🧠 SMART DETECTION
def detect_smart(
    frame,
    mode="auto",
):
    detections = []

    if frame is None:
        return frame, detections

    (
        pothole_model,
        lane_model,
        signal_model,
    ) = load_models()

    # 🚦 SELECT MODELS
    if mode == "pothole":
        models = [
            ("pothole", pothole_model)
        ]

    elif mode == "lane":
        models = [
            ("lane", lane_model)
        ]

    elif mode == "signal":
        models = [
            ("signal", signal_model)
        ]

    else:
        models = [
            ("pothole", pothole_model),
            ("lane", lane_model),
            ("signal", signal_model),
        ]

    # 🔍 RUN DETECTION
    for mtype, model in models:
        try:
            if model is None:
                continue

            results = model(
                frame,
                verbose=False,
            )

            if (
                not results
                or results[0].boxes is None
            ):
                continue

            for box in results[0].boxes:
                try:
                    conf = float(box.conf[0])

                    if conf < CONF_THRESHOLD:
                        continue

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0],
                    )

                    detection_data = {
                        "type": mtype,
                        "confidence": round(
                            conf,
                            2,
                        ),
                        "bbox": {
                            "x1": x1,
                            "y1": y1,
                            "x2": x2,
                            "y2": y2,
                        },
                    }

                    label = mtype

                    # 🚦 SIGNAL LABEL
                    if mtype == "signal":
                        cls_id = int(box.cls[0])

                        signal_color = (
                            model.names[cls_id]
                        )

                        detection_data[
                            "color"
                        ] = signal_color

                        label = (
                            f"{signal_color}"
                        )

                        color = (
                            get_detection_color(
                                "signal",
                                signal_color,
                            )
                        )

                    else:
                        color = (
                            get_detection_color(
                                mtype
                            )
                        )

                    detections.append(
                        detection_data
                    )

                    # 📦 DRAW BOUNDING BOX
                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        color,
                        2,
                    )

                    # 🏷️ DRAW LABEL
                    cv2.putText(
                        frame,
                        f"{label} {conf:.2f}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        color,
                        2,
                    )

                except Exception as box_err:
                    print(
                        "⚠️ Box Processing Error:",
                        box_err,
                    )

        except Exception as model_err:
            print(
                f"❌ {mtype} Detection Error:",
                model_err,
            )

    return frame, detections