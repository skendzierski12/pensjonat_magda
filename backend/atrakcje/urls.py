from django.urls import path
from . import views

app_name = 'atrakcje'

urlpatterns = [
    # Publiczne
    path('kategorie/', views.KategoriaAtrakcjiListView.as_view(), name='kategorie-list'),
    path('lista/', views.AtrakcjaListView.as_view(), name='atrakcje-list'),

    # Zarządzanie (zalogowani)
    path('manage/kategorie/', views.KategoriaAtrakcjiManageView.as_view(), name='kategorie-manage'),
    path('manage/kategorie/<int:pk>/', views.KategoriaAtrakcjiDetailView.as_view(), name='kategorie-detail'),
    path('manage/lista/', views.AtrakcjaManageView.as_view(), name='atrakcje-manage'),
    path('manage/lista/<int:pk>/', views.AtrakcjaDetailView.as_view(), name='atrakcje-detail'),
]
