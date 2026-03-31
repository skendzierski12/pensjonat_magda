from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from django.db.models import ProtectedError
from .models import (
    KategoriaMenu, Danie,
    SalaRestauracyjna, ZdjecieSali,
    KategoriaWyrobu, Wyrob, ZdjecieWyrobu
)


# ─────────────────────────────────────────
# MODELE
# ─────────────────────────────────────────

class KategoriaMenuModelTest(TestCase):

    def test_str(self):
        k = KategoriaMenu.objects.create(nazwa="Zupy")
        self.assertEqual(str(k), "Zupy")

    def test_domyslnie_aktywna(self):
        k = KategoriaMenu.objects.create(nazwa="Zupy")
        self.assertTrue(k.aktywna)

    def test_domyslna_kolejnosc(self):
        k = KategoriaMenu.objects.create(nazwa="Zupy")
        self.assertEqual(k.kolejnosc, 0)

    def test_ordering_po_kolejnosci(self):
        KategoriaMenu.objects.create(nazwa="Desery", kolejnosc=3)
        KategoriaMenu.objects.create(nazwa="Zupy", kolejnosc=1)
        KategoriaMenu.objects.create(nazwa="Dania główne", kolejnosc=2)
        nazwy = list(KategoriaMenu.objects.values_list('nazwa', flat=True))
        self.assertEqual(nazwy, ["Zupy", "Dania główne", "Desery"])


class DanieModelTest(TestCase):

    def setUp(self):
        self.kat = KategoriaMenu.objects.create(nazwa="Zupy")

    def test_str_zawiera_nazwe_i_kategorie(self):
        d = Danie.objects.create(
            kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00")
        )
        self.assertIn("Żurek", str(d))
        self.assertIn("Zupy", str(d))

    def test_domyslnie_widoczne(self):
        d = Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        self.assertTrue(d.widoczne)

    def test_domyslnie_nie_wegetarianskie(self):
        d = Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        self.assertFalse(d.wegetarianskie)
        self.assertFalse(d.wegańskie)
        self.assertFalse(d.bezglutenowe)

    def test_opis_opcjonalny(self):
        d = Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        self.assertEqual(d.opis, "")

    def test_zdjecie_opcjonalne(self):
        d = Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        self.assertFalse(bool(d.zdjecie))

    def test_usun_kategorie_blokowane(self):
        Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        with self.assertRaises(ProtectedError):
            self.kat.delete()

    def test_ordering_po_kategorii_i_kolejnosci(self):
        kat2 = KategoriaMenu.objects.create(nazwa="Desery", kolejnosc=2)
        Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"), kolejnosc=2)
        Danie.objects.create(kategoria=self.kat, nazwa="Barszcz", cena=Decimal("10.00"), kolejnosc=1)
        Danie.objects.create(kategoria=kat2, nazwa="Sernik", cena=Decimal("15.00"), kolejnosc=1)
        pierwsze = Danie.objects.first()
        self.assertEqual(pierwsze.nazwa, "Barszcz")


class SalaRestauracyjnaModelTest(TestCase):

    def test_str_zawiera_nazwe_i_miejsca(self):
        s = SalaRestauracyjna.objects.create(nazwa="Sala główna", opis="Opis", liczba_miejsc=50)
        self.assertIn("Sala główna", str(s))
        self.assertIn("50", str(s))

    def test_domyslnie_aktywna(self):
        s = SalaRestauracyjna.objects.create(nazwa="Sala", opis="Opis", liczba_miejsc=50)
        self.assertTrue(s.aktywna)

    def test_domyslnie_niedostepna_na_imprezy(self):
        s = SalaRestauracyjna.objects.create(nazwa="Sala", opis="Opis", liczba_miejsc=50)
        self.assertFalse(s.dostepna_na_imprezy)


