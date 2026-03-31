from django.urls import path
from . import views

app_name = 'restauracja'

urlpatterns = [
    # Publiczne
    path('menu/', views.KategoriaMenuListView.as_view(), name='menu-list'),
    path('dania/', views.DanieListView.as_view(), name='dania-list'),
    path('sale/', views.SalaListView.as_view(), name='sale-list'),
    path('wyroby/', views.WyrobListView.as_view(), name='wyroby-list'),
    path('kategorie-wyrobow/', views.KategoriaWyrobuListView.as_view(), name='kategorie-wyrobow-list'),
    path('godziny/', views.GodzinyOtwarciaListView.as_view(), name='godziny-list'),

    # Zarządzanie (zalogowani)
    path('manage/menu/', views.KategoriaMenuManageView.as_view(), name='menu-manage'),
    path('manage/menu/<int:pk>/', views.KategoriaMenuDetailView.as_view(), name='menu-detail'),
    path('manage/dania/', views.DanieManageView.as_view(), name='dania-manage'),
    path('manage/dania/<int:pk>/', views.DanieDetailView.as_view(), name='dania-detail'),
    path('manage/sale/', views.SalaManageView.as_view(), name='sale-manage'),
    path('manage/sale/<int:pk>/', views.SalaDetailView.as_view(), name='sale-detail'),
    path('manage/wyroby/', views.WyrobManageView.as_view(), name='wyroby-manage'),
    path('manage/wyroby/<int:pk>/', views.WyrobDetailView.as_view(), name='wyroby-detail'),
    path('manage/kategorie-wyrobow/', views.KategoriaWyrobuManageView.as_view(), name='kategorie-wyrobow-manage'),
    path('manage/kategorie-wyrobow/<int:pk>/', views.KategoriaWyrobuDetailView.as_view(), name='kategorie-wyrobow-detail'),    
    path('manage/godziny/', views.GodzinyOtwarciaManageView.as_view(), name='godziny-manage'),
    path('manage/godziny/<int:pk>/', views.GodzinyOtwarciaDetailView.as_view(), name='godziny-detail'),
]
