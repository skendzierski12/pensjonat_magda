from rest_framework import serializers
from .models import KategoriaAtrakcji, Atrakcja, ZdjecieAtrakcji


class ZdjecieAtrakcjiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZdjecieAtrakcji
        fields = '__all__'


class AtrakcjaSerializer(serializers.ModelSerializer):
    zdjecia = ZdjecieAtrakcjiSerializer(many=True, read_only=True)
    kategoria_nazwa = serializers.CharField(source='kategoria.nazwa', read_only=True)

    class Meta:
        model = Atrakcja
        fields = '__all__'


class KategoriaAtrakcjiSerializer(serializers.ModelSerializer):
    atrakcje = AtrakcjaSerializer(many=True, read_only=True)

    class Meta:
        model = KategoriaAtrakcji
        fields = '__all__'
