from .ai_model import detect_smart
# import cv2  # Temporarily disabled due to OpenCV DLL issues

import time
import os

from django.conf import settings


def process_detection(file):
    # 📁 Ensure media directory exists
    media_dir = os.path.join(
        settings.BASE_DIR,
        "media",
    )

    os.makedirs(
        media_dir,
        exist_ok=True,
    )

    # 📝 Generate temporary filename
    filename = file.name

    temp_filename = (
        f"temp_{int(time.time())}_{filename}"
    )

    temp_path = os.path.join(
        media_dir,
        temp_filename,
    )

    try:
        # 💾 SAVE UPLOADED FILE
        with open(temp_path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)

        # 🧠 AI DETECTION
        # ⚠️ OpenCV temporarily disabled
        # Pass None until cv2 issue is fixed
        processed_frame, detections = (
            detect_smart(None)
        )

        # 🌐 Placeholder URL
        placeholder_url = (
            f"{settings.BACKEND_URL}/api/pothole/media/placeholder.jpg"
        )

        return {
            "status": "success",
            "type": "image",
            "url": placeholder_url,
            "detections": detections,
            "total_detections": len(
                detections
            ),
        }

    except Exception as err:
        print(
            "❌ Detection Processing Error:",
            err,
        )

        return {
            "status": "error",
            "message": str(err),
            "detections": [],
        }

    finally:
        # 🧹 CLEAN TEMP FILE
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_err:
                print(
                    "⚠️ Cleanup Error:",
                    cleanup_err,
                )