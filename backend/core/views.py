from django.shortcuts import render

from rest_framework.generics import (
    ListAPIView, RetrieveAPIView,
    ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import UstawieniaStrony, ZdjecieHero, ONas, Ogloszenie, Kontakt
from .serializers import (
    UstawieniaStronySerializer, ZdjecieHeroSerializer,
    ONasSerializer, OgloszenieSerializer, KontaktSerializer
)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class UstawieniaStronyView(RetrieveAPIView):
    """Singleton - zawsze zwraca pierwszy rekord"""
    serializer_class = UstawieniaStronySerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return UstawieniaStrony.objects.first()


class UstawieniaStronyUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = UstawieniaStrony.objects.all()
    serializer_class = UstawieniaStronySerializer


class ZdjecieHeroListView(ListAPIView):
    serializer_class = ZdjecieHeroSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ZdjecieHero.objects.filter(aktywne=True)


class ZdjecieHeroManageView(ListCreateAPIView):
    queryset = ZdjecieHero.objects.all()
    serializer_class = ZdjecieHeroSerializer


class ZdjecieHeroDetailView(RetrieveUpdateDestroyAPIView):
    queryset = ZdjecieHero.objects.all()
    serializer_class = ZdjecieHeroSerializer


class ONasListView(ListAPIView):
    serializer_class = ONasSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ONas.objects.filter(aktywne=True)


class ONasManageView(ListCreateAPIView):
    queryset = ONas.objects.all()
    serializer_class = ONasSerializer


class ONasDetailView(RetrieveUpdateDestroyAPIView):
    queryset = ONas.objects.all()
    serializer_class = ONasSerializer


class OgloszenieListView(ListAPIView):
    """Publiczne - tylko aktywne ogłoszenia"""
    serializer_class = OgloszenieSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.utils import timezone
        return Ogloszenie.objects.filter(
            aktywne=True
        ).exclude(
            data_wygasniecia__lt=timezone.now().date()
        )


class OgloszenieManageView(ListCreateAPIView):
    queryset = Ogloszenie.objects.all()
    serializer_class = OgloszenieSerializer


class OgloszenieDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Ogloszenie.objects.all()
    serializer_class = OgloszenieSerializer


class KontaktCreateView(ListCreateAPIView):
    """
    GET  - tylko dla zalogowanych (czytanie wiadomości)
    POST - dla wszystkich (wysyłanie formularza)
    """
    serializer_class = KontaktSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Kontakt.objects.all()


class KontaktDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Kontakt.objects.all()
    serializer_class = KontaktSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Podaj login i hasło'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=username, password=password)

        if not user:
            return Response(
                {'error': 'Nieprawidłowy login lub hasło'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Wylogowano pomyślnie'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'groups': list(user.groups.values_list('name', flat=True)),
        })
