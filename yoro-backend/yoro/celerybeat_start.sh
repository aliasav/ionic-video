#!/bin/bash

NAME="yoro"                                  # Name of the application
DJANGODIR=/home/yoro/yoro_codebase/yoro-backend/yoro # Django project directory
USER=yoro                                      # the user to run as
GROUP=yoro                                       # the group to run as
NUM_WORKERS=1                                     # how many worker processes should Gunicorn spawn
DJANGO_SETTINGS_MODULE=yoro.settings             # which settings file should Django use
LOGFILE=/var/log/celerybeat.log

echo "Starting $NAME celerybeat"

# Activate the virtual environment
cd $DJANGODIR
source /home/yoro/virtualenvs/yoro/bin/activate
export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
export PYTHONPATH=$DJANGODIR:$PYTHONPATH

exec python manage.py celery beat --loglevel=INFO --logfile=$LOGFILE --app=yoro.celery.yoro -S djcelery.schedulers.DatabaseScheduler
