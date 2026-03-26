from django.db import models


class KategoriaAtrakcji(models.Model):
    """Kategorie atrakcji np. Szlaki, Zabytki, Sport, Rekreacja"""
    nazwa = models.CharField(max_length=100)
    ikona = models.CharField(
        max_length=50,
        blank=True,
        help_text="Nazwa ikony np. z Font Awesome: fa-hiking"
    )
    kolejnosc = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Kategoria atrakcji"
        verbose_name_plural = "Kategorie atrakcji"

    def __str__(self):
        return self.nazwa


class Atrakcja(models.Model):
    """Atrakcja turystyczna w okolicy pensjonatu"""

    class TrudnoscTrasy(models.TextChoices):
        LATWA = 'latwa', 'Łatwa'
        SREDNIA = 'srednia', 'Średnia'
        TRUDNA = 'trudna', 'Trudna'

    kategoria = models.ForeignKey(
        KategoriaAtrakcji,
        on_delete=models.PROTECT,
        related_name='atrakcje'
    )
    nazwa = models.CharField(max_length=200)
    opis = models.TextField()
    odleglosc_km = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        help_text="Odległość od pensjonatu w km"
    )
    czas_dojazdu_min = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Szacowany czas dojazdu samochodem w minutach"
    )
    trudnosc = models.CharField(
        max_length=10,
        choices=TrudnoscTrasy.choices,
        blank=True,
        help_text="Dotyczy szlaków i tras"
    )
    dlugosc_trasy_km = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        blank=True,
        null=True,
        help_text="Długość trasy w km (dla szlaków)"
    )
    link_zewnetrzny = models.URLField(
        blank=True,
        help_text="Link do strony atrakcji, mapy, rezerwacji itp."
    )
    aktywna = models.BooleanField(default=True)
    kolejnosc = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['kategoria', 'kolejnosc', 'odleglosc_km']
        verbose_name = "Atrakcja"
        verbose_name_plural = "Atrakcje"

    def __str__(self):
        return f"{self.nazwa} ({self.odleglosc_km} km)"


class ZdjecieAtrakcji(models.Model):
    """Zdjęcia atrakcji"""
    atrakcja = models.ForeignKey(
        Atrakcja,
        on_delete=models.CASCADE,
        related_name='zdjecia'
    )
    zdjecie = models.ImageField(upload_to='atrakcje/')
    opis = models.CharField(max_length=200, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    okladka = models.BooleanField(
        default=False,
        help_text="Zdjęcie główne wyświetlane na liście atrakcji"
    )

    class Meta:
        ordering = ['-okladka', 'kolejnosc']
        verbose_name = "Zdjęcie atrakcji"
        verbose_name_plural = "Zdjęcia atrakcji"

    def __str__(self):
        return f"Zdjęcie – {self.atrakcja.nazwa} #{self.kolejnosc}"
 
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)

