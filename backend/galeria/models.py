from django.db import models
from utils.images import resize_image

class SekcjaGalerii(models.Model):
    """Sekcje tematyczne galerii"""

    class NazwaSekcji(models.TextChoices):
        POKOJE = 'pokoje', 'Pokoje'
        PODWORZE = 'podworze', 'Podwórze'
        PENSJONAT = 'pensjonat', 'Pensjonat'
        OKOLICE = 'okolice', 'Okolice'
        RESTAURACJA = 'restauracja', 'Restauracja'

    nazwa = models.CharField(
        max_length=20,
        choices=NazwaSekcji.choices,
        unique=True
    )
    opis = models.CharField(max_length=300, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywna = models.BooleanField(default=True)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Sekcja galerii"
        verbose_name_plural = "Sekcje galerii"

    def __str__(self):
        return self.get_nazwa_display()


class Zdjecie(models.Model):
    """Zdjęcie w galerii"""
    sekcja = models.ForeignKey(
        SekcjaGalerii,
        on_delete=models.PROTECT,
        related_name='zdjecia'
    )
    zdjecie = models.ImageField(upload_to='galeria/%Y/%m/')
    tytul = models.CharField(max_length=200, blank=True)
    opis = models.CharField(max_length=500, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywne = models.BooleanField(default=True)
    data_dodania = models.DateTimeField(auto_now_add=True)
    wyroznienie = models.BooleanField(
        default=False,
        help_text="Wyróżnione zdjęcie pokazywane na stronie głównej sekcji"
    )

    class Meta:
        ordering = ['-wyroznienie', 'kolejnosc', '-data_dodania']
        verbose_name = "Zdjęcie"
        verbose_name_plural = "Zdjęcia"

    def __str__(self):
        return self.tytul or f"Zdjecie #{self.pk} - {self.sekcja}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)

