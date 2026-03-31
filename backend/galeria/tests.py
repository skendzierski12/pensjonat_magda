from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.db.models import ProtectedError
from .models import SekcjaGalerii, Zdjecie


# ─────────────────────────────────────────
# MODELE
# ─────────────────────────────────────────

class SekcjaGaleriiModelTest(TestCase):

    def test_str_zwraca_display_nazwy(self):
        s = SekcjaGalerii.objects.create(nazwa="pokoje")
        self.assertEqual(str(s), "Pokoje")

    def test_domyslnie_aktywna(self):
        s = SekcjaGalerii.objects.create(nazwa="pokoje")
        self.assertTrue(s.aktywna)

    def test_domyslna_kolejnosc(self):
        s = SekcjaGalerii.objects.create(nazwa="pokoje")
        self.assertEqual(s.kolejnosc, 0)

    def test_opis_opcjonalny(self):
        s = SekcjaGalerii.objects.create(nazwa="pokoje")
        self.assertEqual(s.opis, "")

    def test_nazwa_unikalna(self):
        SekcjaGalerii.objects.create(nazwa="pokoje")
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            SekcjaGalerii.objects.create(nazwa="pokoje")

    def test_ordering_po_kolejnosci(self):
        SekcjaGalerii.objects.create(nazwa="pokoje", kolejnosc=3)
        SekcjaGalerii.objects.create(nazwa="restauracja", kolejnosc=1)
        SekcjaGalerii.objects.create(nazwa="okolice", kolejnosc=2)
        pierwsza = SekcjaGalerii.objects.first()
        self.assertEqual(pierwsza.nazwa, "restauracja")

    def test_choices_wszystkie_wartosci(self):
        for nazwa in ["pokoje", "podworze", "pensjonat", "okolice", "restauracja"]:
            SekcjaGalerii.objects.get_or_create(nazwa=nazwa)
        self.assertEqual(SekcjaGalerii.objects.count(), 5)

    def test_usun_z_zdjeciem_blokowane(self):
        s = SekcjaGalerii.objects.create(nazwa="pokoje")
        Zdjecie.objects.create(sekcja=s, zdjecie="galeria/test.jpg")
        with self.assertRaises(ProtectedError):
            s.delete()


