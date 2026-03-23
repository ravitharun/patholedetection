from django.db import models

class Pothole(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    severity = models.CharField(max_length=20)  # Low / Medium / High
    confidence = models.FloatField(default=0.0)
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pothole at {self.latitude}, {self.longitude}"