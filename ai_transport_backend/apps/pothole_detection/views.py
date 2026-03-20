from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .services import process_pothole_detection

@api_view(['POST'])
def detect_pothole_api(request):
    if 'image' not in request.FILES:
        return Response({"error": "No image uploaded"}, status=400)

    image = request.FILES['image']
    file_path = default_storage.save(image.name, image)
    full_path = default_storage.path(file_path)

    detections = process_pothole_detection(full_path)

    return Response({
        "message": "Detection complete",
        "detections": detections
    })