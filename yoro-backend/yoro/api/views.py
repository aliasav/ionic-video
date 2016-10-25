from django.shortcuts import render
from api.models import YoroUser, Video
from api.serializers import UserSerializer
from api.utils import clean_string
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import renderers
from django.http import Http404
from django.views.decorators.csrf import csrf_exempt
from yoro.settings import MEDIA_ROOT
from django.views.decorators.clickjacking import xframe_options_exempt

from django.core.exceptions import ObjectDoesNotExist

import logging

logger = logging.getLogger(__name__)

"""
Creates user if username/passkey pair is unique
"""
@api_view(['POST'])
@csrf_exempt
def create_user(request):

	resp_data = {}

	if not ("username" in request.data and "passkey" in request.data):

		resp_data["resp"] = "Missing/invalid data in request"
		logger.error("Missing/invalid data in create_user")

		return Response(data=resp_data, status=status.HTTP_400_BAD_REQUEST)

	else:

		# check uniqueness of username/passkey pair
		try:

			username = clean_string(request.data["username"])
			passkey = str(request.data["passkey"])
			(user, created) = YoroUser.objects.get_or_create(username=username, passkey=passkey)
			logger.info("Username/passkey pair exists : " + str(created))

			if created:

				# check for user id
				if ("user_id" in request.data and request.data["user_id"]):
					user.user_id = request.data["user_id"]
					user.is_identified = True
					user.save()
					logger.info("User ID set for user : %s/%s" %(user.username, user.user_id))


				logger.info("User created successfully.")
				logger.debug(user)
				resp_data["resp"] = "User created successfully."
				resp_data["user_data"] = {
					"username" : username,
					"passkey" : passkey,
					"guid" : user.guid,
					"created_at" : user.created_at,
					"user_id" : user.user_id,
					"is_identified" : user.is_identified,
				}

				logger.info("User created : \n%s" %resp_data)

				return Response(data=resp_data, status=status.HTTP_201_CREATED)

			else:

				logger.debug("Username/passkey pair already exists: " + username + "/" + passkey)
				resp_data["resp"] = "Username/passkey pair already exists: " + username + "/" + passkey

				return Response(data=resp_data, status=status.HTTP_409_CONFLICT)

		except:

			logger.debug("Error in user creation")
			resp_data["resp"] = "Error in user creation"

			return Response(data=resp_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login(request):

	resp_data = {}

	if ('username' in request.data and "passkey" in request.data):

		username = clean_string(request.data['username'])
		passkey = str(request.data["passkey"])
		logger.debug('User signin request : %s' %username)

		try:

			user = YoroUser.objects.get(username=username, passkey=passkey)

		except ObjectDoesNotExist, e:

			logger.info('Username %s does not exist' %username)
			return Response(status=status.HTTP_403_FORBIDDEN)

		else:

			# check for user_id
			if ("user_id" in request.data and request.data["user_id"]):
				user.user_id = request.data["user_id"]
				user.is_identified = True
				user.save()
				logger.info("User ID set for user : %s/%s" %(user.username, user.user_id))

			resp_data = {
				"resp" : "User logged in.",
				"user_data" : {
					"username" : user.username,
					"passkey" : user.passkey,
					"guid" : user.guid,
					"created_at" : user.created_at,
					"user_id" : user.user_id,
					"is_identified" : user.is_identified,
				},
			}
			logger.debug('User logged in : \n%s' %resp_data)
			return Response(data=resp_data, status=status.HTTP_200_OK)

	else:

		resp_data["resp"] = "Missing/invalid data"

		return Response(data=resp_data, status=status.HTTP_405_METHOD_NOT_ALLOWED)


"""
Upload file to server
"""
@api_view(['POST'])
def upload_video(request):

	resp_data = {
		"video_data" : {},
		"resp" : {},
		"can_upload" : False,
	}

	logger.debug(request.POST)

	# check for data
	if not ("username" in request.POST and "passkey" in request.POST and "date" in request.POST and "guid" in request.POST and "local_path_1" in request.POST and "local_path_2" in request.POST):

		logger.warning("Missing/invalid data in request")
		resp_data["resp"] = "Missing/invalid data in request"

		return Response(data=resp_data, status=status.HTTP_400_BAD_REQUEST)

	# extract username, passkey, date
	try:
		user_data = {
			"username" : request.POST.get("username"),
			"passkey" : request.POST.get("passkey"),
			"guid" : request.POST.get("guid"),
			"date" : request.POST.get("date"),
			"local_path" : request.POST.get("local_path_1", None),
			"local_path_2" : request.POST.get("local_path_2", None),
 		}
		logger.debug("File upload information: \n%s " %user_data)

	except:

		logger.warning("Missing/invalid data in request")
		resp_data["resp"] = "Missing/invalid data in request"

		return Response(data=resp_data, status=status.HTTP_400_BAD_REQUEST)

	else:

		logger.debug("File : " + str(request.FILES['yoro_vid'].name))

		# get user
		try:
			user = YoroUser.objects.get(username=user_data["username"], passkey=user_data["passkey"], guid=user_data["guid"])

		except:

			logger.error("User not found: " + str(user_data["username"]) + "/" + str(user_data["passkey"]) + "/" + str(user_data["guid"]))
			return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		else:
			# create video
			v = Video.objects.create(user=user, video=request.FILES['yoro_vid'], local_path=user_data["local_path"], local_path_2=user_data["local_path_2"])
			logger.info("File uploaded by user : " + user_data["username"])

			# unset can_upload flag for user
			user.can_upload = False
			user.save()

			# create video_data data structure to be sent in resp_data.video_data
			d = {}; key = str(v.guid)
			d = {
				"created_at" : v.created_at,
				"video_url" : v.video.url,
				"local_path" : v.local_path,
			}

			# set resp_data to be sent as response data
			resp_data = {
				"resp" : "Video uploaded successfully, can_upload flag unset",
				"can_upload" : user.can_upload,
				"video_data" : {},
			}
			resp_data["video_data"][key] = d

			logger.debug(v)
			logger.debug(resp_data)

		return Response(data=resp_data, status=status.HTTP_200_OK)

"""
Get upload history
"""
@api_view(["POST"])
@xframe_options_exempt
def get_user_history(request):

	resp_data = {
		"resp" : "",
		"videos" : {},
		"videos_number" : 0,
	}

	# check for username/passkey in request
	if not("username" in request.data and "passkey" in request.data):

		resp_data["resp"] = "Missing/invalid data in request"
		logger.warning("Missing/invalid data in get_user_history request")

		return Response(data=resp_data, status=status.HTTP_400_BAD_REQUEST)

	else :
		# get username and passkey
		username = request.data["username"]
		passkey = request.data["passkey"]

		# get user
		try:
			user = YoroUser.objects.get(username=username, passkey=passkey)

		except:

			logger.error("Error in getting user: %s" %username)
			resp_data["resp"] = "Error in getting user"

			return Response(data=resp_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		else :

			# get user videos
			videos = Video.objects.filter(user=user).order_by("-created_at")
			videos_number = len(videos)

			# resp_data["videos"] must be a dict of dicts, indexed by guids of videos
			resp_data["resp"] = "Video history for " + str(user.username) + " obtained successfully."
			resp_data["videos"] = {}
			resp_data["videos_number"] = videos_number
			d = {}
			for v in videos:
				key = str(v.guid)
				d = {
					"created_at" : v.created_at,
					"video_url" : v.video.url,
					"local_path" : v.local_path,
					"local_path_2" : v.local_path_2,
				}
				resp_data["videos"][key] = d

			logger.info("User videos-->")
			logger.info(resp_data)

			return Response(data=resp_data, status=status.HTTP_200_OK)


"""
Get can_upload flag
"""
@api_view(["POST"])
def get_can_upload_flag(request):

	resp_data = {}

	# check for POST data
	if not ("username" in request.data and "passkey" in request.data and "guid" in request.data):

		logger.warning("get_can_upload_flag called with invalid data")
		resp_data["resp"] = "Invalid/Missing data"

		return Response(data=resp_data, status=status.HTTP_400_BAD_REQUEST)

	else:

		# get user
		try:
			user_data = {
				"username" : request.data["username"],
				"passkey" : request.data["passkey"],
				"guid" : request.data["guid"],
			}
			user = YoroUser.objects.get(username=user_data["username"], passkey=user_data["passkey"], guid=user_data["guid"])

		except:

			logger.error("Error in getting user: \n%s" %user_data)
			resp_data["resp"] = "Error in getitng user"

			return Response(data=resp_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		else:

			can_upload = user.can_upload
			resp_data["can_upload"] = can_upload
			logger.info("can_upload for %s : %s" %(user_data["username"], can_upload))

			return Response(data=resp_data, status=status.HTTP_200_OK)
