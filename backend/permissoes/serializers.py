from rest_framework import serializers
from .models import AcessoRegistro, LinkTemporario, AuditoriaRegistro

class AcessoRegistroSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source="usuario.username", read_only=True)
    equipe_nome = serializers.CharField(source="equipe.name", read_only=True)

    class Meta:
        model = AcessoRegistro
        fields = ["id", "registro", "usuario", "usuario_nome", "equipe", "equipe_nome", "permissao", "criado_em"]


class LinkTemporarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkTemporario
        fields = ["id", "registro", "token", "expira_em", "permissao", "ativo"]


class AuditoriaRegistroSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source="usuario.username", read_only=True)

    class Meta:
        model = AuditoriaRegistro
        fields = ["id", "registro", "usuario", "usuario_nome", "acao", "detalhes", "criado_em"]
