from django.http import JsonResponse
from .models import Notification


def get_notifications(request):
    try:
        notifications = Notification.objects.all().order_by('-created_at')[:20]

        data = []
        for n in notifications:
            data.append({
                "type": n.type,
                "message": n.message,
                "confidence": float(n.confidence) if n.confidence else 0,
                "time": n.created_at.strftime("%Y-%m-%d %H:%M:%S") if n.created_at else None
            })

        return JsonResponse({
            "status": "success",
            "count": len(data),
            "notifications": data
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)