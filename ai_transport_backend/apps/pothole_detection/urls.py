from django.urls import path
from .views import detect_api, upload_page, get_media

urlpatterns = [
    path('', upload_page),                    # 🔥 FIX (ROOT PAGE)
    path('detect/', detect_api),
    path('media/<path:path>/', get_media),
]