from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
from django.db import IntegrityError
from .models import (
    TypPokoju, Pokoj, UdogodnieniePokoju, ZdjeciePokoj,
    SezonCenowy, CenaPokoj, Impreza
)


# ─────────────────────────────────────────
# MODELE
# ─────────────────────────────────────────

class TypPokojuModelTest(TestCase):

    def test_str(self):
        t = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.assertEqual(str(t), "Dwójka")

    def test_domyslnie_aktywny(self):
        t = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.assertTrue(t.aktywny)

    def test_powierzchnia_opcjonalna(self):
        t = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.assertIsNone(t.powierzchnia)

    def test_ordering_po_liczbie_osob(self):
        TypPokoju.objects.create(nazwa="Czwórka", opis="x", liczba_osob=4)
        TypPokoju.objects.create(nazwa="Jedynka", opis="x", liczba_osob=1)
        TypPokoju.objects.create(nazwa="Dwójka", opis="x", liczba_osob=2)
        typy = list(TypPokoju.objects.values_list('liczba_osob', flat=True))
        self.assertEqual(typy, sorted(typy))


class PokojModelTest(TestCase):

    def setUp(self):
        self.typ = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)

    def test_str_zawiera_numer_i_typ(self):
        p = Pokoj.objects.create(numer="101", typ=self.typ)
        self.assertIn("101", str(p))
        self.assertIn("Dwójka", str(p))

    def test_domyslnie_dostepny(self):
        p = Pokoj.objects.create(numer="101", typ=self.typ)
        self.assertTrue(p.dostepny)

    def test_numer_unikalny(self):
        Pokoj.objects.create(numer="101", typ=self.typ)
        with self.assertRaises(IntegrityError):
            Pokoj.objects.create(numer="101", typ=self.typ)

    def test_opis_dodatkowy_opcjonalny(self):
        p = Pokoj.objects.create(numer="101", typ=self.typ)
        self.assertEqual(p.opis_dodatkowy, "")

    def test_udogodnienia_many_to_many(self):
        wifi = UdogodnieniePokoju.objects.create(nazwa="WiFi")
        tv = UdogodnieniePokoju.objects.create(nazwa="TV")
        p = Pokoj.objects.create(numer="101", typ=self.typ)
        p.udogodnienia.add(wifi, tv)
        self.assertEqual(p.udogodnienia.count(), 2)

    def test_usun_typ_blokowane(self):
        from django.db.models import ProtectedError
        Pokoj.objects.create(numer="101", typ=self.typ)
        with self.assertRaises(ProtectedError):
            self.typ.delete()


class UdogodnieniePokojuModelTest(TestCase):

    def test_str(self):
        u = UdogodnieniePokoju.objects.create(nazwa="WiFi")
        self.assertEqual(str(u), "WiFi")

    def test_ikona_opcjonalna(self):
        u = UdogodnieniePokoju.objects.create(nazwa="WiFi")
        self.assertEqual(u.ikona, "")


class SezonCenowyModelTest(TestCase):

    def _sezon(self, nazwa="Lato", rodzaj="lato", od=None, do=None, aktywny=True):
        return SezonCenowy.objects.create(
            nazwa=nazwa, rodzaj=rodzaj,
            data_od=od or date(2025, 6, 1),
            data_do=do or date(2025, 8, 31),
            aktywny=aktywny
        )

    def test_str_zawiera_nazwe_i_daty(self):
        s = self._sezon()
        self.assertIn("Lato", str(s))

    def test_domyslny_rodzaj_standard(self):
        s = SezonCenowy.objects.create(
            nazwa="Test", data_od=date(2025, 1, 1), data_do=date(2025, 12, 31)
        )
        self.assertEqual(s.rodzaj, "standard")

    def test_ordering_po_dacie_od(self):
        self._sezon("Zima", "zima", date(2025, 12, 1), date(2026, 1, 31))
        self._sezon("Lato", "lato", date(2025, 6, 1), date(2025, 8, 31))
        pierwszy = SezonCenowy.objects.first()
        self.assertEqual(pierwszy.nazwa, "Lato")

    def test_aktywny_domyslnie(self):
        s = self._sezon()
        self.assertTrue(s.aktywny)


