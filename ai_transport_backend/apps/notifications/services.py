import os
import cv2
import time
import numpy as np

from .ai_model import detect_all
from apps.notifications.models import Notification

MEDIA_DIR = "media"


# 🔔 CREATE NOTIFICATIONS
def create_notifications(detections):
    for det in detections:
        if det["confidence"] < 0.5:
            continue

        if det["type"] == "pothole":
            msg = "⚠️ Pothole detected on road"

        elif det["type"] == "signal":
            msg = "🚦 Traffic signal detected"

        elif det["type"] == "lane":
            msg = "🛣️ Lane detected"

        else:
            msg = "Detection found"

        Notification.objects.create(
            type=det["type"],
            message=msg,
            confidence=det["confidence"]
        )


def process_detection(file):
    filename = file.name.lower()

    if not os.path.exists(MEDIA_DIR):
        os.makedirs(MEDIA_DIR)

    # ================= IMAGE =================
    if filename.endswith((".jpg", ".jpeg", ".png")):
        file_bytes = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Invalid image"}

        frame, detections = detect_all(frame)

        # 🔥 NOTIFICATION
        create_notifications(detections)

        output_name = f"output_{int(time.time())}.jpg"
        output_path = os.path.join(MEDIA_DIR, output_name)

        cv2.imwrite(output_path, frame)

        return {
            "type": "image",
            "url": f"/api/pothole/media/{output_name}",
            "detections": detections
        }

    # ================= VIDEO =================
    elif filename.endswith((".mp4", ".avi", ".mov")):
        temp_path = os.path.join(MEDIA_DIR, "temp_video.mp4")

        with open(temp_path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)

        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            return {"error": "Cannot open video"}

        width = int(cap.get(3))
        height = int(cap.get(4))
        fps = int(cap.get(5))

        output_name = f"output_{int(time.time())}.mp4"
        output_path = os.path.join(MEDIA_DIR, output_name)

        out = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*'mp4v'),
            fps,
            (width, height)
        )

        while True:
            ret, frame = cap.read()

            if not ret or frame is None:
                break

            frame, detections = detect_all(frame)

            # 🔥 NOTIFICATION (video frame wise)
            create_notifications(detections)

            out.write(frame)

        cap.release()
        out.release()

        return {
            "type": "video",
            "url": f"/api/pothole/media/{output_name}"
        }

    return {"error": "Unsupported file type"}