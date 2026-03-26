from rest_framework import serializers
from .models import (
    KategoriaMenu, Danie,
    SalaRestauracyjna, ZdjecieSali,
    KategoriaWyrobu, Wyrob, ZdjecieWyrobu, GodzinyOtwarcia
)

class GodzinyOtwarciaSer(serializers.ModelSerializer):
    dzien_nazwa = serializers.CharField(source='get_dzien_display', read_only=True)

    class Meta:
        model = GodzinyOtwarcia
        fields = '__all__'

class DanieSerializer(serializers.ModelSerializer):
    kategoria_nazwa = serializers.CharField(source='kategoria.nazwa', read_only=True)

    class Meta:
        model = Danie
        fields = '__all__'


class KategoriaMenuSerializer(serializers.ModelSerializer):
    dania = DanieSerializer(many=True, read_only=True)

    class Meta:
        model = KategoriaMenu
        fields = '__all__'


class ZdjecieSaliSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZdjecieSali
        fields = '__all__'


class SalaRestauracyjnaSerializer(serializers.ModelSerializer):
    zdjecia = ZdjecieSaliSerializer(many=True, read_only=True)

    class Meta:
        model = SalaRestauracyjna
        fields = '__all__'


class ZdjecieWyrobuSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZdjecieWyrobu
        fields = '__all__'


class WyrobSerializer(serializers.ModelSerializer):
    zdjecia = ZdjecieWyrobuSerializer(many=True, read_only=True)
    kategoria_nazwa = serializers.CharField(source='kategoria.nazwa', read_only=True)

    class Meta:
        model = Wyrob
        fields = '__all__'


class KategoriaWyrobuSerializer(serializers.ModelSerializer):
    wyroby = WyrobSerializer(many=True, read_only=True)

    class Meta:
        model = KategoriaWyrobu
        fields = '__all__'
