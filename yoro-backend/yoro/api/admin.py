from django.contrib import admin
from api.models import YoroUser, Video

class YoroUserAdmin(admin.ModelAdmin):

	list_display = ( 'guid', 'username', 'passkey','created_at', 'can_upload', 'user_id', 'is_identified')

	search_fields = [ 'guid', 'username', 'passkey', 'created_at', 'can_upload', 'user_id']

admin.site.register(YoroUser, YoroUserAdmin)

class VideoAdmin(admin.ModelAdmin):

	list_display = ( 'guid', 'user', 'created_at', 'video', 'local_path', 'local_path_2')

	search_fields = [ 'guid', 'user', 'created_at', 'video', ]

admin.site.register(Video, VideoAdmin)
