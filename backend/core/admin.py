from django.contrib import admin
from .models import UstawieniaStrony, ZdjecieHero, ONas, Ogloszenie, Kontakt


@admin.register(UstawieniaStrony)
class UstawieniaStronyAdmin(admin.ModelAdmin):
    list_display = ['nazwa_pensjonatu', 'telefon', 'email']


@admin.register(ZdjecieHero)
class ZdjecieHeroAdmin(admin.ModelAdmin):
    list_display = ['tytul', 'kolejnosc', 'aktywne']
    list_editable = ['kolejnosc', 'aktywne']
    ordering = ['kolejnosc']


@admin.register(ONas)
class ONasAdmin(admin.ModelAdmin):
    list_display = ['tytul', 'kolejnosc', 'aktywne']
    list_editable = ['kolejnosc', 'aktywne']


@admin.register(Ogloszenie)
class OgloszenieAdmin(admin.ModelAdmin):
    list_display = ['tytul', 'data_dodania', 'data_wygasniecia', 'aktywne', 'wazne']
    list_editable = ['aktywne', 'wazne']
    list_filter = ['aktywne', 'wazne']
    search_fields = ['tytul', 'tresc']
    readonly_fields = ['data_dodania']


@admin.register(Kontakt)
class KontaktAdmin(admin.ModelAdmin):
    list_display = ['imie', 'email', 'temat', 'data_wyslania', 'przeczytana']
    list_editable = ['przeczytana']
    list_filter = ['przeczytana']
    search_fields = ['imie', 'email', 'temat']
    readonly_fields = ['imie', 'email', 'temat', 'wiadomosc', 'data_wyslania']
