import os
import shutil
import cv2
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from ultralytics import YOLO

# ---------------- APP INIT ----------------
app = FastAPI(title="ML Detection Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- LOAD MODELS ----------------
models = {
    "pothole": YOLO(os.path.join(MODEL_DIR, "pothole", "best.pt")),
    "lane_detection": YOLO(os.path.join(MODEL_DIR, "lane_detection", "best.pt")),
    "traffic_light": YOLO(os.path.join(MODEL_DIR, "traffic_light", "best.pt")),
}

# ---------------- HEALTH ----------------
@app.get("/ping")
def ping():
    return {"status": "ok"}

# ---------------- IMAGE DETECTION ----------------
@app.post("/detect")
async def detect_image(
    model: str = Query(...),
    image: UploadFile = File(...)
):
    image_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(image_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    results = models[model](image_path)

    detections = []
    for r in results:
        if r.boxes is not None:
            for b in r.boxes:
                detections.append({
                    "class_id": int(b.cls[0]),
                    "confidence": float(b.conf[0]),
                    "bbox": b.xyxy[0].tolist()
                })

    return {
        "model_used": model,
        "detections": detections
    }

# ---------------- VIDEO DETECTION ----------------
@app.post("/detect-video")
async def detect_video(
    model: str = Query(...),
    video: UploadFile = File(...)
):
    input_path = os.path.join(UPLOAD_DIR, video.filename)
    output_path = os.path.join(OUTPUT_DIR, f"out_{video.filename}")

    # Save uploaded video
    with open(input_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    cap = cv2.VideoCapture(input_path)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    model_yolo = models[model]

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model_yolo(frame)

        for r in results:
            if r.boxes is not None:
                for b in r.boxes:
                    x1, y1, x2, y2 = map(int, b.xyxy[0])
                    conf = float(b.conf[0])

                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(
                        frame,
                        f"{conf:.2f}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2
                    )

        out.write(frame)

    cap.release()
    out.release()

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=os.path.basename(output_path)
    )
