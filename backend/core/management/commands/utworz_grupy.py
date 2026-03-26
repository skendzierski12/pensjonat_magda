from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission


class Command(BaseCommand):
    help = 'Tworzy grupy użytkowników z odpowiednimi uprawnieniami'

    def handle(self, *args, **kwargs):
        self.stdout.write('Tworzenie grup...')

        # ── Usuń stare grupy (idempotentność) ──
        for nazwa in ['Administrator', 'Recepcja', 'Kuchnia']:
            Group.objects.filter(name=nazwa).delete()

        # ── Pomocnicza funkcja ──
        def get_perms(app_label, model_name, akcje):
            perms = []
            for akcja in akcje:
                codename = f'{akcja}_{model_name}'
                try:
                    perm = Permission.objects.get(
                        codename=codename,
                        content_type__app_label=app_label,
                    )
                    perms.append(perm)
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'  Brak uprawnienia: {app_label}.{codename}')
                    )
            return perms

        CRUD = ['add', 'change', 'delete', 'view']
        VIEW_CHANGE = ['view', 'change']

        # ════════════════════════════════
        # ADMINISTRATOR — pełny dostęp
        # ════════════════════════════════
        admin_grupa, _ = Group.objects.get_or_create(name='Administrator')
        admin_perms = []

        # core
        for model in ['kontakt', 'ogloszenie', 'onas', 'ustawieniastrony', 'zdjeciehero']:
            admin_perms += get_perms('core', model, CRUD)

        # oferta
        for model in ['cenapokoj', 'impreza', 'pokoj', 'sezoncenowy', 'typpokoju', 'udogodnieniepokoju', 'zdjeciepokoj']:
            admin_perms += get_perms('oferta', model, CRUD)

        # restauracja
        for model in ['danie', 'kategoriamenu', 'kategoriawyrobu', 'salarestauracyjna', 'wyrob', 'zdjeciesali', 'zdjeciewyrobu']:
            admin_perms += get_perms('restauracja', model, CRUD)

        # galeria
        for model in ['sekcjagalerii', 'zdjecie']:
            admin_perms += get_perms('galeria', model, CRUD)

        # atrakcje
        for model in ['atrakcja', 'kategoriaatrakcji', 'zdjecieatrakcji']:
            admin_perms += get_perms('atrakcje', model, CRUD)

        admin_grupa.permissions.set(admin_perms)
        self.stdout.write(self.style.SUCCESS(
            f'  Administrator — {len(admin_perms)} uprawnień'
        ))

        # ════════════════════════════════
        # RECEPCJA
        # ════════════════════════════════
        recepcja_grupa, _ = Group.objects.get_or_create(name='Recepcja')
        recepcja_perms = []

        # ogłoszenia — pełny CRUD
        recepcja_perms += get_perms('core', 'ogloszenie', CRUD)

        # wiadomości kontaktowe — tylko czytanie i oznaczanie
        recepcja_perms += get_perms('core', 'kontakt', VIEW_CHANGE)

        # pokoje i typy — tylko podgląd
        recepcja_perms += get_perms('oferta', 'pokoj', ['view'])
        recepcja_perms += get_perms('oferta', 'typpokoju', ['view'])
        recepcja_perms += get_perms('oferta', 'sezoncenowy', ['view'])
        recepcja_perms += get_perms('oferta', 'cenapokoj', ['view'])

        recepcja_grupa.permissions.set(recepcja_perms)
        self.stdout.write(self.style.SUCCESS(
            f'  Recepcja    — {len(recepcja_perms)} uprawnień'
        ))

        # ════════════════════════════════
        # KUCHNIA
        # ════════════════════════════════
        kuchnia_grupa, _ = Group.objects.get_or_create(name='Kuchnia')
        kuchnia_perms = []

        # menu i dania — pełny CRUD
        kuchnia_perms += get_perms('restauracja', 'danie', CRUD)
        kuchnia_perms += get_perms('restauracja', 'kategoriamenu', CRUD)

        # wyroby własne — pełny CRUD
        kuchnia_perms += get_perms('restauracja', 'wyrob', CRUD)
        kuchnia_perms += get_perms('restauracja', 'kategoriawyrobu', CRUD)
        kuchnia_perms += get_perms('restauracja', 'zdjeciewyrobu', CRUD)

        # sale — tylko podgląd
        kuchnia_perms += get_perms('restauracja', 'salarestauracyjna', ['view'])

        kuchnia_grupa.permissions.set(kuchnia_perms)
        self.stdout.write(self.style.SUCCESS(
            f'  Kuchnia     — {len(kuchnia_perms)} uprawnień'
        ))

        self.stdout.write(self.style.SUCCESS('\nGrupy utworzone pomyślnie!'))
        self.stdout.write(
            '\nAby przypisać użytkownika do grupy:\n'
            '  python manage.py shell\n'
            '  >>> from django.contrib.auth.models import User, Group\n'
            '  >>> u = User.objects.get(username="nazwa")\n'
            '  >>> u.groups.add(Group.objects.get(name="Recepcja"))\n'
        )
