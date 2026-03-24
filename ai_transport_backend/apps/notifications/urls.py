from django.urls import path
from .views import get_notifications

urlpatterns = [
    path('', get_notifications),           # /api/notify/
    path('list/', get_notifications),      # /api/notify/list/
]