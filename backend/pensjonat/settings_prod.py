# backend/pensjonat/settings_prod.py
# Użycie: DJANGO_SETTINGS_MODULE=pensjonat.settings_prod

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ── BEZPIECZEŃSTWO ─────────────────────────────────────
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]   # wymagane — brak = crash przy starcie
DEBUG = False

ALLOWED_HOSTS = [
    os.environ.get("DOMAIN", ""),          # np. pensjonat-magda.pl
    os.environ.get("MIKRUS_HOST", ""),     # np. adam100-8000.mikrus.cloud
]

# ── APLIKACJE ──────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core.apps.CoreConfig',
    'oferta.apps.OfertaConfig',
    'restauracja.apps.RestauracjaConfig',
    'galeria.apps.GaleriaConfig',
    'atrakcje.apps.AtrakcjeConfig',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ── CORS ───────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    f"https://{os.environ.get('DOMAIN', '')}",
    f"https://www.{os.environ.get('DOMAIN', '')}",
    f"https://{os.environ.get('MIKRUS_HOST', '')}",
]

# ── BAZA DANYCH ────────────────────────────────────────
# Opcja A: SQLite (wystarczy dla pensjonatu, zero konfiguracji)
#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

# Opcja B: PostgreSQL — odkomentuj jeśli zdecydujesz się na Postgres
DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME':     os.environ.get('DB_NAME', 'pensjonat'),
            'USER':     os.environ.get('DB_USER', 'pensjonat'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST':     os.environ.get('DB_HOST', 'localhost'),
            'PORT':     os.environ.get('DB_PORT', '5432'),
            }
}

# ── DRF ────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissions',
    ],
}

# ── PLIKI STATYCZNE I MEDIA ────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'   # collectstatic wrzuca tu

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ── POZOSTAŁE ──────────────────────────────────────────
ROOT_URLCONF = 'pensjonat.urls'
WSGI_APPLICATION = 'pensjonat.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'pl-pl'
TIME_ZONE = 'Europe/Warsaw'
USE_I18N = True
USE_TZ = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── BEZPIECZEŃSTWO HTTPS ───────────────────────────────
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
