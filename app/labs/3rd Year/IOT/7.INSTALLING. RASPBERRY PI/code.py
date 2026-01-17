a.Installing using Pilmager 
  b.Installation using image file 
  a.Installing GPIO Zero library 
   from gpiozero import LED
from time import sleep
led = LED(17) # BCM mode, GPIO 17 pin
while True:
 led.on()
 print ('LED is ON')
 sleep(2)
 led.off()
 print ('LED is OFF')
 sleep(2)
   import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD) # Using physical pin numbering
GPIO.setup(11,GPIO.OUT)
# Initialize PWM on pin 11 with 100Hz frequency
p = GPIO.PWM(11,100) #11 is pin number and 100 is max range of PWM.
p.start(0)
#Starting point of PWM signal. Start PWM with 0% duty cycle.
# You can select any value between 0 to 100.
while True:
 for x in range (0,101,1): #Increasing brightness of LED from 0 to 100
 p.ChangeDutyCycle(x)
 time.sleep(0.1)
 for x in range (100,0,-1): #fading brightness of LED from 100 to 0
 p.ChangeDutyCycle(x)
 time.sleep(0.1)