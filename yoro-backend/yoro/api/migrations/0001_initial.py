# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import api.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('guid', models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('local_path', models.CharField(max_length=500, null=True, blank=True)),
                ('video', models.FileField(null=True, upload_to=api.models.user_directory_path, blank=True)),
            ],
            options={
                'ordering': ('created_at',),
            },
        ),
        migrations.CreateModel(
            name='YoroUser',
            fields=[
                ('guid', models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, db_index=True)),
                ('username', models.CharField(max_length=500)),
                ('passkey', models.CharField(max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('can_upload', models.BooleanField(default=True)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='yorouser',
            unique_together=set([('username', 'passkey')]),
        ),
        migrations.AddField(
            model_name='video',
            name='user',
            field=models.ForeignKey(related_name='user', to='api.YoroUser'),
        ),
    ]
