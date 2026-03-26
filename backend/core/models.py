from django.db import models


class UstawieniaStrony(models.Model):
    nazwa_pensjonatu = models.CharField(max_length=200)
    opis_hero = models.TextField(help_text="Tekst na stronie głównej")
    telefon = models.CharField(max_length=20)
    email = models.EmailField()
    adres = models.TextField()
    google_maps_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)

    class Meta:
        verbose_name = "Ustawienia strony"
        verbose_name_plural = "Ustawienia strony"

    def __str__(self):
        return self.nazwa_pensjonatu


class ZdjecieHero(models.Model):
    zdjecie = models.ImageField(upload_to='hero/')
    tytul = models.CharField(max_length=200, blank=True)
    podtytul = models.CharField(max_length=300, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywne = models.BooleanField(default=True)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Zdjęcie hero"
        verbose_name_plural = "Zdjęcia hero"

    def __str__(self):
        return self.tytul or f"Zdjęcie hero #{self.pk}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)

class ONas(models.Model):
    tytul = models.CharField(max_length=200)
    tresc = models.TextField()
    zdjecie = models.ImageField(upload_to='o_nas/', blank=True, null=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywne = models.BooleanField(default=True)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Sekcja O nas"
        verbose_name_plural = "Sekcje O nas"

    def __str__(self):
        return self.tytul

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)


class Ogloszenie(models.Model):
    tytul = models.CharField(max_length=200)
    tresc = models.TextField()
    data_dodania = models.DateTimeField(auto_now_add=True)
    data_wygasniecia = models.DateField(
        blank=True,
        null=True,
        help_text="Zostaw puste jeśli ogłoszenie ma być stałe"
    )
    aktywne = models.BooleanField(default=True)
    wazne = models.BooleanField(
        default=False,
        help_text="Wyróżnione ogłoszenie na górze listy"
    )

    class Meta:
        ordering = ['-wazne', '-data_dodania']
        verbose_name = "Ogłoszenie"
        verbose_name_plural = "Ogłoszenia"

    def __str__(self):
        return self.tytul


class Kontakt(models.Model):
    imie = models.CharField(max_length=100)
    email = models.EmailField()
    temat = models.CharField(max_length=200)
    wiadomosc = models.TextField()
    data_wyslania = models.DateTimeField(auto_now_add=True)
    przeczytana = models.BooleanField(default=False)

    class Meta:
        ordering = ['-data_wyslania']
        verbose_name = "Wiadomość kontaktowa"
        verbose_name_plural = "Wiadomości kontaktowe"

    def __str__(self):
        return f"{self.imie} - {self.temat} ({self.data_wyslania.strftime('%d.%m.%Y')})"
