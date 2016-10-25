from django.db import models
#from videothumbs.fields import VideoThumbnailField
import datetime, uuid

class YoroUser(models.Model):

	guid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
	username = models.CharField(max_length=500, null=False, blank=False)
	passkey = models.CharField(max_length=500, null=False, blank=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	can_upload = models.BooleanField(default=True, null=False)
	user_id = models.CharField(max_length=200, null=True, blank=True)
	is_identified = models.BooleanField(default=False)

	class Meta:
		unique_together = (("username", "passkey"),)

	def __unicode__(self):
		return '%s <----> %s' %(self.username, self.guid)

# file upload path creator
# creates path based on date and username
def user_directory_path(instance, filename):
	import datetime
	username = instance.user.username
	date =  datetime.datetime.now()
	path = "videos/" + str(username) + "/" + str(date.year) + "/" + str(date.month) + "/" + str(date.day) + "/" + str(filename)
	return path

class Video(models.Model):

	guid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
	user = models.ForeignKey(YoroUser, related_name="user", db_index=True)
	created_at = models.DateTimeField(auto_now_add=True)
	# local path in app directory
	# this will be the default path for playing video file
	local_path = models.CharField(max_length=500, blank=True, null=True) 
	# local path in video directory
	# this will be the first fallback
	local_path_2 = models.CharField(max_length=500, blank=True, null=True) # local path in video directory
	#video = VideoThumbnailField(upload_to="videos", null=True, blank=True)
	video = models.FileField(upload_to=user_directory_path, null=True, blank=True)
	class Meta:
		ordering = ('created_at',)

	def __unicode__(self):
		return '%s <----> %s <----> %s' % (self.user, self.created_at, self.video)
