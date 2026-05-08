from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
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
@api_view(['GET', 'POST', 'OPTIONS'])
def detect_api(request):

    if request.method == "OPTIONS":
        response = Response()

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "*"

        return response

    from .services import process_detection

    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    result = process_detection(file)

    return JsonResponse(result)