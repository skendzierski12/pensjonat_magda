from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Publiczne
    path('ustawienia/', views.UstawieniaStronyView.as_view(), name='ustawienia'),
    path('hero/', views.ZdjecieHeroListView.as_view(), name='hero-list'),
    path('o-nas/', views.ONasListView.as_view(), name='onas-list'),
    path('ogloszenia/', views.OgloszenieListView.as_view(), name='ogloszenia-list'),
    path('kontakt/', views.KontaktCreateView.as_view(), name='kontakt'),

    # Zarządzanie (zalogowani)
    path('manage/ustawienia/<int:pk>/', views.UstawieniaStronyUpdateView.as_view(), name='ustawienia-manage'),
    path('manage/hero/', views.ZdjecieHeroManageView.as_view(), name='hero-manage'),
    path('manage/hero/<int:pk>/', views.ZdjecieHeroDetailView.as_view(), name='hero-detail'),
    path('manage/o-nas/', views.ONasManageView.as_view(), name='onas-manage'),
    path('manage/o-nas/<int:pk>/', views.ONasDetailView.as_view(), name='onas-detail'),
    path('manage/ogloszenia/', views.OgloszenieManageView.as_view(), name='ogloszenia-manage'),
    path('manage/ogloszenia/<int:pk>/', views.OgloszenieDetailView.as_view(), name='ogloszenia-detail'),
    path('manage/kontakt/<int:pk>/', views.KontaktDetailView.as_view(), name='kontakt-detail'),

    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.MeView.as_view(), name='me'),
]
