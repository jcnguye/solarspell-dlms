# Generated by Django 5.0.1 on 2024-03-14 17:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content_management', '0024_changelog'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='changelog',
            name='version_number',
        ),
    ]
