from __future__ import absolute_import
from kombu import Exchange, Queue
from celery import Celery
from django.conf import settings
from yoro.settings_local import BROKER
import os

yoro = Celery('yoro',
             broker='amqp://' + BROKER["username"] + ":" + BROKER["password"] + "@" + BROKER["url"] + "//",
)
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'
# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoro.celeryconfig')

yoro.config_from_object('yoro.celeryconfig', silent=False)

# Using a string here means the worker will not have to
# pickle the object when using Windows.
yoro.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

print "celery.py has been included : " , BROKER
@yoro.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))

if __name__ == '__main__':
    yoro.start()
