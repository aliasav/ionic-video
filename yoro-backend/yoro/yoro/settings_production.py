import os

DEBUG = False

ALLOWED_HOSTS = ["*"]

STATIC_URL = "/static/"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATIC_ROOT = os.path.join(BASE_DIR,'public/')

# should be True when using SQLite in production
USE_TZ = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'yoro',                       # Or path to database file if using sqlite3.
        'USER': 'root',                      # Not used with sqlite3.
        'PASSWORD': 'sdgu9kHWjvsB3Tn',                  # Not used with sqlite3.
        'HOST': '',                         # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',

    }
}

BROKER = {
    "username" : "guest",
    "password" : "8558881858",
    "url" : "127.0.0.1:5672",
}
