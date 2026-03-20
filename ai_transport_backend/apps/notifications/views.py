from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import create_notification

@api_view(['POST'])
def notify(request):
    message = request.data.get('message', '')

    return Response(create_notification(message))