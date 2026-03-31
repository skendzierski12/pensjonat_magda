from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from django.db.models import ProtectedError
from .models import KategoriaAtrakcji, Atrakcja, ZdjecieAtrakcji


# ─────────────────────────────────────────
# MODELE
# ─────────────────────────────────────────

class KategoriaAtrakcjiModelTest(TestCase):

    def test_str(self):
        k = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        self.assertEqual(str(k), "Szlaki")

    def test_ikona_opcjonalna(self):
        k = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        self.assertEqual(k.ikona, "")

    def test_domyslna_kolejnosc(self):
        k = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        self.assertEqual(k.kolejnosc, 0)

    def test_ordering_po_kolejnosci(self):
        KategoriaAtrakcji.objects.create(nazwa="Zabytki", kolejnosc=3)
        KategoriaAtrakcji.objects.create(nazwa="Szlaki", kolejnosc=1)
        KategoriaAtrakcji.objects.create(nazwa="Sport", kolejnosc=2)
        nazwy = list(KategoriaAtrakcji.objects.values_list('nazwa', flat=True))
        self.assertEqual(nazwy, ["Szlaki", "Sport", "Zabytki"])

    def test_usun_z_atrakcja_blokowane(self):
        k = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        Atrakcja.objects.create(
            kategoria=k, nazwa="Szlak niebieski",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        with self.assertRaises(ProtectedError):
            k.delete()


class AtrakcjaModelTest(TestCase):

    def setUp(self):
        self.kat = KategoriaAtrakcji.objects.create(nazwa="Szlaki")

    def test_str_zawiera_nazwe_i_odleglosc(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak niebieski",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertIn("Szlak niebieski", str(a))
        self.assertIn("5.0", str(a))

    def test_domyslnie_aktywna(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertTrue(a.aktywna)

    def test_domyslna_kolejnosc(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertEqual(a.kolejnosc, 0)

    def test_czas_dojazdu_opcjonalny(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertIsNone(a.czas_dojazdu_min)

    def test_trudnosc_opcjonalna(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertEqual(a.trudnosc, "")

    def test_dlugosc_trasy_opcjonalna(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertIsNone(a.dlugosc_trasy_km)

    def test_link_zewnetrzny_opcjonalny(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.assertEqual(a.link_zewnetrzny, "")

    def test_ordering_po_kategorii_kolejnosci_odleglosci(self):
        kat2 = KategoriaAtrakcji.objects.create(nazwa="Zabytki", kolejnosc=2)
        Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Daleki", opis="x",
            odleglosc_km=Decimal("10.0"), kolejnosc=0
        )
        Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Bliski", opis="x",
            odleglosc_km=Decimal("2.0"), kolejnosc=0
        )
        Atrakcja.objects.create(
            kategoria=kat2, nazwa="Zamek", opis="x",
            odleglosc_km=Decimal("3.0"), kolejnosc=0
        )
        pierwsza = Atrakcja.objects.first()
        self.assertEqual(pierwsza.nazwa, "Bliski")

    def test_trudnosc_choices(self):
        a = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak trudny",
            opis="Opis", odleglosc_km=Decimal("15.0"),
            trudnosc=Atrakcja.TrudnoscTrasy.TRUDNA
        )
        self.assertEqual(a.trudnosc, "trudna")
        self.assertEqual(a.get_trudnosc_display(), "Trudna")


class ZdjecieAtrakcjiModelTest(TestCase):

    def setUp(self):
        self.kat = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        self.atrakcja = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )

    def test_str_zawiera_nazwe_atrakcji(self):
        z = ZdjecieAtrakcji(atrakcja=self.atrakcja, kolejnosc=1)
        self.assertIn("Szlak", str(z))

    def test_domyslnie_nie_okladka(self):
        z = ZdjecieAtrakcji.objects.create(
            atrakcja=self.atrakcja,
            zdjecie="atrakcje/test.jpg",
            kolejnosc=1
        )
        self.assertFalse(z.okladka)

    def test_opis_opcjonalny(self):
        z = ZdjecieAtrakcji.objects.create(
            atrakcja=self.atrakcja,
            zdjecie="atrakcje/test.jpg",
            kolejnosc=1
        )
        self.assertEqual(z.opis, "")

    def test_ordering_okladka_pierwsza(self):
        ZdjecieAtrakcji.objects.create(
            atrakcja=self.atrakcja, zdjecie="atrakcje/a.jpg",
            kolejnosc=1, okladka=False
        )
        ZdjecieAtrakcji.objects.create(
            atrakcja=self.atrakcja, zdjecie="atrakcje/b.jpg",
            kolejnosc=2, okladka=True
        )
        pierwsze = ZdjecieAtrakcji.objects.first()
        self.assertTrue(pierwsze.okladka)

    def test_usun_atrakcje_kaskadowo_usuwa_zdjecia(self):
        ZdjecieAtrakcji.objects.create(
            atrakcja=self.atrakcja, zdjecie="atrakcje/test.jpg", kolejnosc=1
        )
        atrakcja_pk = self.atrakcja.pk
        self.atrakcja.delete()
        self.assertFalse(ZdjecieAtrakcji.objects.filter(atrakcja__pk=atrakcja_pk).exists())


# ─────────────────────────────────────────
# API — KATEGORIA ATRAKCJI
# ─────────────────────────────────────────

class KategoriaAtrakcjiAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaAtrakcji.objects.create(nazwa="Szlaki", kolejnosc=1)
        self.kat2 = KategoriaAtrakcji.objects.create(nazwa="Zabytki", kolejnosc=2)

    def test_lista_200(self):
        r = self.client.get('/api/atrakcje/kategorie/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/atrakcje/kategorie/')
        kat = r.data[0]
        for pole in ['id', 'nazwa', 'ikona', 'kolejnosc', 'atrakcje']:
            self.assertIn(pole, kat)

    def test_lista_atrakcje_puste_gdy_brak(self):
        r = self.client.get('/api/atrakcje/kategorie/')
        kat = r.data[0]
        self.assertEqual(kat['atrakcje'], [])

    def test_lista_atrakcje_zagniezdzone(self):
        Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak niebieski",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        r = self.client.get('/api/atrakcje/kategorie/')
        kat = next(k for k in r.data if k['nazwa'] == "Szlaki")
        self.assertEqual(len(kat['atrakcje']), 1)
        self.assertEqual(kat['atrakcje'][0]['nazwa'], "Szlak niebieski")

    def test_lista_ordering_po_kolejnosci(self):
        r = self.client.get('/api/atrakcje/kategorie/')
        nazwy = [k['nazwa'] for k in r.data]
        self.assertEqual(nazwy, ["Szlaki", "Zabytki"])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/atrakcje/manage/kategorie/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/atrakcje/manage/kategorie/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/kategorie/', {
            'nazwa': 'Sport', 'kolejnosc': 3
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(KategoriaAtrakcji.objects.filter(nazwa='Sport').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/kategorie/', {'kolejnosc': 1})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/atrakcje/manage/kategorie/{self.kat.pk}/',
            {'nazwa': 'Szlaki górskie'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.kat.refresh_from_db()
        self.assertEqual(self.kat.nazwa, 'Szlaki górskie')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/atrakcje/manage/kategorie/{self.kat2.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(KategoriaAtrakcji.objects.filter(pk=self.kat2.pk).exists())

    def test_manage_delete_z_atrakcja_blokowane(self):
        Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak",
            opis="Opis", odleglosc_km=Decimal("5.0")
        )
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/atrakcje/manage/kategorie/{self.kat.pk}/')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(KategoriaAtrakcji.objects.filter(pk=self.kat.pk).exists())

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/atrakcje/manage/kategorie/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — ATRAKCJA
# ─────────────────────────────────────────

class AtrakcjaAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.kat = KategoriaAtrakcji.objects.create(nazwa="Szlaki")
        self.aktywna = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Szlak niebieski",
            opis="Widoki na góry", odleglosc_km=Decimal("5.0"),
            trudnosc="latwa", aktywna=True
        )
        self.nieaktywna = Atrakcja.objects.create(
            kategoria=self.kat, nazwa="Ukryta",
            opis="Opis", odleglosc_km=Decimal("3.0"),
            aktywna=False
        )

    def test_lista_200(self):
        r = self.client.get('/api/atrakcje/lista/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/atrakcje/lista/')
        nazwy = [a['nazwa'] for a in r.data]
        self.assertIn("Szlak niebieski", nazwy)
        self.assertNotIn("Ukryta", nazwy)

    def test_lista_pusta_gdy_brak_aktywnych(self):
        Atrakcja.objects.update(aktywna=False)
        r = self.client.get('/api/atrakcje/lista/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/atrakcje/lista/')
        atrakcja = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'odleglosc_km', 'trudnosc',
                     'kategoria_nazwa', 'zdjecia', 'link_zewnetrzny']:
            self.assertIn(pole, atrakcja)

    def test_lista_zdjecia_puste_gdy_brak(self):
        r = self.client.get('/api/atrakcje/lista/')
        atrakcja = r.data[0]
        self.assertEqual(atrakcja['zdjecia'], [])

    def test_filtrowanie_po_kategorii(self):
        kat2 = KategoriaAtrakcji.objects.create(nazwa="Zabytki")
        Atrakcja.objects.create(
            kategoria=kat2, nazwa="Zamek",
            opis="Opis", odleglosc_km=Decimal("10.0"), aktywna=True
        )
        r = self.client.get(f'/api/atrakcje/lista/?kategoria={self.kat.pk}')
        nazwy = [a['nazwa'] for a in r.data]
        self.assertIn("Szlak niebieski", nazwy)
        self.assertNotIn("Zamek", nazwy)

    def test_filtrowanie_po_kategorii_nieistniejaca_pusta_lista(self):
        r = self.client.get('/api/atrakcje/lista/?kategoria=99999')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_kategoria_nazwa_w_response(self):
        r = self.client.get('/api/atrakcje/lista/')
        atrakcja = r.data[0]
        self.assertEqual(atrakcja['kategoria_nazwa'], "Szlaki")

    def test_trudnosc_choices_w_response(self):
        r = self.client.get('/api/atrakcje/lista/')
        atrakcja = next(a for a in r.data if a['nazwa'] == "Szlak niebieski")
        self.assertEqual(atrakcja['trudnosc'], "latwa")

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/atrakcje/manage/lista/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/atrakcje/manage/lista/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/lista/', {
            'kategoria': self.kat.pk,
            'nazwa': 'Nowy szlak',
            'opis': 'Opis szlaku',
            'odleglosc_km': '8.5',
            'aktywna': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Atrakcja.objects.filter(nazwa='Nowy szlak').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/lista/', {
            'kategoria': self.kat.pk,
            'opis': 'Opis', 'odleglosc_km': '5.0'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_odleglosci_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/lista/', {
            'kategoria': self.kat.pk,
            'nazwa': 'Test', 'opis': 'Opis'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_kategorii_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/lista/', {
            'nazwa': 'Test', 'opis': 'Opis', 'odleglosc_km': '5.0'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_niepoprawna_trudnosc_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/atrakcje/manage/lista/', {
            'kategoria': self.kat.pk,
            'nazwa': 'Test', 'opis': 'Opis',
            'odleglosc_km': '5.0', 'trudnosc': 'bardzo_trudna'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/atrakcje/manage/lista/{self.aktywna.pk}/',
            {'nazwa': 'Szlak zmieniony'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywna.refresh_from_db()
        self.assertEqual(self.aktywna.nazwa, 'Szlak zmieniony')

    def test_manage_update_aktywnosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/atrakcje/manage/lista/{self.aktywna.pk}/',
            {'aktywna': False}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywna.refresh_from_db()
        self.assertFalse(self.aktywna.aktywna)

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/atrakcje/manage/lista/{self.nieaktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Atrakcja.objects.filter(pk=self.nieaktywna.pk).exists())

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/atrakcje/manage/lista/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_manage_delete_usuwa_kaskadowo_zdjecia(self):
        ZdjecieAtrakcji.objects.create(
            atrakcja=self.aktywna, zdjecie="atrakcje/test.jpg", kolejnosc=1
        )
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/atrakcje/manage/lista/{self.aktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ZdjecieAtrakcji.objects.filter(atrakcja=self.aktywna).exists())