class KategoriaWyrobuModelTest(TestCase):

    def test_str(self):
        k = KategoriaWyrobu.objects.create(nazwa="Kiełbasy")
        self.assertEqual(str(k), "Kiełbasy")

    def test_ordering_po_kolejnosci(self):
        KategoriaWyrobu.objects.create(nazwa="Przetwory", kolejnosc=2)
        KategoriaWyrobu.objects.create(nazwa="Kiełbasy", kolejnosc=1)
        pierwsza = KategoriaWyrobu.objects.first()
        self.assertEqual(pierwsza.nazwa, "Kiełbasy")


class WyrobModelTest(TestCase):

    def setUp(self):
        self.kat = KategoriaWyrobu.objects.create(nazwa="Kiełbasy")

    def test_str_zawiera_nazwe_cene_jednostke(self):
        w = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa wiejska",
            opis="Opis", cena=Decimal("25.00"), jednostka="kg"
        )
        self.assertIn("Kiełbasa wiejska", str(w))
        self.assertIn("25", str(w))
        self.assertIn("kg", str(w))

    def test_domyslnie_dostepny(self):
        w = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa",
            opis="Opis", cena=Decimal("25.00")
        )
        self.assertTrue(w.dostepny)

    def test_domyslna_jednostka_kg(self):
        w = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa",
            opis="Opis", cena=Decimal("25.00")
        )
        self.assertEqual(w.jednostka, "kg")

    def test_sklad_opcjonalny(self):
        w = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa",
            opis="Opis", cena=Decimal("25.00")
        )
        self.assertEqual(w.sklad, "")

    def test_usun_kategorie_blokowane(self):
        Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa",
            opis="Opis", cena=Decimal("25.00")
        )
        with self.assertRaises(ProtectedError):
            self.kat.delete()


# ─────────────────────────────────────────
# API — KATEGORIA MENU
# ─────────────────────────────────────────

class KategoriaMenuAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaMenu.objects.create(nazwa="Zupy", kolejnosc=1, aktywna=True)
        self.kat_nieaktywna = KategoriaMenu.objects.create(nazwa="Ukryta", kolejnosc=2, aktywna=False)

    def test_lista_200(self):
        r = self.client.get('/api/restauracja/menu/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/restauracja/menu/')
        nazwy = [k['nazwa'] for k in r.data]
        self.assertIn("Zupy", nazwy)
        self.assertNotIn("Ukryta", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/restauracja/menu/')
        kat = r.data[0]
        for pole in ['id', 'nazwa', 'kolejnosc', 'aktywna', 'dania']:
            self.assertIn(pole, kat)

    def test_lista_dania_puste_gdy_brak(self):
        r = self.client.get('/api/restauracja/menu/')
        kat = next(k for k in r.data if k['nazwa'] == "Zupy")
        self.assertEqual(kat['dania'], [])

    def test_lista_dania_zagniezdzone(self):
        Danie.objects.create(kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"))
        r = self.client.get('/api/restauracja/menu/')
        kat = next(k for k in r.data if k['nazwa'] == "Zupy")
        self.assertEqual(len(kat['dania']), 1)
        self.assertEqual(kat['dania'][0]['nazwa'], "Żurek")

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/restauracja/manage/menu/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/restauracja/manage/menu/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/menu/', {
            'nazwa': 'Desery', 'kolejnosc': 3, 'aktywna': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(KategoriaMenu.objects.filter(nazwa='Desery').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/menu/', {'kolejnosc': 1})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/menu/{self.kat.pk}/',
            {'nazwa': 'Zupy zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.kat.refresh_from_db()
        self.assertEqual(self.kat.nazwa, 'Zupy zmienione')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/menu/{self.kat_nieaktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/restauracja/manage/menu/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — DANIE
# ─────────────────────────────────────────

class DanieAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaMenu.objects.create(nazwa="Zupy", aktywna=True)
        self.widoczne = Danie.objects.create(
            kategoria=self.kat, nazwa="Żurek", cena=Decimal("12.00"), widoczne=True
        )
        self.ukryte = Danie.objects.create(
            kategoria=self.kat, nazwa="Ukryte", cena=Decimal("10.00"), widoczne=False
        )

    def test_lista_tylko_widoczne(self):
        r = self.client.get('/api/restauracja/dania/')
        nazwy = [d['nazwa'] for d in r.data]
        self.assertIn("Żurek", nazwy)
        self.assertNotIn("Ukryte", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/restauracja/dania/')
        danie = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'cena', 'widoczne', 'kategoria_nazwa',
                     'wegetarianskie', 'wegańskie', 'bezglutenowe']:
            self.assertIn(pole, danie)

    def test_filtrowanie_po_kategorii(self):
        kat2 = KategoriaMenu.objects.create(nazwa="Desery", aktywna=True)
        Danie.objects.create(kategoria=kat2, nazwa="Sernik", cena=Decimal("15.00"))
        r = self.client.get(f'/api/restauracja/dania/?kategoria={self.kat.pk}')
        nazwy = [d['nazwa'] for d in r.data]
        self.assertIn("Żurek", nazwy)
        self.assertNotIn("Sernik", nazwy)

    def test_lista_pusta_gdy_brak_widocznych(self):
        Danie.objects.update(widoczne=False)
        r = self.client.get('/api/restauracja/dania/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/restauracja/manage/dania/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/restauracja/manage/dania/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'kategoria': self.kat.pk,
            'nazwa': 'Barszcz',
            'cena': '10.00',
            'widoczne': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Danie.objects.filter(nazwa='Barszcz').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'kategoria': self.kat.pk, 'cena': '10.00'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_ceny_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'kategoria': self.kat.pk, 'nazwa': 'Test'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_kategorii_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/dania/', {
            'nazwa': 'Test', 'cena': '10.00'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update_widocznosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/dania/{self.widoczne.pk}/',
            {'widoczne': False}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.widoczne.refresh_from_db()
        self.assertFalse(self.widoczne.widoczne)

    def test_manage_update_cena(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/dania/{self.widoczne.pk}/',
            {'cena': '15.00'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.widoczne.refresh_from_db()
        self.assertEqual(self.widoczne.cena, Decimal("15.00"))

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/dania/{self.ukryte.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Danie.objects.filter(pk=self.ukryte.pk).exists())

    def test_manage_delete_nieistniejace_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/restauracja/manage/dania/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — SALA RESTAURACYJNA
# ─────────────────────────────────────────

class SalaRestauracyjnaAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.aktywna = SalaRestauracyjna.objects.create(
            nazwa="Sala główna", opis="Opis", liczba_miejsc=50, aktywna=True
        )
        self.nieaktywna = SalaRestauracyjna.objects.create(
            nazwa="Ukryta", opis="Opis", liczba_miejsc=20, aktywna=False
        )

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/restauracja/sale/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nazwy = [s['nazwa'] for s in r.data]
        self.assertIn("Sala główna", nazwy)
        self.assertNotIn("Ukryta", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/restauracja/sale/')
        sala = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'liczba_miejsc', 'dostepna_na_imprezy', 'zdjecia']:
            self.assertIn(pole, sala)

    def test_zdjecia_puste_gdy_brak(self):
        r = self.client.get('/api/restauracja/sale/')
        sala = r.data[0]
        self.assertEqual(sala['zdjecia'], [])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/restauracja/manage/sale/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/restauracja/manage/sale/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/sale/', {
            'nazwa': 'Sala weselna', 'opis': 'Opis', 'liczba_miejsc': 100,
            'dostepna_na_imprezy': True, 'aktywna': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/sale/', {
            'opis': 'Opis', 'liczba_miejsc': 50
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/sale/{self.aktywna.pk}/',
            {'liczba_miejsc': 60}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywna.refresh_from_db()
        self.assertEqual(self.aktywna.liczba_miejsc, 60)

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/sale/{self.nieaktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/restauracja/manage/sale/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — WYRÓB WŁASNY
# ─────────────────────────────────────────

class WyrobAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaWyrobu.objects.create(nazwa="Kiełbasy")
        self.dostepny = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa wiejska",
            opis="Opis", cena=Decimal("25.00"), dostepny=True
        )
        self.niedostepny = Wyrob.objects.create(
            kategoria=self.kat, nazwa="Niedostępny",
            opis="Opis", cena=Decimal("20.00"), dostepny=False
        )

    def test_lista_tylko_dostepne(self):
        r = self.client.get('/api/restauracja/wyroby/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nazwy = [w['nazwa'] for w in r.data]
        self.assertIn("Kiełbasa wiejska", nazwy)
        self.assertNotIn("Niedostępny", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/restauracja/wyroby/')
        wyrob = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'cena', 'jednostka', 'dostepny',
                     'kategoria_nazwa', 'zdjecia']:
            self.assertIn(pole, wyrob)

    def test_lista_pusta_gdy_brak_dostepnych(self):
        Wyrob.objects.update(dostepny=False)
        r = self.client.get('/api/restauracja/wyroby/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/restauracja/manage/wyroby/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/restauracja/manage/wyroby/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/wyroby/', {
            'kategoria': self.kat.pk,
            'nazwa': 'Szynka', 'opis': 'Opis',
            'cena': '35.00', 'jednostka': 'kg', 'dostepny': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/wyroby/', {
            'kategoria': self.kat.pk, 'cena': '35.00', 'opis': 'Opis'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_ceny_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/wyroby/', {
            'kategoria': self.kat.pk, 'nazwa': 'Test', 'opis': 'Opis'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update_dostepnosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/wyroby/{self.dostepny.pk}/',
            {'dostepny': False}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.dostepny.refresh_from_db()
        self.assertFalse(self.dostepny.dostepny)

    def test_manage_update_cena(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/wyroby/{self.dostepny.pk}/',
            {'cena': '30.00'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.dostepny.refresh_from_db()
        self.assertEqual(self.dostepny.cena, Decimal("30.00"))

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/wyroby/{self.niedostepny.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_manage_delete_nieistniejacy_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/restauracja/manage/wyroby/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
class KategoriaWyrobuAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaWyrobu.objects.create(nazwa="Kiełbasy", kolejnosc=1)
        self.kat2 = KategoriaWyrobu.objects.create(nazwa="Przetwory", kolejnosc=2)

    def test_lista_200(self):
        r = self.client.get('/api/restauracja/kategorie-wyrobow/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/restauracja/kategorie-wyrobow/')
        kat = r.data[0]
        for pole in ['id', 'nazwa', 'kolejnosc', 'wyroby']:
            self.assertIn(pole, kat)

    def test_lista_wyroby_puste_gdy_brak(self):
        r = self.client.get('/api/restauracja/kategorie-wyrobow/')
        kat = r.data[0]
        self.assertEqual(kat['wyroby'], [])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/restauracja/manage/kategorie-wyrobow/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/restauracja/manage/kategorie-wyrobow/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/kategorie-wyrobow/', {
            'nazwa': 'Wędliny', 'kolejnosc': 3
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(KategoriaWyrobu.objects.filter(nazwa='Wędliny').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/restauracja/manage/kategorie-wyrobow/', {
            'kolejnosc': 3
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/restauracja/manage/kategorie-wyrobow/{self.kat.pk}/',
            {'nazwa': 'Kiełbasy zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.kat.refresh_from_db()
        self.assertEqual(self.kat.nazwa, 'Kiełbasy zmienione')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/kategorie-wyrobow/{self.kat2.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_manage_delete_z_wyrobem_blokowane(self):
        Wyrob.objects.create(
            kategoria=self.kat, nazwa="Kiełbasa",
            opis="Opis", cena=Decimal("25.00")
        )
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/restauracja/manage/kategorie-wyrobow/{self.kat.pk}/')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(KategoriaWyrobu.objects.filter(pk=self.kat.pk).exists())

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/restauracja/manage/kategorie-wyrobow/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
