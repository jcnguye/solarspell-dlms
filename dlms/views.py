from rest_framework.decorators import api_view
from content_management.standardize_format import build_response
from django.middleware.csrf import get_token

@api_view(("GET", ))
def user_name(request):
    return build_response(get_token(request))

@api_view(("GET", ))
def test(request):
    return request.is_staff
