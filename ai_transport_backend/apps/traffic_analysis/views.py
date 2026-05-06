from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import calculate_traffic_density


@api_view(['POST'])
def traffic_analysis(request):

    try:
        vehicle_count = request.data.get('vehicle_count', 0)
        road_length = request.data.get('road_length', 1)

        density = calculate_traffic_density(vehicle_count, road_length)

        return Response({
            "status": "success",
            "density": density
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)