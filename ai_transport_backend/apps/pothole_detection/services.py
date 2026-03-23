from .ai_model import detect_smart
import cv2
import time
import os


def process_detection(file):
    # Ensure media folder exists
    if not os.path.exists("media"):
        os.makedirs("media")

    filename = file.name
    temp_path = f"media/temp_{int(time.time())}_{filename}"

    # ---------- SAVE FILE ----------
    with open(temp_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # ---------- IMAGE ----------
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):

        frame = cv2.imread(temp_path)

        # Safety check
        if frame is None:
            return {"error": "Invalid image file"}

        output, detections = detect_smart(frame)

        out_filename = f"output_{int(time.time())}.jpg"
        out_path = f"media/{out_filename}"

        cv2.imwrite(out_path, output)

        return {
            "type": "image",
            "url": f"http://127.0.0.1:8000/api/pothole/media/{out_filename}",
            "detections": detections
        }

    # ---------- VIDEO ----------
    else:
        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            return {"error": "Invalid video file"}

        width = int(cap.get(3))
        height = int(cap.get(4))

        out_filename = f"output_{int(time.time())}.mp4"
        out_path = f"media/{out_filename}"

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(out_path, fourcc, 20.0, (width, height))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            processed_frame, _ = detect_smart(frame)
            out.write(processed_frame)

        cap.release()
        out.release()

        return {
            "type": "video",
            "url": f"http://127.0.0.1:8000/api/pothole/media/{out_filename}"
        }