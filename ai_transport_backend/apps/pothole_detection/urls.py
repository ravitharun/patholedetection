from django.urls import path
from .views import test_api, detect_pothole

urlpatterns = [
    path('test/', test_api),
    path('detect/', detect_pothole),
]