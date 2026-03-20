from django.urls import path
from .views import detect_pothole_api

urlpatterns = [
    path('detect/', detect_pothole_api),
]