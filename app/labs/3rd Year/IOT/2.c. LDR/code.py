import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
# Define the GPIO pin connected to the LDR
 ldr_pin = 12 # GPIO 12
# Set the pin as input
GPIO.setup(ldr_pin,GPIO.IN)
try:
 while True:
 light_level = GPIO.input(ldr_pin)
 if(light_level)==1:
 print("Dark:Light level high(1)")
 else:
 print("bright:Light level low(0)")
 time.sleep(1)
except KeyboardInterrupt:
 print("exiting")
finally:
 GPIO.cleanup()