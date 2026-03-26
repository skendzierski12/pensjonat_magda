from django.contrib import admin
from .models import (
    KategoriaMenu, Danie,
    SalaRestauracyjna, ZdjecieSali,
    KategoriaWyrobu, Wyrob, ZdjecieWyrobu
)


class DanieInline(admin.TabularInline):
    model = Danie
    extra = 1
    fields = ['nazwa', 'cena', 'kolejnosc', 'widoczne']


class ZdjecieSaliInline(admin.TabularInline):
    model = ZdjecieSali
    extra = 2


class ZdjecieWyrobuInline(admin.TabularInline):
    model = ZdjecieWyrobu
    extra = 2


@admin.register(KategoriaMenu)
class KategoriaMenuAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kolejnosc', 'aktywna']
    list_editable = ['kolejnosc', 'aktywna']
    inlines = [DanieInline]


@admin.register(Danie)
class DanieAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kategoria', 'cena', 'kolejnosc', 'widoczne',
                    'wegetarianskie', 'wegańskie', 'bezglutenowe']
    list_editable = ['widoczne', 'kolejnosc']
    list_filter = ['kategoria', 'widoczne', 'wegetarianskie', 'wegańskie', 'bezglutenowe']
    search_fields = ['nazwa']


@admin.register(SalaRestauracyjna)
class SalaRestauracyjnaAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'liczba_miejsc', 'dostepna_na_imprezy', 'aktywna']
    list_editable = ['aktywna']
    inlines = [ZdjecieSaliInline]


@admin.register(KategoriaWyrobu)
class KategoriaWyrobuAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kolejnosc']
    list_editable = ['kolejnosc']


@admin.register(Wyrob)
class WyrobAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kategoria', 'cena', 'jednostka', 'dostepny']
    list_editable = ['dostepny']
    list_filter = ['kategoria', 'dostepny']
    search_fields = ['nazwa']
    inlines = [ZdjecieWyrobuInline]
