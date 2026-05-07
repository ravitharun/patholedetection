from ultralytics import YOLO
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODELS_DIR = BASE_DIR / "models"

pothole_model = YOLO(
    str(MODELS_DIR / "pothole.pt")
)

lane_model = YOLO(
    str(MODELS_DIR / "lane.pt")
)

signal_model = YOLO(
    str(MODELS_DIR / "signal.pt")
)