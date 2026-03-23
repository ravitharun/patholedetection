from django.db import models

class TrafficData(models.Model):
    vehicle_count = models.IntegerField()
    density = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)