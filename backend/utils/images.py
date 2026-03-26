from PIL import Image
import os

MAX_WIDTH  = 1600   # px — max szerokość po zapisie
MAX_HEIGHT = 1600   # px — max wysokość po zapisie
THUMB_SIZE = (800, 800)   # miniatura (proporcje zachowane)
QUALITY    = 85     # JPEG quality

def resize_image(path, max_w=MAX_WIDTH, max_h=MAX_HEIGHT, quality=QUALITY):
    """
    Zmniejsza obraz jeśli przekracza max_w x max_h.
    Działa in-place — nadpisuje plik na dysku.
    Bezpieczne: nie robi nic jeśli plik nie istnieje.
    """
    if not path or not os.path.exists(path):
        return
    try:
        with Image.open(path) as img:
            # Zachowaj EXIF (portrait/landscape)
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Konwertuj do RGB (np. PNG z kanałem alpha)
            if img.mode in ("RGBA", "P", "LA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
                img = background

            # Zmniejsz tylko jeśli za duże
            if img.width > max_w or img.height > max_h:
                img.thumbnail((max_w, max_h), Image.LANCZOS)

            # Zapisz jako JPEG (lub zachowaj format jeśli PNG)
            ext = os.path.splitext(path)[1].lower()
            fmt = "JPEG" if ext in (".jpg", ".jpeg") else "PNG" if ext == ".png" else "JPEG"
            img.save(path, fmt, quality=quality, optimize=True)
    except Exception as e:
        # Nie przerywamy uploadu jeśli resize się nie uda
        print(f"[resize_image] błąd: {e}")


