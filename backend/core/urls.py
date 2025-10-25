from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Importe suas views
from usuarios.views import UsuarioViewSet
from registros.views import RegistroViewSet, CategoriaViewSet, TagViewSet, TipoViewSet, AnexoViewSet

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'registros', RegistroViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'tags', TagViewSet)
router.register(r'tipos', TipoViewSet)
router.register(r'anexos', AnexoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path("api/permissoes/", include("permissoes.urls")),
    path('api/anexos/<int:pk>/download/', AnexoViewSet.as_view({'get': 'download'}), name='anexo-download'),
    
    # Auth JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# 🔹🔹🔹 SOLUÇÃO DEFINITIVA PARA SERVIR ARQUIVOS DE MÍDIA
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

# 🔹 Também adicione para arquivos estáticos se necessário
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT,
    }),
]