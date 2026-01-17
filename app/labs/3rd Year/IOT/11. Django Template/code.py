# Install Django
# pip install django 

#Create a Django Project
# django-admin startproject myproject 

#Create a Django App
# cd myproject 

#Configure the App
# Open myproject/settings.py
# Add 'myapp' to the INSTALLED_APPS list:
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
# Inside myapp, create a folder named templates and within it, another folder named myapp:
# Create index.html:
"""
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Django</title>
</head>
<body>
    <h1>Hello, Django Template!</h1>
</body>
</html>
"""

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
# Link this to the project's urls.py:
from django.contrib import admin
from django.urls import path, include
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
]

#Run the Server
# python manage.py makemigrations
# python manage.py migrate
# python manage.py runserver
