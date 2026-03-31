from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import UstawieniaStrony, Ogloszenie, ONas, Kontakt, ZdjecieHero


class OgloszenieModelTest(TestCase):

    def test_str_zwraca_tytul(self):
        o = Ogloszenie.objects.create(tytul="Wakacje 2025", tresc="Treść")
        self.assertEqual(str(o), "Wakacje 2025")

    def test_domyslne_wartosci(self):
        o = Ogloszenie.objects.create(tytul="Test", tresc="Treść")
        self.assertTrue(o.aktywne)
        self.assertFalse(o.wazne)
        self.assertIsNone(o.data_wygasniecia)

    def test_ordering_wazne_pierwsze(self):
        Ogloszenie.objects.create(tytul="Zwykłe", tresc="x", wazne=False)
        Ogloszenie.objects.create(tytul="Ważne", tresc="x", wazne=True)
        pierwsze = Ogloszenie.objects.first()
        self.assertEqual(pierwsze.tytul, "Ważne")


class KontaktModelTest(TestCase):

    def test_str_zawiera_imie_i_temat(self):
        k = Kontakt.objects.create(
            imie="Anna", email="anna@test.pl",
            temat="Rezerwacja", wiadomosc="Chciałabym zarezerwować pokój."
        )
        self.assertIn("Anna", str(k))
        self.assertIn("Rezerwacja", str(k))

    def test_data_wyslania_auto(self):
        k = Kontakt.objects.create(
            imie="Jan", email="jan@test.pl",
            temat="Test", wiadomosc="Wiadomość"
        )
        self.assertIsNotNone(k.data_wyslania)

    def test_domyslnie_nieprzeczytana(self):
        k = Kontakt.objects.create(
            imie="Jan", email="jan@test.pl",
            temat="Test", wiadomosc="Wiadomość"
        )
        self.assertFalse(k.przeczytana)


class OgloszenieAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.token = Token.objects.create(user=self.user)

        self.aktywne = Ogloszenie.objects.create(
            tytul="Aktywne", tresc="Treść", aktywne=True
        )
        self.nieaktywne = Ogloszenie.objects.create(
            tytul="Nieaktywne", tresc="Treść", aktywne=False
        )
        self.wygasle = Ogloszenie.objects.create(
            tytul="Wygasłe", tresc="Treść", aktywne=True,
            data_wygasniecia=date.today() - timedelta(days=1)
        )
        self.przyszle = Ogloszenie.objects.create(
            tytul="Przyszłe", tresc="Treść", aktywne=True,
            data_wygasniecia=date.today() + timedelta(days=7)
        )

    def test_lista_zwraca_200(self):
        r = self.client.get('/api/core/ogloszenia/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_lista_zawiera_wymagane_pola(self):
        r = self.client.get('/api/core/ogloszenia/')
        self.assertGreater(len(r.data), 0)
        pierwsze = r.data[0]
        for pole in ['id', 'tytul', 'tresc', 'data_dodania', 'aktywne', 'wazne']:
            self.assertIn(pole, pierwsze)

    def test_publiczna_lista_tylko_aktywne(self):
        r = self.client.get('/api/core/ogloszenia/')
        tytuly = [o['tytul'] for o in r.data]
        self.assertIn("Aktywne", tytuly)
        self.assertNotIn("Nieaktywne", tytuly)

    def test_publiczna_lista_bez_wygaslych(self):
        r = self.client.get('/api/core/ogloszenia/')
        tytuly = [o['tytul'] for o in r.data]
        self.assertNotIn("Wygasłe", tytuly)

    def test_publiczna_lista_z_przyszla_data_wygasniecia(self):
        r = self.client.get('/api/core/ogloszenia/')
        tytuly = [o['tytul'] for o in r.data]
        self.assertIn("Przyszłe", tytuly)

    def test_manage_wymaga_autentykacji(self):
        r = self.client.get('/api/core/manage/ogloszenia/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manage_z_tokenem_zwraca_wszystkie(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/core/manage/ogloszenia/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 4)

    def test_manage_create(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post('/api/core/manage/ogloszenia/', {
            'tytul': 'Nowe', 'tresc': 'Treść', 'aktywne': True, 'wazne': False
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ogloszenie.objects.count(), 5)

    def test_manage_update(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(
            f'/api/core/manage/ogloszenia/{self.aktywne.pk}/',
            {'tytul': 'Zmienione'}
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.aktywne.refresh_from_db()
        self.assertEqual(self.aktywne.tytul, 'Zmienione')

    def test_manage_delete(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/core/manage/ogloszenia/{self.aktywne.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ogloszenie.objects.filter(pk=self.aktywne.pk).exists())


class KontaktAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(username='admin', password='admin123')
        self.token = Token.objects.create(user=self.user)
        self.payload = {
            'imie': 'Jan Kowalski',
            'email': 'jan@test.pl',
            'temat': 'Rezerwacja',
            'wiadomosc': 'Chciałbym zarezerwować pokój na weekend.'
        }

    def test_post_poprawny_201(self):
        r = self.client.post('/api/core/kontakt/', self.payload)
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_post_tworzy_obiekt_w_bazie(self):
        self.client.post('/api/core/kontakt/', self.payload)
        self.assertEqual(Kontakt.objects.count(), 1)
        k = Kontakt.objects.first()
        self.assertEqual(k.imie, 'Jan Kowalski')
        self.assertFalse(k.przeczytana)

    def test_post_bez_emaila_400(self):
        payload = self.payload.copy()
        del payload['email']
        r = self.client.post('/api/core/kontakt/', payload)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_niepoprawny_email_400(self):
        payload = self.payload.copy()
        payload['email'] = 'to-nie-jest-email'
        r = self.client.post('/api/core/kontakt/', payload)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_bez_wiadomosci_400(self):
        payload = self.payload.copy()
        del payload['wiadomosc']
        r = self.client.post('/api/core/kontakt/', payload)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_lista_wymaga_autentykacji(self):
        r = self.client.get('/api/core/kontakt/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_lista_z_tokenem(self):
        Kontakt.objects.create(**self.payload)
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/core/kontakt/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)

    def test_oznacz_jako_przeczytana(self):
        k = Kontakt.objects.create(**self.payload)
        self.client.force_authenticate(user=self.user)
        r = self.client.patch(f'/api/core/manage/kontakt/{k.pk}/', {'przeczytana': True})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        k.refresh_from_db()
        self.assertTrue(k.przeczytana)


class AuthAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin', password='admin123', email='admin@test.pl'
        )

    def test_login_poprawny(self):
        r = self.client.post('/api/core/auth/login/', {
            'username': 'admin', 'password': 'admin123'
        })
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('token', r.data)
        self.assertIn('user', r.data)
        self.assertEqual(r.data['user']['username'], 'admin')

    def test_login_zle_haslo_401(self):
        r = self.client.post('/api/core/auth/login/', {
            'username': 'admin', 'password': 'zlehaslo'
        })
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nieistniejacy_user_401(self):
        r = self.client.post('/api/core/auth/login/', {
            'username': 'ghost', 'password': 'haslo'
        })
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_brak_danych_400(self):
        r = self.client.post('/api/core/auth/login/', {})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_z_tokenem(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        r = self.client.get('/api/core/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['username'], 'admin')
        self.assertIn('groups', r.data)

    def test_me_bez_tokenu_401(self):
        r = self.client.get('/api/core/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        r = self.client.post('/api/core/auth/logout/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_po_logout_token_nieaktywny(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        self.client.post('/api/core/auth/logout/')
        r = self.client.get('/api/core/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
