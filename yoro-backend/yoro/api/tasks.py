from api.models import YoroUser, Video
from django.core.exceptions import ObjectDoesNotExist
from celery.task.schedules import crontab
from celery.decorators import periodic_task
import datetime as dt
import logging

logger = logging.getLogger(__name__)

"""
Task that runs everyday at 12:05 A.M. to set can_upload_flag(s) of YoroUsers
"""

@periodic_task(run_every=crontab(minute=0, hour=0))
def update_can_upload_flags():

	logger.debug("Periodic task : update_can_upload_flags called.")

	# get users
	try :

		users = YoroUser.objects.all()

	except :

		logger.critical("Error in getting YoroUsers")

	else :

		current_date = dt.date.today()

		for user in users:

			# get latest video
			try:

				latest_video = Video.objects.filter(user=user).latest("created_at")

			except ObjectDoesNotExist :

				user.can_upload = True
				user.save()
				logger.warning("Videos do not exist for user: %s, setting can_upload_flag to True anyway! : %s" %(user.username, user.can_upload))

			else:

				latest_video_upload_date = latest_video.created_at.date()

				# compare latest_video_upload_date with current date : check for race condition
				if (current_date > latest_video_upload_date):
					user.can_upload = True
					user.save()
					logger.info("Set can_upload_flag for %s : %s" %(user.username, user.can_upload))

				else:

					logger.info("can_upload flag for user %s : %s " %(user.username, user.can_upload))
