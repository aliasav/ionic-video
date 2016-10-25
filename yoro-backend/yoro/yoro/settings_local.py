print "This is settings_local!"


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'yoro',                       # Or path to database file if using sqlite3.
        'USER': 'root',                      # Not used with sqlite3.
        'PASSWORD': 'qo8rNqbctxattwqFu2yf',                  # Not used with sqlite3.
        'HOST': '',                         # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',

    }
}

BROKER = {
    "username" : "guest",
    "password" : "guest",
    "url" : "127.0.0.1:5672",
}
