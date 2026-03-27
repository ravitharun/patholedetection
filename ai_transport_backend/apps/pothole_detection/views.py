from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import cv2
import numpy as np
import os

from .ai_model import detect_smart
from apps.notifications.models import Notification   # 🔥 IMPORTANT


# ✅ Upload Page + Detection + Notification Save
def upload_page(request):

    if request.method == "POST":
        file = request.FILES.get('file')

        if not file:
            return render(request, "upload.html", {"error": "No file uploaded"})

        try:
            file_bytes = np.asarray(bytearray(file.read()), dtype=np.uint8)
            frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

            # 🔥 Run detection
            processed_frame, detections = detect_smart(frame, mode="auto")

            # 🔥 SAVE IMAGE
            os.makedirs("media", exist_ok=True)
            output_path = os.path.join("media", "output.jpg")
            cv2.imwrite(output_path, processed_frame)

            # 🔥 SAVE NOTIFICATIONS
            for d in detections:
                if d["type"] == "pothole":
                    Notification.objects.create(
                        type="pothole",
                        message="⚠️ Pothole detected",
                        confidence=d["confidence"]
                    )

                elif d["type"] == "signal":
                    Notification.objects.create(
                        type="signal",
                        message=f"🚦 Signal: {d.get('color', 'unknown')}",
                        confidence=d["confidence"]
                    )

                elif d["type"] == "lane":
                    Notification.objects.create(
                        type="lane",
                        message="🛣️ Lane detected",
                        confidence=d["confidence"]
                    )

            return render(request, "upload.html", {
                "image_url": "/media/output.jpg",
                "result": detections
            })

        except Exception as e:
            return render(request, "upload.html", {"error": str(e)})

    return render(request, "upload.html")


# ✅ API (optional)
@api_view(['POST'])
def detect_all(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        file_bytes = np.asarray(bytearray(file.read()), dtype=np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        processed_frame, detections = detect_smart(frame, mode="auto")

        os.makedirs("media", exist_ok=True)
        output_path = os.path.join("media", "output.jpg")
        cv2.imwrite(output_path, processed_frame)

        return Response({
            "status": "success",
            "detections": detections,
            "image_url": "/media/output.jpg"
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)