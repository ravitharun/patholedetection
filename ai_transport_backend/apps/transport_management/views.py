from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def transport_home(request):
    return Response({
        "message": "Transport API Running"
    })