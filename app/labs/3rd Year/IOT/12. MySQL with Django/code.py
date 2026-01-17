# Install MySQL and Required Packages
# sudo apt install mysql-server
# pip install mysqlclient

# Create a MySQL Database
# mysql -u root -p

"""
CREATE DATABASE mydb;
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
"""

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
# pip install django
# django-admin startproject myproject
# cd myproject
# python manage.py makemigrations
# python manage.py migrate

#Test the Connection
# python manage.py createsuperuser
# python manage.py runserver

# Access at: http://127.0.0.1:8000/admin
