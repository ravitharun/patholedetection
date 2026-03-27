from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 🔥 ADD THIS LINE
    path('', include('apps.pothole_detection.urls')),

    path('admin/', admin.site.urls),
    path('api/pothole/', include('apps.pothole_detection.urls')),
    path('api/traffic/', include('apps.traffic_analysis.urls')),
    path('api/transport/', include('apps.transport_management.urls')),
    path('api/notify/', include('apps.notifications.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)