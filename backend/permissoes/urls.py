from rest_framework.routers import DefaultRouter
from .views import AcessoRegistroViewSet, LinkTemporarioViewSet, AuditoriaRegistroViewSet

router = DefaultRouter()
router.register(r"acessos", AcessoRegistroViewSet, basename="acessos")
router.register(r"links", LinkTemporarioViewSet, basename="links")
router.register(r"auditorias", AuditoriaRegistroViewSet, basename="auditorias")

urlpatterns = router.urls
