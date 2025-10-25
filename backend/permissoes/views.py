from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from registros.models import Registro
from .models import AcessoRegistro, LinkTemporario, AuditoriaRegistro
from .serializers import (
    AcessoRegistroSerializer,
    LinkTemporarioSerializer,
    AuditoriaRegistroSerializer,
)
from django.contrib.auth.models import Group, User
import uuid


class AcessoRegistroViewSet(viewsets.ModelViewSet):
    """
    Controla o compartilhamento e permissões individuais de registros.
    """
    queryset = AcessoRegistro.objects.all()
    serializer_class = AcessoRegistroSerializer

    def create(self, request, *args, **kwargs):
        """
        Cria permissões de acesso (compartilhar registro).
        """
        registro_id = request.data.get("registro")
        usuario_id = request.data.get("usuario")
        equipe_id = request.data.get("equipe")
        permissao = request.data.get("permissao")

        registro = get_object_or_404(Registro, id=registro_id)

        acesso, criado = AcessoRegistro.objects.update_or_create(
            registro=registro,
            usuario_id=usuario_id,
            equipe_id=equipe_id,
            defaults={"permissao": permissao},
        )

        AuditoriaRegistro.objects.create(
            registro=registro,
            usuario=request.user,
            acao=f"Compartilhou com {acesso.usuario or acesso.equipe}",
            detalhes={"permissao": permissao},
        )

        serializer = self.get_serializer(acesso)
        status_code = status.HTTP_201_CREATED if criado else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    @action(detail=True, methods=["delete"])
    def revogar(self, request, pk=None):
        """
        Revoga o acesso de um usuário ou equipe.
        """
        acesso = get_object_or_404(AcessoRegistro, id=pk)
        registro = acesso.registro

        AuditoriaRegistro.objects.create(
            registro=registro,
            usuario=request.user,
            acao=f"Revogou acesso de {acesso.usuario or acesso.equipe}",
        )

        acesso.delete()
        return Response({"status": "Acesso revogado"}, status=status.HTTP_204_NO_CONTENT)


class LinkTemporarioViewSet(viewsets.ModelViewSet):
    """
    Gera links temporários de visualização de registros.
    """
    queryset = LinkTemporario.objects.all()
    serializer_class = LinkTemporarioSerializer

    @action(detail=False, methods=["post"])
    def gerar(self, request):
        registro_id = request.data.get("registro")
        permissao = request.data.get("permissao", "ver")
        expira_em = request.data.get("expira_em")

        registro = get_object_or_404(Registro, id=registro_id)
        token = str(uuid.uuid4())

        link = LinkTemporario.objects.create(
            registro=registro,
            token=token,
            permissao=permissao,
            expira_em=expira_em,
        )

        AuditoriaRegistro.objects.create(
            registro=registro,
            usuario=request.user,
            acao="Gerou link temporário",
            detalhes={"token": token, "expira_em": expira_em},
        )

        serializer = self.get_serializer(link)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuditoriaRegistroViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exibe logs de auditoria de ações realizadas em registros.
    """
    queryset = AuditoriaRegistro.objects.all().order_by("-criado_em")
    serializer_class = AuditoriaRegistroSerializer

    def get_queryset(self):
        registro_id = self.request.query_params.get("registro")
        if registro_id:
            return self.queryset.filter(registro_id=registro_id)
        return self.queryset
