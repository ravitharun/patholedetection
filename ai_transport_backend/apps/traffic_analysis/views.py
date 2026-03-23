from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import calculate_traffic_density

@api_view(['POST'])
def traffic_analysis(request):
    vehicle_count = request.data.get('vehicle_count', 0)
    road_length = request.data.get('road_length', 1)

    density = calculate_traffic_density(vehicle_count, road_length)

    return Response({
        "density": density
    })