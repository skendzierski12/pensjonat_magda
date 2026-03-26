from django.db import models
from utils.images import resize_image  


class TypPokoju(models.Model):

    nazwa = models.CharField(max_length=100)
    opis = models.TextField()
    liczba_osob = models.PositiveIntegerField()
    powierzchnia = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Powierzchnia w m²"
    )
    aktywny = models.BooleanField(default=True)


    class Meta:
        ordering = ['liczba_osob']
        verbose_name = "Typ pokoju"
        verbose_name_plural = "Typy pokojów"

    def __str__(self):
        return self.nazwa


class UdogodnieniePokoju(models.Model):
    nazwa = models.CharField(max_length=100)
    ikona = models.CharField(
        max_length=50,
        blank=True,
        help_text="Nazwa ikony np. z Font Awesome: fa-wifi"
    )

    class Meta:
        verbose_name = "Udogodnienie"
        verbose_name_plural = "Udogodnienia"

    def __str__(self):
        return self.nazwa


class Pokoj(models.Model):
    numer = models.CharField(max_length=10, unique=True)
    typ = models.ForeignKey(
        TypPokoju,
        on_delete=models.PROTECT,
        related_name='pokoje'
    )
    opis_dodatkowy = models.TextField(
        blank=True,
        help_text="Opcjonalny opis szczegółowy dla tego konkretnego pokoju"
    )
    udogodnienia = models.ManyToManyField(
        UdogodnieniePokoju,
        blank=True,
        related_name='pokoje'
    )
    dostepny = models.BooleanField(default=True)

    class Meta:
        ordering = ['numer']
        verbose_name = "Pokój"
        verbose_name_plural = "Pokoje"

    def __str__(self):
        return f"Pokój {self.numer} ({self.typ.nazwa})"


class ZdjeciePokoj(models.Model):
    typ_pokoju = models.ForeignKey(
        TypPokoju,
        on_delete=models.CASCADE,
        related_name='zdjecia'
    )
    zdjecie = models.ImageField(upload_to='pokoje/')
    opis = models.CharField(max_length=200, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    okladka = models.BooleanField(
        default=False,
        help_text="Zdjęcie główne wyświetlane na liście pokojów"
    )

    class Meta:
        ordering = ['-okladka', 'kolejnosc']
        verbose_name = "Zdjęcie pokoju"
        verbose_name_plural = "Zdjęcia pokojów"

    def __str__(self):
        return f"Zdjęcie - {self.typ_pokoju.nazwa} #{self.kolejnosc}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)


class SezonCenowy(models.Model):

    class RodzajSezonu(models.TextChoices):
        LATO = 'lato', 'Lato'
        ZIMA = 'zima', 'Zima'
        SWIETA = 'swieta', 'Święta'
        STANDARD = 'standard', 'Standard'

    nazwa = models.CharField(max_length=100)
    rodzaj = models.CharField(
        max_length=20,
        choices=RodzajSezonu.choices,
        default=RodzajSezonu.STANDARD
    )
    data_od = models.DateField()
    data_do = models.DateField()
    aktywny = models.BooleanField(default=True)

    class Meta:
        ordering = ['data_od']
        verbose_name = "Sezon cenowy"
        verbose_name_plural = "Sezony cenowe"

    def __str__(self):
        return f"{self.nazwa} ({self.data_od} – {self.data_do})"


class CenaPokoj(models.Model):
    typ_pokoju = models.ForeignKey(
        TypPokoju,
        on_delete=models.CASCADE,
        related_name='ceny'
    )
    sezon = models.ForeignKey(
        SezonCenowy,
        on_delete=models.CASCADE,
        related_name='ceny'
    )
    cena_za_noc = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ('typ_pokoju', 'sezon')
        verbose_name = "Cena pokoju"
        verbose_name_plural = "Ceny pokojów"

    def __str__(self):
        return f"{self.typ_pokoju.nazwa} – {self.sezon.nazwa}: {self.cena_za_noc} zł/noc"


class Impreza(models.Model):
    nazwa = models.CharField(max_length=200)
    opis = models.TextField()
    cena_od = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Cena orientacyjna od"
    )
    zdjecie = models.ImageField(upload_to='imprezy/', blank=True, null=True)
    aktywna = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Impreza okolicznościowa"
        verbose_name_plural = "Imprezy okolicznościowe"

    def __str__(self):
        return self.nazwa

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)

