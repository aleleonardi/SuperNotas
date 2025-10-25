from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    """
    Modelo customizado de usuário.
    """
    nome_completo = models.CharField(max_length=150, blank=True)
    grupo = models.CharField(
        max_length=50,
        choices=[
            ('Admin', 'Admin'),
            ('Colaborador', 'Colaborador'),
            ('Leitura', 'Leitura'),
        ],
        default='Colaborador'
    )

    def __str__(self):
        return self.username
