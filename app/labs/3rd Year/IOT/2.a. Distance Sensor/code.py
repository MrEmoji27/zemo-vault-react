import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
try:
 GPIO.setmode(GPIO.BOARD)
 PIN_TRIGGER=7
 PIN_ECHO=11
 GPIO.setup(PIN_TRIGGER,GPIO.OUT)
 GPIO.setup(PIN_ECHO,GPIO.IN)
 GPIO.output(PIN_TRIGGER,GPIO.LOW)
 print("waiting for sensor to settle")
 time.sleep(0.1)
 print("calculating distance")
 while True:
 GPIO.output(PIN_TRIGGER,GPIO.HIGH)
 time.sleep(0.1)
 GPIO.output(PIN_TRIGGER,GPIO.LOW)
 while GPIO.input(PIN_ECHO)==0:
 pulse_start_time=time.time()
 while GPIO.input(PIN_ECHO)==1:
 pulse_end_time=time.time()
 pulse_duration=pulse_end_time-pulse_start_time
 distance=(pulse_duration/2) * 17150
 print("Distance:",distance,"cm")
finally:
 GPIO.cleanup()