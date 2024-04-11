from content_management.models import (
    Content, Metadata, MetadataType, LibLayoutImage, LibraryVersion,
    LibraryFolder, User,
    LibraryModule,ChangeLog)
from django.dispatch import receiver
from django.db.models.signals import *

from django.db import models

# @receiver(models.signals.post_save,sender=LibraryVersion.library_modules.through)
# def library_module_changed(sender, instance, action, **kwargs):
#     if action in ['post_add','post_remove','post_clear']:

#         ChangeLog.objects.create(
#             library_version=instance,
#             version_number=instance.version_number,
#             change_description=f"Library modules {instance.library_module} change. Action {action} "
#         )
