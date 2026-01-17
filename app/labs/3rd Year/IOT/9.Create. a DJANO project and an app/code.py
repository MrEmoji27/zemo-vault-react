#installation
  pip install Django
  #create virtual environment
  python -m venv myenv
  source myenv/bin/activate
  #create a Django Project
   django-admin startproject myproject
   cd myproject 
  #create a Django App 
   python manage.py startapp myapp 
  #Register the App 
   Open myproject/settings.py and add 'myapp' to the INSTALLED_APPS list:
  #Create a Simple View 
    Open myapp/views.py and add:
   from django.http import HttpResponse
   def home(request):
   return HttpResponse("Hello, welcome to my Django app!") 
  #Configure URL 
   Open myproject/urls.py and include the app's URL:
   from django.contrib import admin 
   from django.urls import path
   from myapp.views import home
   urlpatterns = [
   path('admin/', admin.site.urls),
   path('', home),
  ]
  #Run the server
  python manage.py runserver
 Access the application at http://127.0.0.1:8000/ 
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
      #. Create the Serializer
       Define a serializer in serializers.py:
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
 python manage.py makemigrations
 python manage.py migrate
#Test API Endpoints
 python manage.py runserver
#: Install Django
   pip install django 
#Create a Django Project
  django-admin startproject myproject 
#Create a Django App
cd myproject 
#Configure the App
Open myproject/settings.py
Add 'myapp' to the INSTALLED_APPS list:
INSTALLED_APPS = [
 'django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'myapp',
]
#Create a Templates Folder
named myapp:
 <!DOCTYPE html>
<html>
<head>
 <title>Welcome to Django</title>
</head>
<body>
 <h1>Hello, Django Template!</h1>
</body>
</html>
#Create a View In myapp/views.py 
 from django.shortcuts import render
def index(request):
 return render(request, 'myapp/index.html')
#Configure URL In myapp/urls.py
from django.urls import path
from .views import index
urlpatterns = [
 path('', index, name='index'),
]
Link this to the project's urls.py:
from django.contrib import admin
from django.urls import path, include
urlpatterns = [  path('admin/', admin.site.urls),
 path('', include('myapp.urls')),
]
#Run the Server
 python manage.py makemigrations
 python manage.py migrate
 python manage.py runserver 
  # Install MySQL and Required Packages
   sudo apt install mysql-server
   pip install mysqlclient
 # Create a MySQL Database
 mysql -u root -p
CREATE DATABASE mydb;
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
#Configure Django to Use MySQL settings.py file
  DATABASES = {
 'default': {
 'ENGINE': 'django.db.backends.mysql',
 'NAME': 'mydb',
 'USER': 'myuser',
 'PASSWORD': 'password',
 'HOST': 'localhost',
 'PORT': '3306',
 }
}
#Install Django and Initialize Project
pip install django
django-admin startproject myproject
cd myproject
python manage.py makemigrations
python manage.py migrate
#Test the Connection
python manage.py createsuperuser
python manage.py runserver
 http://127.0.0.1:8000/admin