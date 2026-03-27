from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import process_detection
from django.conf import settings
from django.http import FileResponse, HttpResponse
import os


# ✅ UI PAGE
def upload_page(request):
    return render(request, "upload.html")


# ✅ API (POST)
@api_view(['POST'])
def detect_api(request):
    file = request.FILES.get('file')
    print(file,"file")
    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    result = process_detection(file)
    return Response(result)


# ✅ MEDIA SERVE
def get_media(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)

    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        return HttpResponse("File not found", status=404)