from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Ogloszenie, Kontakt
from oferta.models import TypPokoju, Pokoj
from restauracja.models import KategoriaMenu, Danie
from galeria.models import SekcjaGalerii
from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Ogloszenie, Kontakt
from oferta.models import TypPokoju, Pokoj
from restauracja.models import KategoriaMenu, Danie
from galeria.models import SekcjaGalerii
from atrakcje.models import KategoriaAtrakcji, Atrakcja
from decimal import Decimal
from datetime import date


def get_perm(app, action, model):
    return Permission.objects.get(
        codename=f'{action}_{model}',
        content_type__app_label=app
    )


class SetupMixin:
    """Wspólny setup dla wszystkich testów uprawnień"""

    def setUp(self):
        self.client = APIClient()

        # Grupy
        self.admin_grupa = Group.objects.create(name='Administrator')
        self.recepcja_grupa = Group.objects.create(name='Recepcja')
        self.kuchnia_grupa = Group.objects.create(name='Kuchnia')

        # Uprawnienia Administratora — wszystko
        admin_perms = list(Permission.objects.filter(
            content_type__app_label__in=['core', 'oferta', 'restauracja', 'galeria', 'atrakcje']
        ))
        self.admin_grupa.permissions.set(admin_perms)

        # Uprawnienia Recepcji
        recepcja_perms = [
            get_perm('core', 'add', 'ogloszenie'),
            get_perm('core', 'change', 'ogloszenie'),
            get_perm('core', 'delete', 'ogloszenie'),
            get_perm('core', 'view', 'ogloszenie'),
            get_perm('core', 'view', 'kontakt'),
            get_perm('core', 'change', 'kontakt'),
            get_perm('oferta', 'view', 'typpokoju'),
            get_perm('oferta', 'view', 'pokoj'),
        ]
        self.recepcja_grupa.permissions.set(recepcja_perms)

        # Uprawnienia Kuchni
        kuchnia_perms = [
            get_perm('restauracja', 'add', 'danie'),
            get_perm('restauracja', 'change', 'danie'),
            get_perm('restauracja', 'delete', 'danie'),
            get_perm('restauracja', 'view', 'danie'),
            get_perm('restauracja', 'add', 'kategoriamenu'),
            get_perm('restauracja', 'change', 'kategoriamenu'),
            get_perm('restauracja', 'delete', 'kategoriamenu'),
            get_perm('restauracja', 'view', 'kategoriamenu'),
            get_perm('restauracja', 'add', 'wyrob'),
            get_perm('restauracja', 'change', 'wyrob'),
            get_perm('restauracja', 'delete', 'wyrob'),
            get_perm('restauracja', 'view', 'wyrob'),
        ]
        self.kuchnia_grupa.permissions.set(kuchnia_perms)

        # Userzy
        self.admin = User.objects.create_user(username='admin', password='admin123')
        self.admin.groups.add(self.admin_grupa)

        self.recepcja = User.objects.create_user(username='recepcja', password='recepcja123')
        self.recepcja.groups.add(self.recepcja_grupa)

        self.kuchnia = User.objects.create_user(username='kuchnia', password='kuchnia123')
        self.kuchnia.groups.add(self.kuchnia_grupa)

        # Dane testowe
        self.ogloszenie = Ogloszenie.objects.create(tytul="Test", tresc="Treść")
        self.typ_pokoju = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.kat_menu = KategoriaMenu.objects.create(nazwa="Zupy")
        self.danie = Danie.objects.create(
            kategoria=self.kat_menu, nazwa="Żurek", cena=Decimal("12.00")
        )
        self.sekcja = SekcjaGalerii.objects.create(nazwa="pokoje")
        self.kat_atrakcji = KategoriaAtrakcji.objects.create(nazwa="Szlaki")


