from django.contrib import admin
from .models import KategoriaAtrakcji, Atrakcja, ZdjecieAtrakcji


class ZdjecieAtrakcjiInline(admin.TabularInline):
    model = ZdjecieAtrakcji
    extra = 2
    fields = ['zdjecie', 'opis', 'kolejnosc', 'okladka']


@admin.register(KategoriaAtrakcji)
class KategoriaAtrakcjiAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'ikona', 'kolejnosc']
    list_editable = ['kolejnosc']


@admin.register(Atrakcja)
class AtrakcjaAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kategoria', 'odleglosc_km',
                    'czas_dojazdu_min', 'trudnosc', 'aktywna']
    list_editable = ['aktywna']
    list_filter = ['kategoria', 'trudnosc', 'aktywna']
    search_fields = ['nazwa', 'opis']
    inlines = [ZdjecieAtrakcjiInline]