class CenaPokojuModelTest(TestCase):

    def setUp(self):
        self.typ = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.sezon = SezonCenowy.objects.create(
            nazwa="Lato", rodzaj="lato",
            data_od=date(2025, 6, 1), data_do=date(2025, 8, 31)
        )

    def test_str_zawiera_typ_sezon_cene(self):
        c = CenaPokoj.objects.create(
            typ_pokoju=self.typ, sezon=self.sezon, cena_za_noc=Decimal("250.00")
        )
        self.assertIn("Dwójka", str(c))
        self.assertIn("Lato", str(c))
        self.assertIn("250", str(c))

    def test_unique_together_typ_sezon(self):
        CenaPokoj.objects.create(
            typ_pokoju=self.typ, sezon=self.sezon, cena_za_noc=Decimal("250.00")
        )
        with self.assertRaises(IntegrityError):
            CenaPokoj.objects.create(
                typ_pokoju=self.typ, sezon=self.sezon, cena_za_noc=Decimal("300.00")
            )

    def test_usun_typ_kaskadowo_usuwa_cene(self):
        CenaPokoj.objects.create(
            typ_pokoju=self.typ, sezon=self.sezon, cena_za_noc=Decimal("250.00")
        )
        typ_pk = self.typ.pk
        Pokoj.objects.filter(typ=self.typ).delete()
        self.typ.delete()
        self.assertFalse(CenaPokoj.objects.filter(typ_pokoju__pk=typ_pk).exists())


class ImprezaModelTest(TestCase):

    def test_str(self):
        i = Impreza.objects.create(nazwa="Wesele", opis="Opis")
        self.assertEqual(str(i), "Wesele")

    def test_domyslnie_aktywna(self):
        i = Impreza.objects.create(nazwa="Wesele", opis="Opis")
        self.assertTrue(i.aktywna)

    def test_cena_od_opcjonalna(self):
        i = Impreza.objects.create(nazwa="Wesele", opis="Opis")
        self.assertIsNone(i.cena_od)

    def test_zdjecie_opcjonalne(self):
        i = Impreza.objects.create(nazwa="Wesele", opis="Opis")
        self.assertFalse(bool(i.zdjecie))


# ─────────────────────────────────────────
# API — TYP POKOJU
# ─────────────────────────────────────────

class TypPokojuAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.typ = TypPokoju.objects.create(
            nazwa="Dwójka", opis="Przytulny pokój", liczba_osob=2,
            powierzchnia=Decimal("22.00"), aktywny=True
        )
        self.typ_nieaktywny = TypPokoju.objects.create(
            nazwa="Ukryty", opis="Opis", liczba_osob=1, aktywny=False
        )

    def test_lista_200(self):
        r = self.client.get('/api/oferta/typy-pokoi/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/oferta/typy-pokoi/')
        self.assertGreater(len(r.data), 0)
        typ = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'liczba_osob', 'powierzchnia', 'zdjecia', 'ceny']:
            self.assertIn(pole, typ)

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/oferta/typy-pokoi/')
        nazwy = [t['nazwa'] for t in r.data]
        self.assertIn("Dwójka", nazwy)
        self.assertNotIn("Ukryty", nazwy)

    def test_lista_pusta_gdy_brak_aktywnych(self):
        TypPokoju.objects.update(aktywny=False)
        r = self.client.get('/api/oferta/typy-pokoi/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_zagniezdzone_ceny(self):
        sezon = SezonCenowy.objects.create(
            nazwa="Lato", rodzaj="lato",
            data_od=date(2025, 6, 1), data_do=date(2025, 8, 31)
        )
        CenaPokoj.objects.create(
            typ_pokoju=self.typ, sezon=sezon, cena_za_noc=Decimal("250.00")
        )
        r = self.client.get('/api/oferta/typy-pokoi/')
        typ = next(t for t in r.data if t['nazwa'] == "Dwójka")
        self.assertEqual(len(typ['ceny']), 1)
        self.assertEqual(Decimal(typ['ceny'][0]['cena_za_noc']), Decimal("250.00"))
        self.assertIn('sezon_nazwa', typ['ceny'][0])
        self.assertIn('sezon_rodzaj', typ['ceny'][0])

    def test_zagniezdzone_zdjecia_puste_gdy_brak(self):
        r = self.client.get('/api/oferta/typy-pokoi/')
        typ = next(t for t in r.data if t['nazwa'] == "Dwójka")
        self.assertEqual(typ['zdjecia'], [])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/oferta/manage/typy-pokoi/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/oferta/manage/typy-pokoi/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/typy-pokoi/', {
            'nazwa': 'Trójka', 'opis': 'Opis pokoju', 'liczba_osob': 3, 'aktywny': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(TypPokoju.objects.filter(nazwa='Trójka').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/typy-pokoi/', {
            'opis': 'Brak nazwy', 'liczba_osob': 3
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_liczby_osob_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/typy-pokoi/', {
            'nazwa': 'Trójka', 'opis': 'Opis'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/oferta/manage/typy-pokoi/{self.typ.pk}/',
            {'nazwa': 'Zmieniona Dwójka'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.typ.refresh_from_db()
        self.assertEqual(self.typ.nazwa, 'Zmieniona Dwójka')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/oferta/manage/typy-pokoi/{self.typ_nieaktywny.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TypPokoju.objects.filter(pk=self.typ_nieaktywny.pk).exists())

    def test_manage_delete_nieistniejacy_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/oferta/manage/typy-pokoi/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_manage_delete_z_pokojem_blokowane(self):
        self.client.force_authenticate(user=self.user)
        Pokoj.objects.create(numer="101", typ=self.typ)
        r = self.client.delete(f'/api/oferta/manage/typy-pokoi/{self.typ.pk}/')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(TypPokoju.objects.filter(pk=self.typ.pk).exists())


# ─────────────────────────────────────────
# API — POKÓJ
# ─────────────────────────────────────────

class PokojAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.typ = TypPokoju.objects.create(nazwa="Dwójka", opis="Opis", liczba_osob=2)
        self.dostepny = Pokoj.objects.create(numer="101", typ=self.typ, dostepny=True)
        self.niedostepny = Pokoj.objects.create(numer="102", typ=self.typ, dostepny=False)
        self.wifi = UdogodnieniePokoju.objects.create(nazwa="WiFi", ikona="fa-wifi")
        self.tv = UdogodnieniePokoju.objects.create(nazwa="TV", ikona="fa-tv")

    def test_lista_tylko_dostepne(self):
        r = self.client.get('/api/oferta/pokoje/')
        numery = [p['numer'] for p in r.data]
        self.assertIn("101", numery)
        self.assertNotIn("102", numery)

    def test_lista_pusta_gdy_brak_dostepnych(self):
        Pokoj.objects.update(dostepny=False)
        r = self.client.get('/api/oferta/pokoje/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 0)

    def test_lista_zawiera_zagniezdzone_typ(self):
        r = self.client.get('/api/oferta/pokoje/')
        pokoj = next(p for p in r.data if p['numer'] == "101")
        self.assertIn('typ', pokoj)
        self.assertEqual(pokoj['typ']['nazwa'], 'Dwójka')
        self.assertIn('zdjecia', pokoj['typ'])
        self.assertIn('ceny', pokoj['typ'])

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/oferta/pokoje/')
        pokoj = r.data[0]
        for pole in ['id', 'numer', 'typ', 'opis_dodatkowy', 'udogodnienia', 'dostepny']:
            self.assertIn(pole, pokoj)

    def test_udogodnienia_zwraca_pelne_obiekty(self):
        self.dostepny.udogodnienia.add(self.wifi, self.tv)
        r = self.client.get('/api/oferta/pokoje/')
        pokoj = next(p for p in r.data if p['numer'] == "101")
        nazwy = [u['nazwa'] for u in pokoj['udogodnienia']]
        self.assertIn("WiFi", nazwy)
        self.assertIn("TV", nazwy)

    def test_udogodnienia_puste_gdy_brak(self):
        r = self.client.get('/api/oferta/pokoje/')
        pokoj = next(p for p in r.data if p['numer'] == "101")
        self.assertEqual(pokoj['udogodnienia'], [])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/oferta/manage/pokoje/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/oferta/manage/pokoje/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/pokoje/', {
            'numer': '103', 'typ_id': self.typ.pk, 'dostepny': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Pokoj.objects.filter(numer='103').exists())

    def test_manage_create_duplikat_numeru_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/pokoje/', {
            'numer': '101', 'typ_id': self.typ.pk
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_numeru_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/pokoje/', {
            'typ_id': self.typ.pk
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update_dostepnosc(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/oferta/manage/pokoje/{self.dostepny.pk}/',
            {'dostepny': False}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.dostepny.refresh_from_db()
        self.assertFalse(self.dostepny.dostepny)

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/oferta/manage/pokoje/{self.niedostepny.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Pokoj.objects.filter(pk=self.niedostepny.pk).exists())

    def test_manage_delete_nieistniejacy_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/oferta/manage/pokoje/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────
# API — SEZON CENOWY
# ─────────────────────────────────────────

class SezonCenowyAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.aktywny = SezonCenowy.objects.create(
            nazwa="Lato 2025", rodzaj="lato",
            data_od=date(2025, 6, 1), data_do=date(2025, 8, 31), aktywny=True
        )
        self.nieaktywny = SezonCenowy.objects.create(
            nazwa="Zima 2024", rodzaj="zima",
            data_od=date(2024, 12, 1), data_do=date(2025, 1, 31), aktywny=False
        )

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/oferta/sezony/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nazwy = [s['nazwa'] for s in r.data]
        self.assertIn("Lato 2025", nazwy)
        self.assertNotIn("Zima 2024", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/oferta/sezony/')
        sezon = r.data[0]
        for pole in ['id', 'nazwa', 'rodzaj', 'data_od', 'data_do', 'aktywny']:
            self.assertIn(pole, sezon)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/sezony/', {
            'nazwa': 'Święta 2025', 'rodzaj': 'swieta',
            'data_od': '2025-12-20', 'data_do': '2026-01-05', 'aktywny': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_manage_create_bez_daty_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/sezony/', {
            'nazwa': 'Błędny sezon', 'rodzaj': 'lato'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/oferta/manage/sezony/{self.aktywny.pk}/',
            {'nazwa': 'Lato 2025 — zmieniony'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywny.refresh_from_db()
        self.assertEqual(self.aktywny.nazwa, 'Lato 2025 — zmieniony')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/oferta/manage/sezony/{self.nieaktywny.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/oferta/manage/sezony/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────
# API — IMPREZA
# ─────────────────────────────────────────

class ImprezaAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.aktywna = Impreza.objects.create(
            nazwa="Wesele", opis="Organizujemy wesela", aktywna=True,
            cena_od=Decimal("5000.00")
        )
        self.nieaktywna = Impreza.objects.create(
            nazwa="Ukryta", opis="Opis", aktywna=False
        )

    def test_lista_tylko_aktywne(self):
        r = self.client.get('/api/oferta/imprezy/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nazwy = [i['nazwa'] for i in r.data]
        self.assertIn("Wesele", nazwy)
        self.assertNotIn("Ukryta", nazwy)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/oferta/imprezy/')
        impreza = r.data[0]
        for pole in ['id', 'nazwa', 'opis', 'cena_od', 'aktywna']:
            self.assertIn(pole, impreza)

    def test_cena_od_moze_byc_null(self):
        Impreza.objects.create(nazwa="Bez ceny", opis="Opis", aktywna=True)
        r = self.client.get('/api/oferta/imprezy/')
        impreza = next(i for i in r.data if i['nazwa'] == "Bez ceny")
        self.assertIsNone(impreza['cena_od'])

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/oferta/manage/imprezy/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_lista_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/oferta/manage/imprezy/')
        self.assertEqual(len(r.data), 2)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/imprezy/', {
            'nazwa': 'Urodziny', 'opis': 'Organizujemy urodziny', 'aktywna': True
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Impreza.objects.filter(nazwa='Urodziny').exists())

    def test_manage_create_bez_nazwy_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/imprezy/', {
            'opis': 'Brak nazwy'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_create_bez_opisu_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/oferta/manage/imprezy/', {
            'nazwa': 'Test'
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/oferta/manage/imprezy/{self.aktywna.pk}/',
            {'cena_od': '6000.00'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywna.refresh_from_db()
        self.assertEqual(self.aktywna.cena_od, Decimal("6000.00"))

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/oferta/manage/imprezy/{self.nieaktywna.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Impreza.objects.filter(pk=self.nieaktywna.pk).exists())

    def test_manage_delete_nieistniejaca_404(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete('/api/oferta/manage/imprezy/99999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
