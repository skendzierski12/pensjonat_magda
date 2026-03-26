from django.contrib import admin
from .models import (
    TypPokoju, UdogodnieniePokoju, Pokoj, ZdjeciePokoj,
    SezonCenowy, CenaPokoj, Impreza
)


class ZdjeciePokojuInline(admin.TabularInline):
    model = ZdjeciePokoj
    extra = 3


class CenaPokojuInline(admin.TabularInline):
    model = CenaPokoj
    extra = 1


@admin.register(TypPokoju)
class TypPokojuAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'liczba_osob', 'powierzchnia', 'aktywny']
    list_editable = ['aktywny']
    inlines = [ZdjeciePokojuInline, CenaPokojuInline]


@admin.register(UdogodnieniePokoju)
class UdogodnienePokojuAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'ikona']
    search_fields = ['nazwa']


@admin.register(Pokoj)
class PokojAdmin(admin.ModelAdmin):
    list_display = ['numer', 'typ', 'dostepny']
    list_editable = ['dostepny']
    list_filter = ['typ', 'dostepny']
    filter_horizontal = ['udogodnienia']


@admin.register(SezonCenowy)
class SezonCenowyAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'rodzaj', 'data_od', 'data_do', 'aktywny']
    list_editable = ['aktywny']
    list_filter = ['rodzaj', 'aktywny']


@admin.register(Impreza)
class ImprezaAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'cena_od', 'aktywna']
    list_editable = ['aktywna']
