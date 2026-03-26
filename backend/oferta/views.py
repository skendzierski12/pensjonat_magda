from django.shortcuts import render

from rest_framework.generics import (
    ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import TypPokoju, Pokoj, UdogodnieniePokoju, ZdjeciePokoj, SezonCenowy, CenaPokoj, Impreza
from .serializers import (
    TypPokojuSerializer, PokojSerializer, UdogodnieniePokojuSerializer,
    SezonCenowySerializer, CenaPokojuSerializer, ImprezaSerializer, ZdjeciePokojuSerializer

)


class TypPokojuListView(ListAPIView):
    serializer_class = TypPokojuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TypPokoju.objects.filter(aktywny=True)


class TypPokojuManageView(ListCreateAPIView):
    queryset = TypPokoju.objects.all()
    serializer_class = TypPokojuSerializer


class TypPokojuDetailView(RetrieveUpdateDestroyAPIView):
    queryset = TypPokoju.objects.all()
    serializer_class = TypPokojuSerializer


class PokojListView(ListAPIView):
    serializer_class = PokojSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Pokoj.objects.filter(dostepny=True)


class PokojManageView(ListCreateAPIView):
    queryset = Pokoj.objects.all()
    serializer_class = PokojSerializer


class PokojDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Pokoj.objects.all()
    serializer_class = PokojSerializer

class ZdjeciePokojuManageView(ListCreateAPIView):
    serializer_class = ZdjeciePokojuSerializer

    def get_queryset(self):
        qs = ZdjeciePokoj.objects.all()
        typ = self.request.query_params.get('typ_pokoju')
        if typ:
            qs = qs.filter(typ_pokoju__id=typ)
        return qs

class ZdjeciePokojuDetailView(RetrieveUpdateDestroyAPIView):
    queryset = ZdjeciePokoj.objects.all()
    serializer_class = ZdjeciePokojuSerializer


class UdogodnieniePokojuListView(ListAPIView):
    queryset = UdogodnieniePokoju.objects.all()
    serializer_class = UdogodnieniePokojuSerializer
    permission_classes = [AllowAny]


class SezonCenowyListView(ListAPIView):
    serializer_class = SezonCenowySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return SezonCenowy.objects.filter(aktywny=True)


class SezonCenowyManageView(ListCreateAPIView):
    queryset = SezonCenowy.objects.all()
    serializer_class = SezonCenowySerializer


class SezonCenowyDetailView(RetrieveUpdateDestroyAPIView):
    queryset = SezonCenowy.objects.all()
    serializer_class = SezonCenowySerializer


class ImprezaListView(ListAPIView):
    serializer_class = ImprezaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Impreza.objects.filter(aktywna=True)


class ImprezaManageView(ListCreateAPIView):
    queryset = Impreza.objects.all()
    serializer_class = ImprezaSerializer


class ImprezaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Impreza.objects.all()
    serializer_class = ImprezaSerializer

class CenaPokojuManageView(ListCreateAPIView):
    queryset = CenaPokoj.objects.all()
    serializer_class = CenaPokojuSerializer

class CenaPokojuDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CenaPokoj.objects.all()
    serializer_class = CenaPokojuSerializer
