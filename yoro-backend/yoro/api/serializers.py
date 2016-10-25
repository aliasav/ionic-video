from django.forms import widgets
from rest_framework import serializers
from api.models import YoroUser

class UserSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = YoroUser
		fields = ('guid', 'username', 'created_at')


