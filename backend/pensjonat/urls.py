from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),
    path('api/oferta/', include('oferta.urls')),
    path('api/restauracja/', include('restauracja.urls')),
    path('api/galeria/', include('galeria.urls')),
    path('api/atrakcje/', include('atrakcje.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

