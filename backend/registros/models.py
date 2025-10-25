from django.db import models
from django.conf import settings


class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    cor = models.CharField(max_length=20, default="#0d6efd", help_text="Cor em formato HEX, ex: #0d6efd")
    icone = models.CharField(max_length=50, blank=True, null=True, help_text="Nome do ícone da biblioteca react-icons")
    
    def __str__(self):
        return self.nome


class Tag(models.Model):
    nome = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nome


class Tipo(models.Model):
    ICONE_CHOICES = [
        ('fas fa-code', '🔵 Código'),
        ('fab fa-python', '🐍 Python'),
        ('fab fa-js', '🟡 JavaScript'),
        ('fas fa-database', '🗄️ SQL'),
        ('fas fa-file-code', '📄 JSON'),
        ('fab fa-docker', '🐳 Docker'),
        ('fab fa-linux', '🐧 Linux'),
        ('fab fa-windows', '🪟 Windows'),
        ('fas fa-server', '🖥️ Servidor'),
        ('fas fa-network-wired', '🌐 Rede'),
        ('fas fa-shield-alt', '🛡️ Segurança'),
        ('fas fa-cloud', '☁️ Cloud'),
        ('fas fa-terminal', '💻 Terminal'),
        ('fas fa-code-branch', '🌿 Git'),
        ('fas fa-mobile', '📱 Mobile'),
        ('fas fa-bug', '🐛 Debug'),
        ('fas fa-rocket', '🚀 Deploy'),
        ('fas fa-book', '📚 Documentação'),
        ('fas fa-lightbulb', '💡 Dica'),
        ('fas fa-exclamation-triangle', '⚠️ Alerta'),
    ]
    
    nome = models.CharField(max_length=100)
    cor = models.CharField(max_length=7, default='#6c757d')  # Cor em hex
    icone = models.CharField(
        max_length=50, 
        choices=ICONE_CHOICES, 
        default='fas fa-code'
    )
    ordem = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['ordem', 'nome']
    
    def __str__(self):
        return self.nome

class Registro(models.Model):
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    tipo = models.ForeignKey(Tipo, on_delete=models.SET_NULL, null=True, blank=True)  # 🔹 MUDANÇA AQUI
    tags = models.ManyToManyField(Tag, blank=True)
    visualizacoes = models.PositiveIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo


class Anexo(models.Model):
    registro = models.ForeignKey(
        Registro, 
        on_delete=models.CASCADE,
        related_name="anexos"
    )
    arquivo = models.FileField(upload_to="anexos/")
    descricao = models.CharField(max_length=200, blank=True, null=True)
    enviado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Anexo de {self.registro.titulo}"
    
     # 🔹 NOVO: Propriedade para URL completa do arquivo
    @property
    def arquivo_url(self):
        if self.arquivo and hasattr(self.arquivo, 'url'):
            return self.arquivo.url
        return None


