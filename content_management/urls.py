from django.urls import include, path
from rest_framework import routers
from django.conf.urls.static import static

from dlms import settings
from .views import (
    ContentViewSet, MetadataViewSet, MetadataTypeViewSet, UserViewSet,
    LibraryFolderViewSet, LibraryVersionViewSet, LibLayoutImageViewSet, LibraryBuildView, metadata_sheet, BulkAddView, get_csrf,
    LibraryModuleViewSet, disk_info)

router = routers.DefaultRouter()
router.register(r'contents', ContentViewSet)
router.register(r'metadata', MetadataViewSet)
router.register(r'metadata_types', MetadataTypeViewSet)
router.register(r'lib_layout_images', LibLayoutImageViewSet)
router.register(r'library_versions', LibraryVersionViewSet)
router.register(r'library_folders', LibraryFolderViewSet)
router.register(r'users', UserViewSet)
router.register(r'library_modules', LibraryModuleViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/contents_upload/', BulkAddView.as_view(), name="contents-upload"),
    path('api/content_bulk_add/', BulkAddView.as_view(), name="content_bulk_add"),
    path('api/create_build/<int:version_id>/', LibraryBuildView.as_view(), name="create-build"),
    path('api/spreadsheet/metadata/<str:metadata_type>', metadata_sheet),
    path('api/disk_info/', disk_info),
    path('api/get_csrf/', get_csrf),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
