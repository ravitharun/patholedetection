from django.urls import path
from .views import upload_page, detect_all

urlpatterns = [
    path('', upload_page),         # UI page
    path('detect/', detect_all),   # API
]