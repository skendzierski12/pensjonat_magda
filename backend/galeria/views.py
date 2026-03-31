from django.shortcuts import render
from django.db.models import ProtectedError
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import SekcjaGalerii, Zdjecie
from .serializers import SekcjaGaleriiSerializer, ZdjecieSerializer


class SekcjaGaleriiListView(ListAPIView):
    serializer_class = SekcjaGaleriiSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return SekcjaGalerii.objects.filter(aktywna=True)


class SekcjaGaleriiManageView(ListCreateAPIView):
    queryset = SekcjaGalerii.objects.all()
    serializer_class = SekcjaGaleriiSerializer


class SekcjaGaleriiDetailView(RetrieveUpdateDestroyAPIView):
    queryset = SekcjaGalerii.objects.all()
    serializer_class = SekcjaGaleriiSerializer

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError(
                "Nie można usunąć kategorii — istnieją przypisane do niej atrakcje."
            )




class ZdjecieListView(ListAPIView):
    serializer_class = ZdjecieSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Zdjecie.objects.filter(aktywne=True)
        sekcja = self.request.query_params.get('sekcja')
        if sekcja:
            queryset = queryset.filter(sekcja__nazwa=sekcja)
        return queryset


class ZdjecieManageView(ListCreateAPIView):
    queryset = Zdjecie.objects.all()
    serializer_class = ZdjecieSerializer


class ZdjecieDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Zdjecie.objects.all()
    serializer_class = ZdjecieSerializer
