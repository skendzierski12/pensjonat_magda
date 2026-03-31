from rest_framework import serializers
from .models import UstawieniaStrony, ZdjecieHero, ONas, Ogloszenie, Kontakt


class UstawieniaStronySerializer(serializers.ModelSerializer):
    class Meta:
        model = UstawieniaStrony
        fields = '__all__'


class ZdjecieHeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZdjecieHero
        fields = '__all__'


class ONasSerializer(serializers.ModelSerializer):
    class Meta:
        model = ONas
        fields = '__all__'


class OgloszenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ogloszenie
        fields = '__all__'


class KontaktSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kontakt
        fields = '__all__'
        read_only_fields = ['data_wyslania']
