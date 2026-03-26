from django.shortcuts import render

from rest_framework.generics import (
    ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import KategoriaMenu, Danie, SalaRestauracyjna, KategoriaWyrobu, Wyrob, GodzinyOtwarcia
from .serializers import (
    KategoriaMenuSerializer, DanieSerializer,
    SalaRestauracyjnaSerializer, KategoriaWyrobuSerializer, WyrobSerializer, GodzinyOtwarciaSer)



class GodzinyOtwarciaListView(ListAPIView):
    queryset = GodzinyOtwarcia.objects.all()
    serializer_class = GodzinyOtwarciaSer
    permission_classes = [AllowAny]

class GodzinyOtwarciaManageView(ListCreateAPIView):
    queryset = GodzinyOtwarcia.objects.all()
    serializer_class = GodzinyOtwarciaSer

class GodzinyOtwarciaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = GodzinyOtwarcia.objects.all()
    serializer_class = GodzinyOtwarciaSer


class KategoriaMenuListView(ListAPIView):
    serializer_class = KategoriaMenuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return KategoriaMenu.objects.filter(aktywna=True)


class KategoriaMenuManageView(ListCreateAPIView):
    queryset = KategoriaMenu.objects.all()
    serializer_class = KategoriaMenuSerializer


class KategoriaMenuDetailView(RetrieveUpdateDestroyAPIView):
    queryset = KategoriaMenu.objects.all()
    serializer_class = KategoriaMenuSerializer


class DanieListView(ListAPIView):
    """Publiczne - tylko widoczne dania"""
    serializer_class = DanieSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Danie.objects.filter(widoczne=True)
        kategoria = self.request.query_params.get('kategoria')
        if kategoria:
            queryset = queryset.filter(kategoria__id=kategoria)
        return queryset


class DanieManageView(ListCreateAPIView):
    """Zarządzanie - wszystkie dania włącznie z ukrytymi"""
    queryset = Danie.objects.all()
    serializer_class = DanieSerializer


class DanieDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Danie.objects.all()
    serializer_class = DanieSerializer


class SalaListView(ListAPIView):
    serializer_class = SalaRestauracyjnaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return SalaRestauracyjna.objects.filter(aktywna=True)


class SalaManageView(ListCreateAPIView):
    queryset = SalaRestauracyjna.objects.all()
    serializer_class = SalaRestauracyjnaSerializer


class SalaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = SalaRestauracyjna.objects.all()
    serializer_class = SalaRestauracyjnaSerializer


class KategoriaWyrobuListView(ListAPIView):
    queryset = KategoriaWyrobu.objects.all()
    serializer_class = KategoriaWyrobuSerializer
    permission_classes = [AllowAny]


class WyrobListView(ListAPIView):
    serializer_class = WyrobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Wyrob.objects.filter(dostepny=True)


class WyrobManageView(ListCreateAPIView):
    queryset = Wyrob.objects.all()
    serializer_class = WyrobSerializer


class WyrobDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Wyrob.objects.all()
    serializer_class = WyrobSerializer
