from django.db import models

class Notification(models.Model):
    TYPE_CHOICES = [
        ('pothole', 'Pothole'),
        ('lane', 'Lane'),
        ('signal', 'Signal'),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.message}"