from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Pothole detection APIs
    path('api/pothole/', include('apps.pothole_detection.urls')),

    # Traffic analysis APIs
    path('api/traffic/', include('apps.traffic_analysis.urls')),

    # Transport management APIs
    path('api/transport/', include('apps.transport_management.urls')),

    # Notification APIs
    path('api/notify/', include('apps.notifications.urls')),
]