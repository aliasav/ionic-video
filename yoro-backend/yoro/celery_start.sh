#!/bin/bash

NAME="yoro"                                  # Name of the application
DJANGODIR=/home/yoro/yoro_codebase/yoro-backend/yoro # Django project directory
LOGFILE=/var/log/celery.log

echo "Starting $NAME celery"

# Activate the virtual environment
cd $DJANGODIR
source /home/yoro/virtualenvs/yoro/bin/activate

# queues to be consumed dependent on server
exec python manage.py celery worker -l INFO --app=yoro.celery.yoro --logfile=$LOGFILE --pidfile=/tmp/celery%n.pid -Ofair
