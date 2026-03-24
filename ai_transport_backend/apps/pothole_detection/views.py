from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_api(request):
    return JsonResponse({"message": "Pothole API working"})

@csrf_exempt
def detect_pothole(request):
    if request.method == "POST":
        image = request.FILES.get("image")

        if not image:
            return JsonResponse({"error": "No image uploaded"}, status=400)

        # 🔥 TODO: Replace with your AI model call
        result = {
            "status": "success",
            "pothole_detected": True,
            "confidence": 0.87
        }

        return JsonResponse(result)