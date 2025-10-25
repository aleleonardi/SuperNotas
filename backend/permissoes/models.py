from django.db import models
from django.conf import settings
from registros.models import Registro

class AcessoRegistro(models.Model):
    PERMISSOES_CHOICES = [
        ("ver", "Pode ver"),
        ("comentar", "Pode comentar"),
        ("editar", "Pode editar"),
        ("publicar", "Pode publicar"),
        ("ver_sigilosos", "Pode ver campos sigilosos"),
    ]

    registro = models.ForeignKey(Registro, on_delete=models.CASCADE, related_name="acessos")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    equipe = models.ForeignKey("auth.Group", on_delete=models.CASCADE, null=True, blank=True)
    permissao = models.CharField(max_length=20, choices=PERMISSOES_CHOICES)
    criado_em = models.DateTimeField(auto_now_add=True)
    modificado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        alvo = self.usuario.username if self.usuario else self.equipe.name
        return f"{alvo} -> {self.registro} ({self.permissao})"


class LinkTemporario(models.Model):
    PERMISSOES_CHOICES = [
        ("ver", "Pode ver"),
        ("comentar", "Pode comentar"),
    ]

    registro = models.ForeignKey(Registro, on_delete=models.CASCADE, related_name="links")
    token = models.CharField(max_length=100, unique=True)
    expira_em = models.DateTimeField()
    permissao = models.CharField(max_length=20, choices=PERMISSOES_CHOICES)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"Link {self.token} para {self.registro}"


class AuditoriaRegistro(models.Model):
    registro = models.ForeignKey(Registro, on_delete=models.CASCADE, related_name="auditorias")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    acao = models.CharField(max_length=255)
    detalhes = models.JSONField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} fez {self.acao} em {self.registro} ({self.criado_em})"
