from rest_framework import serializers
from .models import Registro, Categoria, Tag, Anexo, Tipo

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'cor', 'icone']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'nome']

class AnexoSerializer(serializers.ModelSerializer):
    # 🔹 CORREÇÃO: Transformar em SerializerMethodField
    arquivo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Anexo
        fields = ['id', 'arquivo', 'arquivo_url', 'descricao', 'registro', 'enviado_em']

    def get_arquivo_url(self, obj):
        if obj.arquivo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.arquivo.url)
            return obj.arquivo.url
        return None

class TipoSerializer(serializers.ModelSerializer):
    icone_html = serializers.SerializerMethodField()
    
    class Meta:
        model = Tipo
        fields = ['id', 'nome', 'cor', 'icone', 'icone_html', 'ordem']
    
    def get_icone_html(self, obj):
        """Retorna o HTML do ícone para uso no frontend"""
        return f'<i class="{obj.icone}"></i>'

class RegistroSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    tipo_nome = serializers.CharField(source='tipo.nome', read_only=True)
    tipo_cor = serializers.CharField(source='tipo.cor', read_only=True)
    tipo_icone = serializers.CharField(source='tipo.icone', read_only=True)
    tipo_icone_html = serializers.SerializerMethodField()
    autor_nome = serializers.CharField(source='autor.username', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    anexos = serializers.SerializerMethodField()  # 🔹 MUDANÇA: Usar SerializerMethodField

    class Meta:
        model = Registro
        fields = [
            'id', 'titulo', 'conteudo', 'autor', 'autor_nome',
            'categoria', 'categoria_nome', 'tipo', 'tipo_nome', 'tipo_cor', 'tipo_icone', 'tipo_icone_html',
            'tags', 'anexos', 'visualizacoes', 'criado_em', 'atualizado_em'
        ]
        extra_kwargs = {
            "autor": {"read_only": True},
        }

    def get_tipo_icone_html(self, obj):
        """Retorna HTML do ícone do tipo"""
        if obj.tipo and obj.tipo.icone:
            return f'<i class="{obj.tipo.icone}"></i>'
        return ''

    def get_anexos(self, obj):
        # 🔹 CORREÇÃO: Passar o context para o AnexoSerializer
        anexos = obj.anexos.all()
        serializer = AnexoSerializer(anexos, many=True, context=self.context)
        return serializer.data

    def create(self, validated_data):
        categoria_input = validated_data.pop('categoria_input', '').strip()
        if categoria_input:
            categoria, _ = Categoria.objects.get_or_create(nome=categoria_input)
            validated_data['categoria'] = categoria
        return super().create(validated_data)

    def update(self, instance, validated_data):
        categoria_input = validated_data.pop('categoria_input', '').strip()
        if categoria_input:
            categoria, _ = Categoria.objects.get_or_create(nome=categoria_input)
            validated_data['categoria'] = categoria
        return super().update(instance, validated_data)