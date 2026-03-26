from django.shortcuts import render

from rest_framework.generics import (
    ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import KategoriaAtrakcji, Atrakcja
from .serializers import KategoriaAtrakcjiSerializer, AtrakcjaSerializer


class KategoriaAtrakcjiListView(ListAPIView):
    queryset = KategoriaAtrakcji.objects.all()
    serializer_class = KategoriaAtrakcjiSerializer
    permission_classes = [AllowAny]


class KategoriaAtrakcjiManageView(ListCreateAPIView):
    queryset = KategoriaAtrakcji.objects.all()
    serializer_class = KategoriaAtrakcjiSerializer


class KategoriaAtrakcjiDetailView(RetrieveUpdateDestroyAPIView):
    queryset = KategoriaAtrakcji.objects.all()
    serializer_class = KategoriaAtrakcjiSerializer


class AtrakcjaListView(ListAPIView):
    serializer_class = AtrakcjaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Atrakcja.objects.filter(aktywna=True)
        kategoria = self.request.query_params.get('kategoria')
        if kategoria:
            queryset = queryset.filter(kategoria__id=kategoria)
        return queryset


class AtrakcjaManageView(ListCreateAPIView):
    queryset = Atrakcja.objects.all()
    serializer_class = AtrakcjaSerializer


class AtrakcjaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Atrakcja.objects.all()
    serializer_class = AtrakcjaSerializer


