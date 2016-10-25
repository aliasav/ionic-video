# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20150729_2359'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='local_path_2',
            field=models.CharField(max_length=500, null=True, blank=True),
        ),
    ]
