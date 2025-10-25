from rest_framework import viewsets, filters
from rest_framework.response import Response
from .models import Registro, Categoria, Tag, Anexo, Tipo
from .serializers import RegistroSerializer, TipoSerializer, CategoriaSerializer, TagSerializer, AnexoSerializer
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

# 🔹 MOVER IsOwner PARA O TOPO - defini-la antes de ser usada
class IsOwner(permissions.BasePermission):
    """
    Permite acesso apenas ao dono do registro
    """
    def has_object_permission(self, request, view, obj):
        return obj.autor == request.user

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nome')
    serializer_class = CategoriaSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('nome')
    serializer_class = TagSerializer

class TipoViewSet(viewsets.ModelViewSet):
    queryset = Tipo.objects.all().order_by('ordem', 'nome')
    serializer_class = TipoSerializer
    pagination_class = None

class AnexoViewSet(viewsets.ModelViewSet):
    queryset = Anexo.objects.all()
    serializer_class = AnexoSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        registro_id = self.request.data.get('registro')
        if registro_id:
            try:
                registro = Registro.objects.get(id=registro_id)
                serializer.save(registro=registro)
            except Registro.DoesNotExist:
                serializer.save()
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        anexo = self.get_object()
        if anexo.arquivo:
            response = Response(status=status.HTTP_200_OK)
            response['Content-Disposition'] = f'attachment; filename="{anexo.arquivo.name}"'
            response['X-Accel-Redirect'] = anexo.arquivo.url
            return response
        return Response({'error': 'Arquivo não encontrado'}, status=status.HTTP_404_NOT_FOUND)

class RegistroViewSet(viewsets.ModelViewSet):
    queryset = Registro.objects.all().order_by('-atualizado_em')
    serializer_class = RegistroSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'conteudo', 'categoria__nome', 'tags__nome', 'tipo__nome']
    permission_classes = [permissions.IsAuthenticated, IsOwner]  # 🔹 Agora IsOwner já está definida

    def get_queryset(self):
        user = self.request.user
        return Registro.objects.filter(autor=user).order_by('-atualizado_em')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visualizacoes += 1
        instance.save(update_fields=["visualizacoes"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)