class ZdjecieModelTest(TestCase):

    def setUp(self):
        self.sekcja = SekcjaGalerii.objects.create(nazwa="pokoje")

    def test_str_z_tytulem(self):
        z = Zdjecie.objects.create(
            sekcja=self.sekcja, zdjecie="galeria/test.jpg", tytul="Pokój 1"
        )
        self.assertIn("Pokój 1", str(z))

    def test_str_bez_tytulu(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertIn(str(z.pk), str(z))

    def test_domyslnie_aktywne(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertTrue(z.aktywne)

    def test_domyslnie_nie_wyroznienie(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertFalse(z.wyroznienie)

    def test_tytul_opcjonalny(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertEqual(z.tytul, "")

    def test_opis_opcjonalny(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertEqual(z.opis, "")

    def test_data_dodania_auto(self):
        z = Zdjecie.objects.create(sekcja=self.sekcja, zdjecie="galeria/test.jpg")
        self.assertIsNotNone(z.data_dodania)

    def test_ordering_wyroznienie_pierwsze(self):
        Zdjecie.objects.create(
            sekcja=self.sekcja, zdjecie="galeria/a.jpg",
            kolejnosc=1, wyroznienie=False
        )
        Zdjecie.objects.create(
            sekcja=self.sekcja, zdjecie="galeria/b.jpg",
            kolejnosc=2, wyroznienie=True
        )
        pierwsze = Zdjecie.objects.first()
        self.assertTrue(pierwsze.wyroznienie)


# ─────────────────────────────────────────
# API — SEKCJA GALERII
# ─────────────────────────────────────────

class SekcjaGaleriiAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.aktywna = SekcjaGalerii.objects.create(nazwa="pokoje", kolejnosc=1, aktywna=True)
        self.nieaktywna = SekcjaGalerii.objects.create(nazwa="podworze", kolejnosc=2, aktywna=False)

    def test_lista_200(self):
        r = self.client.get('/api/galeria/sekcje/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/galeria/sekcje/')
        nazwy = [s['nazwa'] for s in r.data]
        self.assertIn("pokoje", nazwy)
        self.assertNotIn("podworze", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/galeria/sekcje/')
        sekcja = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'kolejnosc', 'aktywna', 'zdjecia']:
            self.assertIn(pole, sekcja)

    def test_lista_zdjecia_puste_gdy_brak(self):
        r = self.client.get('/api/galeria/sekcje/')
        sekcja = r.data[0]
        self.assertEqual(sekcja['zdjecia'], [])

    def test_lista_zdjecia_zagniezdzone(self):
        Zdjecie.objects.create(
            sekcja=self.aktywna, zdjecie="galeria/test.jpg",
            tytul="Zdjęcie 1", aktywne=True
        )
        r = self.client.get('/api/galeria/sekcje/')
        sekcja = next(s for s in r.data if s['nazwa'] == "pokoje")
        self.assertEqual(len(sekcja['zdjecia']), 1)
        self.assertEqual(sekcja['zdjecia'][0]['tytul'], "Zdjęcie 1")

    def test_lista_ordering_po_kolejnosci(self):
        SekcjaGalerii.objects.create(nazwa="pensjonat", kolejnosc=0, aktywna=True)
        r = self.client.get('/api/galeria/sekcje/')
        kolejnosci = [s['kolejnosc'] for s in r.data]
        self.assertEqual(kolejnosci, sorted(kolejnosci))

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/galeria/manage/sekcje/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/galeria/manage/sekcje/')
        self.assertEqual(len(r.data), 2)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/galeria/manage/sekcje/{self.aktywna.pk}/',
            {'opis': 'Nowy opis sekcji'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywna.refresh_from_db()
        self.assertEqual(self.aktywna.opis, 'Nowy opis sekcji')

    def test_manage_update_aktywnosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/galeria/manage/sekcje/{self.nieaktywna.pk}/',
            {'aktywna': True}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.nieaktywna.refresh_from_db()
        self.assertTrue(self.nieaktywna.aktywna)

    def test_manage_delete_z_zdjeciem_blokowane(self):
        Zdjecie.objects.create(sekcja=self.aktywna, zdjecie="galeria/test.jpg")
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/galeria/manage/sekcje/{self.aktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(SekcjaGalerii.objects.filter(pk=self.aktywna.pk).exists())

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/galeria/manage/sekcje/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — ZDJĘCIE
# ─────────────────────────────────────────

class ZdjecieAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.sekcja = SekcjaGalerii.objects.create(nazwa="pokoje", aktywna=True)
        self.aktywne = Zdjecie.objects.create(
            sekcja=self.sekcja, zdjecie="galeria/a.jpg",
            tytul="Pokój 1", aktywne=True
        )
        self.nieaktywne = Zdjecie.objects.create(
            sekcja=self.sekcja, zdjecie="galeria/b.jpg",
            tytul="Ukryte", aktywne=False
        )

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/galeria/zdjecia/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        tytuly = [z['tytul'] for z in r.data]
        self.assertIn("Pokój 1", tytuly)
        self.assertNotIn("Ukryte", tytuly)

    def test_lista_pusta_gdy_brak_aktywnych(self):
        Zdjecie.objects.update(aktywne=False)
        r = self.client.get('/api/galeria/zdjecia/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/galeria/zdjecia/')
        zdjecie = r.data[0]
        for pole in ['id', 'sekcja', 'zdjecie', 'tytul', 'opis',
                     'kolejnosc', 'aktywne', 'wyroznienie', 'data_dodania']:
            self.assertIn(pole, zdjecie)

    def test_filtrowanie_po_sekcji(self):
        sekcja2 = SekcjaGalerii.objects.create(nazwa="restauracja", aktywna=True)
        Zdjecie.objects.create(
            sekcja=sekcja2, zdjecie="galeria/c.jpg",
            tytul="Restauracja 1", aktywne=True
        )
        r = self.client.get('/api/galeria/zdjecia/?sekcja=pokoje')
        tytuly = [z['tytul'] for z in r.data]
        self.assertIn("Pokój 1", tytuly)
        self.assertNotIn("Restauracja 1", tytuly)

    def test_filtrowanie_po_sekcji_nieistniejaca_pusta_lista(self):
        r = self.client.get('/api/galeria/zdjecia/?sekcja=nieistniejaca')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/galeria/manage/zdjecia/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/galeria/manage/zdjecia/')
        self.assertEqual(len(r.data), 2)

    def test_manage_update_wyroznienie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/galeria/manage/zdjecia/{self.aktywne.pk}/',
            {'wyroznienie': True}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywne.refresh_from_db()
        self.assertTrue(self.aktywne.wyroznienie)

    def test_manage_update_aktywnosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/galeria/manage/zdjecia/{self.aktywne.pk}/',
            {'aktywne': False}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywne.refresh_from_db()
        self.assertFalse(self.aktywne.aktywne)

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/galeria/manage/zdjecia/{self.nieaktywne.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Zdjecie.objects.filter(pk=self.nieaktywne.pk).exists())

    def test_manage_delete_nieistniejace_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/galeria/manage/zdjecia/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
