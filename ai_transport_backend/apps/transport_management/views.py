from rest_framework.decorators import api_view
from rest_framework.response import Response
from .scheduling import calculate_eta

@api_view(['POST'])
def update_schedule(request):
    distance = request.data.get('distance', 1)
    speed = request.data.get('speed', 1)

    eta = calculate_eta(distance, speed)

    return Response({
        "eta": eta
    })