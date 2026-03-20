from django.urls import path
from .views import notify

urlpatterns = [
    path('send/', notify),
]