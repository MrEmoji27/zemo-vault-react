#Define the WeatherStation Model
from django.db import models
class WeatherStation(models.Model):
    location = models.CharField(max_length=100)
    temperature = models.FloatField()
    humidity = models.FloatField()
    wind_speed = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.location} - {self.timestamp}"

#Create the Serializer
# Define a serializer in serializers.py:
from rest_framework import serializers
from .models import WeatherStation
class WeatherStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherStation
        fields = '__all__'

#Create the API View
from rest_framework import generics
from .models import WeatherStation
from .serializers import WeatherStationSerializer
class WeatherStationListCreate(generics.ListCreateAPIView):
    queryset = WeatherStation.objects.all()
    serializer_class = WeatherStationSerializer
class WeatherStationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = WeatherStation.objects.all()
    serializer_class = WeatherStationSerializer

#Configure URLs
from django.urls import path
from .views import WeatherStationListCreate, WeatherStationDetail
urlpatterns = [
    path('weather/', WeatherStationListCreate.as_view(), name='weather-list'),
    path('weather/<int:pk>/', WeatherStationDetail.as_view(), name='weatherdetail'),
]

#Add REST Framework to settings.py
INSTALLED_APPS = [
    'rest_framework',
    'your_app_name',
]

#Run Migrations
# python manage.py makemigrations
# python manage.py migrate

#Test API Endpoints
# python manage.py runserver
