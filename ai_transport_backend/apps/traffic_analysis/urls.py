from django.urls import path
from .views import traffic_analysis

urlpatterns = [
    path('', traffic_analysis),
    path('analyze/', traffic_analysis),
]