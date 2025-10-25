# registros/management/commands/popular_tipos.py
from django.core.management.base import BaseCommand
from registros.models import Tipo

class Command(BaseCommand):
    help = 'Popula a tabela de tipos com dados iniciais'

    def handle(self, *args, **options):
        tipos_data = [
            {'nome': 'Python', 'icone': 'fab fa-python', 'cor': '#3776AB', 'ordem': 1},
            {'nome': 'JavaScript', 'icone': 'fab fa-js', 'cor': '#F7DF1E', 'ordem': 2},
            {'nome': 'SQL', 'icone': 'fas fa-database', 'cor': '#336791', 'ordem': 3},
            {'nome': 'JSON', 'icone': 'fas fa-file-code', 'cor': '#000000', 'ordem': 4},
            {'nome': 'Docker', 'icone': 'fab fa-docker', 'cor': '#2496ED', 'ordem': 5},
            {'nome': 'Linux', 'icone': 'fab fa-linux', 'cor': '#FCC624', 'ordem': 6},
            {'nome': 'Windows', 'icone': 'fab fa-windows', 'cor': '#0078D6', 'ordem': 7},
            {'nome': 'Rede', 'icone': 'fas fa-network-wired', 'cor': '#28a745', 'ordem': 8},
            {'nome': 'Segurança', 'icone': 'fas fa-shield-alt', 'cor': '#dc3545', 'ordem': 9},
            {'nome': 'Documentação', 'icone': 'fas fa-book', 'cor': '#6f42c1', 'ordem': 10},
            {'nome': 'Dica', 'icone': 'fas fa-lightbulb', 'cor': '#ffc107', 'ordem': 11},
            {'nome': 'Alerta', 'icone': 'fas fa-exclamation-triangle', 'cor': '#fd7e14', 'ordem': 12},
        ]

        for tipo_info in tipos_data:
            tipo, created = Tipo.objects.get_or_create(
                nome=tipo_info['nome'],
                defaults=tipo_info
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Tipo criado: {tipo.nome}')
                )
            else:
                # Atualiza os dados se o tipo já existir
                for key, value in tipo_info.items():
                    if key != 'nome':  # Não atualiza o nome
                        setattr(tipo, key, value)
                tipo.save()
                self.stdout.write(
                    self.style.WARNING(f'📝 Tipo atualizado: {tipo.nome}')
                )