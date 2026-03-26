from django.urls import path
from . import views

app_name = 'galeria'

urlpatterns = [
    # Publiczne
    path('sekcje/', views.SekcjaGaleriiListView.as_view(), name='sekcje-list'),
    path('zdjecia/', views.ZdjecieListView.as_view(), name='zdjecia-list'),

    # Zarządzanie (zalogowani)
    path('manage/sekcje/', views.SekcjaGaleriiManageView.as_view(), name='sekcje-manage'),
    path('manage/sekcje/<int:pk>/', views.SekcjaGaleriiDetailView.as_view(), name='sekcje-detail'),
    path('manage/zdjecia/', views.ZdjecieManageView.as_view(), name='zdjecia-manage'),
    path('manage/zdjecia/<int:pk>/', views.ZdjecieDetailView.as_view(), name='zdjecia-detail'),
]
