from django.urls import path
from .views import detect_frame

urlpatterns = [
    path(
        "detect-frame/",
        detect_frame,
        name="detect-frame"
    ),
]