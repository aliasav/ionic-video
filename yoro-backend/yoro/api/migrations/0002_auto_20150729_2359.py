# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='yorouser',
            name='is_identified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='yorouser',
            name='user_id',
            field=models.CharField(max_length=200, null=True, blank=True),
        ),
    ]
