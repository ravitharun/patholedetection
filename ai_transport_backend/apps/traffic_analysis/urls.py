from django.urls import path
from .views import traffic_analysis

urlpatterns = [
    path('analyze/', traffic_analysis),
]