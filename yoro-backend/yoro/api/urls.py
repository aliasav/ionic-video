from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from api import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
	url(r'^signup$', views.create_user),
	url(r'^login$', views.login),
	url(r'^upload_video$', views.upload_video),
	url(r'^get_user_history$', views.get_user_history),
	url(r'^get_can_upload_flag$', views.get_can_upload_flag),
]

urlpatterns = format_suffix_patterns(urlpatterns)