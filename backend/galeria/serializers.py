from rest_framework import serializers
from .models import SekcjaGalerii, Zdjecie


class ZdjecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zdjecie
        fields = '__all__'


class SekcjaGaleriiSerializer(serializers.ModelSerializer):
    zdjecia = ZdjecieSerializer(many=True, read_only=True)

    class Meta:
        model = SekcjaGalerii
        fields = '__all__'
