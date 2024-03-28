from rest_framework.serializers import ModelSerializer
from content_management.models import (
    Content, Metadata, MetadataType, User,
    LibraryVersion, LibraryFolder, LibLayoutImage, LibraryModule, Changelog )

from rest_framework.validators import UniqueTogetherValidator


class ContentSerializer(ModelSerializer):
    class Meta:
        model = Content
        fields = ('id', 'file_name', 'content_file', 'title', 'display_title', 'description', 'modified_on', 'copyright_notes',
                  'rights_statement', 'published_date', 'active', 'metadata', 'additional_notes', 'metadata_info',
                  "published_year", "filesize", "reviewed_on", 'duplicatable')


class MetadataSerializer(ModelSerializer):
    class Meta:
        validators = [
            UniqueTogetherValidator(
                queryset=Metadata.objects.all(),
                fields=["type", "name"]
            )
        ]
        model = Metadata
        fields = ('id', 'name', 'type', 'type_name')


class MetadataTypeSerializer(ModelSerializer):
    class Meta:
        model = MetadataType
        fields = '__all__'


class LibLayoutImageSerializer(ModelSerializer):
    class Meta:
        model = LibLayoutImage
        fields = ("id", "image_file", "image_group", "file_name")


class LibraryVersionSerializer(ModelSerializer):
    class Meta:
        model = LibraryVersion
        fields = (
            "id", "library_name", "version_number", "created_on",
            "library_banner", "created_by", "user_info", "library_modules", "metadata_types"
        )


class LibraryFolderSerializer(ModelSerializer):
    class Meta:
        model = LibraryFolder
        fields = (
            "id", "folder_name", "logo_img", "version", "parent", "library_content", "breadcrumb"
        )


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class LibraryModuleSerializer(ModelSerializer):
    class Meta:
        model = LibraryModule
        fields = ("id", "module_name", "module_file", "logo_img", "file_name")

class ChangelogSerializer(ModelSerializer):
    class Meta:
        model = Changelog
        fields = ("id", "change_date", "change_description","library_version_id")