from rest_framework import serializers
from .models import (
    TypPokoju, UdogodnieniePokoju, Pokoj, ZdjeciePokoj,
    SezonCenowy, CenaPokoj, Impreza
)


class UdogodnieniePokojuSerializer(serializers.ModelSerializer):
    class Meta:
        model = UdogodnieniePokoju
        fields = '__all__'


class ZdjeciePokojuSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZdjeciePokoj
        fields = '__all__'


class CenaPokojuSerializer(serializers.ModelSerializer):
    sezon_nazwa = serializers.CharField(source='sezon.nazwa', read_only=True)
    sezon_rodzaj = serializers.CharField(source='sezon.rodzaj', read_only=True)

    class Meta:
        model = CenaPokoj
        fields = ['id', 'sezon', 'sezon_nazwa', 'sezon_rodzaj', 'cena_za_noc']


class TypPokojuSerializer(serializers.ModelSerializer):
    zdjecia = ZdjeciePokojuSerializer(many=True, read_only=True)
    ceny = CenaPokojuSerializer(many=True, read_only=True)
    udogodnienia = UdogodnieniePokojuSerializer(many=True, read_only=True)

    class Meta:
        model = TypPokoju
        fields = '__all__'


class PokojSerializer(serializers.ModelSerializer):
    typ = TypPokojuSerializer(read_only=True)
    typ_id = serializers.PrimaryKeyRelatedField(
        queryset=TypPokoju.objects.all(),
        source='typ',
        write_only=True
    )

    class Meta:
        model = Pokoj
        fields = ['id', 'numer', 'typ', 'typ_id',
                  'opis_dodatkowy', 'udogodnienia', 'dostepny']


class SezonCenowySerializer(serializers.ModelSerializer):
    class Meta:
        model = SezonCenowy
        fields = '__all__'


class ImprezaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impreza
        fields = '__all__'
