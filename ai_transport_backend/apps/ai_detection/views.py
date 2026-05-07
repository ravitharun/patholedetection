from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import numpy as np
import tempfile
import os

from .ai_loader import (
    pothole_model,
    lane_model,
    signal_model
)


@csrf_exempt
def detect_frame(request):

    if request.method != "POST":
        return JsonResponse({
            "error": "POST request required"
        })

    if "image" not in request.FILES:
        return JsonResponse({
            "error": "No image uploaded"
        })

    image_file = request.FILES["image"]

    mode = request.POST.get(
        "mode",
        "all"
    )

    # SAVE TEMP IMAGE
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".jpg"
    ) as temp_file:

        for chunk in image_file.chunks():
            temp_file.write(chunk)

        temp_path = temp_file.name

    image = Image.open(
        temp_path
    ).convert("RGB")

    frame = np.array(image)

    response = {
        "potholes": [],
        "lanes": [],
        "signals": []
    }

    try:

        # =========================
        # POTHOLE DETECTION
        # =========================

        if mode in ["all", "pothole"]:

            results = pothole_model(frame)

            for result in results:

                for box in result.boxes:

                    cls_id = int(box.cls[0])

                    label = pothole_model.names[
                        cls_id
                    ]

                    conf = float(box.conf[0])

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0]
                    )

                    response["potholes"].append({
                        "label": label,
                        "confidence": round(conf, 2),
                        "bbox": [
                            x1,
                            y1,
                            x2,
                            y2
                        ]
                    })

        # =========================
        # LANE DETECTION
        # =========================

        if mode in ["all", "lane"]:

            results = lane_model(frame)

            for result in results:

                for box in result.boxes:

                    cls_id = int(box.cls[0])

                    label = lane_model.names[
                        cls_id
                    ]

                    conf = float(box.conf[0])

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0]
                    )

                    response["lanes"].append({
                        "label": label,
                        "confidence": round(conf, 2),
                        "bbox": [
                            x1,
                            y1,
                            x2,
                            y2
                        ]
                    })

        # =========================
        # SIGNAL DETECTION
        # =========================

        if mode in ["all", "signal"]:

            results = signal_model(frame)

            for result in results:

                for box in result.boxes:

                    cls_id = int(box.cls[0])

                    label = signal_model.names[
                        cls_id
                    ]

                    conf = float(box.conf[0])

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0]
                    )

                    response["signals"].append({
                        "label": label,
                        "confidence": round(conf, 2),
                        "bbox": [
                            x1,
                            y1,
                            x2,
                            y2
                        ]
                    })

    except Exception as e:

        return JsonResponse({
            "error": str(e)
        })

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)

    return JsonResponse({
        "success": True,
        "detections": response
    })