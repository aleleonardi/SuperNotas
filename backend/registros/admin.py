from django.contrib import admin
from .models import Categoria, Tag, Registro, Tipo, Anexo

@admin.register(Tipo)
class TipoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'icone', 'cor', 'ordem', 'registros_count']
    list_editable = ['ordem', 'cor']
    ordering = ['ordem', 'nome']
    search_fields = ['nome']
    
    def registros_count(self, obj):
        return obj.registro_set.count()
    registros_count.short_description = 'Total Registros'

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cor', 'icone', 'registros_count']
    search_fields = ['nome']
    
    def registros_count(self, obj):
        return obj.registro_set.count()
    registros_count.short_description = 'Total Registros'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome')
    search_fields = ('nome',)


@admin.register(Registro)
class RegistroAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'autor', 'tipo', 'categoria', 'visualizacoes', 'criado_em']
    list_filter = ['tipo', 'categoria', 'autor', 'criado_em']
    search_fields = ['titulo', 'conteudo']
    readonly_fields = ['visualizacoes', 'criado_em', 'atualizado_em']
    
@admin.register(Anexo)
class AnexoAdmin(admin.ModelAdmin):
    list_display = ['arquivo', 'registro', 'enviado_em']
    list_filter = ['enviado_em']