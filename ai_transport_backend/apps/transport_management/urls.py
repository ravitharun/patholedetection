from django.urls import path
from .views import transport_home

urlpatterns = [
    path('', transport_home),
]