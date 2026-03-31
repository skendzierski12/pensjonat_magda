from django.urls import path
from . import views

app_name = 'oferta'

urlpatterns = [
    # Publiczne
    path('typy-pokoi/', views.TypPokojuListView.as_view(), name='typy-list'),
    path('pokoje/', views.PokojListView.as_view(), name='pokoje-list'),
    path('udogodnienia/', views.UdogodnieniePokojuListView.as_view(), name='udogodnienia-list'),
    path('sezony/', views.SezonCenowyListView.as_view(), name='sezony-list'),
    path('imprezy/', views.ImprezaListView.as_view(), name='imprezy-list'),

    # Zarządzanie (zalogowani)
    path('manage/typy-pokoi/', views.TypPokojuManageView.as_view(), name='typy-manage'),
    path('manage/typy-pokoi/<int:pk>/', views.TypPokojuDetailView.as_view(), name='typy-detail'),
    path('manage/pokoje/', views.PokojManageView.as_view(), name='pokoje-manage'),
    path('manage/pokoje/<int:pk>/', views.PokojDetailView.as_view(), name='pokoje-detail'),
    path('manage/zdjecia-pokoi/', views.ZdjeciePokojuManageView.as_view(), name='zdjecia-pokoju-manage'),
    path('manage/zdjecia-pokoi/<int:pk>/', views.ZdjeciePokojuDetailView.as_view(), name='zdjecia-pokoju-detail'),
    path('manage/sezony/', views.SezonCenowyManageView.as_view(), name='sezony-manage'),
    path('manage/sezony/<int:pk>/', views.SezonCenowyDetailView.as_view(), name='sezony-detail'),
    path('manage/imprezy/', views.ImprezaManageView.as_view(), name='imprezy-manage'),
    path('manage/imprezy/<int:pk>/', views.ImprezaDetailView.as_view(), name='imprezy-detail'),
    path('manage/ceny/', views.CenaPokojuManageView.as_view(), name='ceny-manage'),
    path('manage/ceny/<int:pk>/', views.CenaPokojuDetailView.as_view(), name = 'ceny-detail'),
]
