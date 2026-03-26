from django.db import models



class GodzinyOtwarcia(models.Model):
    """Godziny otwarcia restauracji dla każdego dnia tygodnia"""
 
    class DzienTygodnia(models.IntegerChoices):
        PONIEDZIALEK = 0, 'Poniedziałek'
        WTOREK       = 1, 'Wtorek'
        SRODA        = 2, 'Środa'
        CZWARTEK     = 3, 'Czwartek'
        PIATEK       = 4, 'Piątek'
        SOBOTA       = 5, 'Sobota'
        NIEDZIELA    = 6, 'Niedziela'
 
    dzien        = models.IntegerField(choices=DzienTygodnia.choices, unique=True)
    godzina_od   = models.TimeField(null=True, blank=True)
    godzina_do   = models.TimeField(null=True, blank=True)
    zamkniete    = models.BooleanField(default=False)
 
    class Meta:
        ordering = ['dzien']
        verbose_name = "Godziny otwarcia"
        verbose_name_plural = "Godziny otwarcia"
 
    def __str__(self):
        if self.zamkniete:
            return f"{self.get_dzien_display()}: Zamknięte"
        return f"{self.get_dzien_display()}: {self.godzina_od:%H:%M}–{self.godzina_do:%H:%M}"

# ─────────────────────────────────────────
# MENU
# ─────────────────────────────────────────

class KategoriaMenu(models.Model):
    """Kategorie dań np. Zupy, Dania główne, Desery"""
    nazwa = models.CharField(max_length=100)
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywna = models.BooleanField(default=True)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Kategoria menu"
        verbose_name_plural = "Kategorie menu"

    def __str__(self):
        return self.nazwa


class Danie(models.Model):
    """Pojedyncze danie w menu"""
    kategoria = models.ForeignKey(
        KategoriaMenu,
        on_delete=models.PROTECT,
        related_name='dania'
    )
    nazwa = models.CharField(max_length=200)
    opis = models.TextField(blank=True)
    cena = models.DecimalField(max_digits=6, decimal_places=2)
    zdjecie = models.ImageField(
        upload_to='menu/',
        blank=True,
        null=True
    )
    kolejnosc = models.PositiveIntegerField(default=0)
    widoczne = models.BooleanField(
        default=True,
        help_text="Odznacz żeby ukryć danie z menu bez usuwania"
    )
    wegetarianskie = models.BooleanField(default=False)
    wegańskie = models.BooleanField(default=False)
    bezglutenowe = models.BooleanField(default=False)

    class Meta:
        ordering = ['kategoria', 'kolejnosc']
        verbose_name = "Danie"
        verbose_name_plural = "Dania"

    def __str__(self):
        return f"{self.nazwa} ({self.kategoria.nazwa})"
 
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)



# ─────────────────────────────────────────
# SALE RESTAURACYJNE
# ─────────────────────────────────────────

class SalaRestauracyjna(models.Model):
    """Sale restauracyjne z opisem i zdjęciami"""
    nazwa = models.CharField(max_length=200)
    opis = models.TextField()
    liczba_miejsc = models.PositiveIntegerField()
    dostepna_na_imprezy = models.BooleanField(
        default=False,
        help_text="Czy sala jest dostępna na imprezy okolicznościowe?"
    )
    kolejnosc = models.PositiveIntegerField(default=0)
    aktywna = models.BooleanField(default=True)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Sala restauracyjna"
        verbose_name_plural = "Sale restauracyjne"

    def __str__(self):
        return f"{self.nazwa} ({self.liczba_miejsc} miejsc)"


class ZdjecieSali(models.Model):
    """Zdjęcia sali restauracyjnej"""
    sala = models.ForeignKey(
        SalaRestauracyjna,
        on_delete=models.CASCADE,
        related_name='zdjecia'
    )
    zdjecie = models.ImageField(upload_to='sale/')
    opis = models.CharField(max_length=200, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    okladka = models.BooleanField(
        default=False,
        help_text="Zdjęcie główne wyświetlane na liście sal"
    )

    class Meta:
        ordering = ['-okladka', 'kolejnosc']
        verbose_name = "Zdjęcie sali"
        verbose_name_plural = "Zdjęcia sal"

    def __str__(self):
        return f"Zdjęcie – {self.sala.nazwa} #{self.kolejnosc}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)



# ─────────────────────────────────────────
# WYROBY WŁASNE
# ─────────────────────────────────────────

class KategoriaWyrobu(models.Model):
    """Kategorie wyrobów np. Kiełbasy, Wędliny, Przetwory"""
    nazwa = models.CharField(max_length=100)
    kolejnosc = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['kolejnosc']
        verbose_name = "Kategoria wyrobu"
        verbose_name_plural = "Kategorie wyrobów"

    def __str__(self):
        return self.nazwa


class Wyrob(models.Model):
    """Wyrób własny dostępny do kupienia na miejscu"""

    class JednostkaCeny(models.TextChoices):
        KILOGRAM = 'kg', 'za kilogram'
        SZTUKA = 'szt', 'za sztukę'
        OPAKOWANIE = 'opak', 'za opakowanie'

    kategoria = models.ForeignKey(
        KategoriaWyrobu,
        on_delete=models.PROTECT,
        related_name='wyroby'
    )
    nazwa = models.CharField(max_length=200)
    opis = models.TextField()
    sklad = models.TextField(
        blank=True,
        help_text="Skład produktu"
    )
    cena = models.DecimalField(max_digits=6, decimal_places=2)
    jednostka = models.CharField(
        max_length=10,
        choices=JednostkaCeny.choices,
        default=JednostkaCeny.KILOGRAM
    )
    dostepny = models.BooleanField(
        default=True,
        help_text="Odznacz jeśli wyrób jest chwilowo niedostępny"
    )
    kolejnosc = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['kategoria', 'kolejnosc']
        verbose_name = "Wyrób własny"
        verbose_name_plural = "Wyroby własne"

    def __str__(self):
        return f"{self.nazwa} – {self.cena} zł/{self.jednostka}"


class ZdjecieWyrobu(models.Model):
    """Zdjęcia wyrobu własnego"""
    wyrob = models.ForeignKey(
        Wyrob,
        on_delete=models.CASCADE,
        related_name='zdjecia'
    )
    zdjecie = models.ImageField(upload_to='wyroby/')
    opis = models.CharField(max_length=200, blank=True)
    kolejnosc = models.PositiveIntegerField(default=0)
    okladka = models.BooleanField(default=False)

    class Meta:
        ordering = ['-okladka', 'kolejnosc']
        verbose_name = "Zdjęcie wyrobu"
        verbose_name_plural = "Zdjęcia wyrobów"

    def __str__(self):
        return f"Zdjęcie – {self.wyrob.nazwa} #{self.kolejnosc}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)        
        if self.zdjecie:
            resize_image(self.zdjecie.path)

