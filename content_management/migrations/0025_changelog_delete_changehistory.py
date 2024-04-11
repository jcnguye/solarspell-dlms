# Generated by Django 5.0.1 on 2024-03-19 22:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content_management', '0024_changehistory'),
    ]

    operations = [
        migrations.CreateModel(
            name='ChangeLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version_number', models.CharField(max_length=300)),
                ('change_date', models.DateTimeField(auto_now_add=True)),
                ('change_action', models.TextField(null=True)),
                ('change_description', models.TextField()),
                ('library_version', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='changelog', to='content_management.libraryversion')),
            ],
        ),
        migrations.DeleteModel(
            name='ChangeHistory',
        ),
    ]
