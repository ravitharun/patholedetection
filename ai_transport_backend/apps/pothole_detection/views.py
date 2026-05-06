from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .services import process_detection
from django.conf import settings
from django.http import FileResponse, HttpResponse
import os


# ✅ UI PAGE
def upload_page(request):
    return render(request, "upload.html")


# ✅ TEST API
def test_api(request):
    return JsonResponse({
        "status": "success",
        "message": "Pothole Detection API Working"
    })


# ✅ DETECTION API
@api_view(['POST'])
def detect_api(request):

    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    # 🔥 TODO: Replace with your AI model call
    result = {
        "status": "success",
        "pothole_detected": True,
        "confidence": 0.87
    }

    return JsonResponse(result)