class AdministratorPermissionsTest(SetupMixin, TestCase):

    def test_admin_moze_edytowac_ogloszenia(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.patch(
            f'/api/core/manage/ogloszenia/{self.ogloszenie.pk}/',
            {'tytul': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_moze_edytowac_pokoje(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.patch(
            f'/api/oferta/manage/typy-pokoi/{self.typ_pokoju.pk}/',
            {'nazwa': 'Zmieniona'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_moze_edytowac_menu(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.patch(
            f'/api/restauracja/manage/menu/{self.kat_menu.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_moze_edytowac_galerie(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.patch(
            f'/api/galeria/manage/sekcje/{self.sekcja.pk}/',
            {'opis': 'Nowy opis'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_moze_edytowac_atrakcje(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.patch(
            f'/api/atrakcje/manage/kategorie/{self.kat_atrakcji.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_admin_moze_tworzyc_ogloszenia(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.post('/api/core/manage/ogloszenia/', {
            'tytul': 'Nowe', 'tresc': 'Treść', 'aktywne': True, 'wazne': False
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_admin_moze_usuwac(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.delete(f'/api/core/manage/ogloszenia/{self.ogloszenie.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)


class RecepcjaPermissionsTest(SetupMixin, TestCase):

    def test_recepcja_moze_edytowac_ogloszenia(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.patch(
            f'/api/core/manage/ogloszenia/{self.ogloszenie.pk}/',
            {'tytul': 'Zmienione przez recepcję'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_recepcja_moze_tworzyc_ogloszenia(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.post('/api/core/manage/ogloszenia/', {
            'tytul': 'Nowe', 'tresc': 'Treść', 'aktywne': True, 'wazne': False
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_recepcja_moze_czytac_wiadomosci(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.get('/api/core/kontakt/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_recepcja_moze_widziec_pokoje(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.get('/api/oferta/manage/typy-pokoi/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_recepcja_nie_moze_edytowac_pokoi(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.patch(
            f'/api/oferta/manage/typy-pokoi/{self.typ_pokoju.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcja_nie_moze_tworzyc_pokoi(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.post('/api/oferta/manage/typy-pokoi/', {
            'nazwa': 'Nowy', 'opis': 'Opis', 'liczba_osob': 2
        })
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcja_nie_moze_edytowac_menu(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.patch(
            f'/api/restauracja/manage/menu/{self.kat_menu.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcja_nie_moze_tworzyc_dani(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'kategoria': self.kat_menu.pk,
            'nazwa': 'Test', 'cena': '10.00'
        })
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcja_nie_moze_edytowac_galerii(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.patch(
            f'/api/galeria/manage/sekcje/{self.sekcja.pk}/',
            {'opis': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcja_nie_moze_edytowac_atrakcji(self):
        self.client.force_authenticate(user=self.recepcja)
        r = self.client.patch(
            f'/api/atrakcje/manage/kategorie/{self.kat_atrakcji.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class KuchniaPermissionsTest(SetupMixin, TestCase):

    def test_kuchnia_moze_tworzyc_dania(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'kategoria': self.kat_menu.pk,
            'nazwa': 'Barszcz', 'cena': '10.00', 'widoczne': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_kuchnia_moze_edytowac_dania(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/restauracja/manage/dania/{self.danie.pk}/',
            {'cena': '15.00'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_kuchnia_moze_edytowac_menu(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/restauracja/manage/menu/{self.kat_menu.pk}/',
            {'nazwa': 'Zupy zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_kuchnia_nie_moze_edytowac_ogloszen(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/core/manage/ogloszenia/{self.ogloszenie.pk}/',
            {'tytul': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_kuchnia_nie_moze_tworzyc_ogloszen(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.post('/api/core/manage/ogloszenia/', {
            'tytul': 'Nowe', 'tresc': 'Treść'
        })
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_kuchnia_nie_moze_edytowac_pokoi(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/oferta/manage/typy-pokoi/{self.typ_pokoju.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_kuchnia_nie_moze_edytowac_galerii(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/galeria/manage/sekcje/{self.sekcja.pk}/',
            {'opis': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_kuchnia_nie_moze_edytowac_atrakcji(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.patch(
            f'/api/atrakcje/manage/kategorie/{self.kat_atrakcji.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_kuchnia_nie_moze_czytac_wiadomosci(self):
        self.client.force_authenticate(user=self.kuchnia)
        r = self.client.get('/api/core/kontakt/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)



class NiezalogowanyPermissionsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.ogloszenie = Ogloszenie.objects.create(tytul="Test", tresc="Treść")
        self.typ_pokoju = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.kat_menu = KategoriaMenu.objects.create(nazwa="Zupy")

    def test_niezalogowany_nie_moze_edytowac_ogloszen(self):
        r = self.client.patch(
            f'/api/core/manage/ogloszenia/{self.ogloszenie.pk}/',
            {'tytul': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_niezalogowany_nie_moze_edytowac_pokoi(self):
        r = self.client.patch(
            f'/api/oferta/manage/typy-pokoi/{self.typ_pokoju.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_niezalogowany_nie_moze_edytowac_menu(self):
        r = self.client.patch(
            f'/api/restauracja/manage/menu/{self.kat_menu.pk}/',
            {'nazwa': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
