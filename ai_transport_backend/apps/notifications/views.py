from django.http import JsonResponse
from .models import Notification


def get_notifications(request):
    notifications = Notification.objects.all().order_by('-created_at')[:20]

    data = []
    for n in notifications:
        data.append({
            "type": n.type,
            "message": n.message,
            "confidence": n.confidence,
            "time": n.created_at
        })

    return JsonResponse({"notifications": data})