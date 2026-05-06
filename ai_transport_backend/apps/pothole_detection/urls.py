from django.urls import path
from .views import upload_page, test_api, detect_api

urlpatterns = [
    path('', upload_page),
    path('test/', test_api),
    path('detect/', detect_api),
]