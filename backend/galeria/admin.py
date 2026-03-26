from django.contrib import admin
from .models import SekcjaGalerii, Zdjecie


class ZdjecieInline(admin.TabularInline):
    model = Zdjecie
    extra = 3
    fields = ['zdjecie', 'tytul', 'kolejnosc', 'aktywne', 'wyroznienie']


@admin.register(SekcjaGalerii)
class SekcjaGaleriiAdmin(admin.ModelAdmin):
    list_display = ['nazwa', 'kolejnosc', 'aktywna']
    list_editable = ['kolejnosc', 'aktywna']
    inlines = [ZdjecieInline]


@admin.register(Zdjecie)
class ZdjecieAdmin(admin.ModelAdmin):
    list_display = ['tytul', 'sekcja', 'kolejnosc', 'aktywne', 'wyroznienie', 'data_dodania']
    list_editable = ['kolejnosc', 'aktywne', 'wyroznienie']
    list_filter = ['sekcja', 'aktywne', 'wyroznienie']
    search_fields = ['tytul', 'opis']
    readonly_fields = ['data_dodania']
