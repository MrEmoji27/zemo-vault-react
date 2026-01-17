import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
# Pin configuration using BOARD mode
LED_PIN = 26 # Pin number 26 (GPIO 7)
SWITCH_PIN = 23 # Pin number 23 (GPIO 11)
# Setup GPIO mode
GPIO.setmode(GPIO.BOARD)
# Setup LED pin as output
GPIO.setup(LED_PIN, GPIO.OUT)
# Setup switch pin as input with a pull-up resistor
GPIO.setup(SWITCH_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
print("Press the button to turn ON the LED. Press Ctrl+C to exit.")
try:
 while True:
 # Read the switch state (LOW when pressed, HIGH otherwise)
 switch_state = GPIO.input(SWITCH_PIN)
 if switch_state == GPIO.LOW:
 GPIO.output(LED_PIN, GPIO.HIGH) # Turn ON LED
 else:
 GPIO.output(LED_PIN, GPIO.LOW) # Turn OFF LED
 # Small delay for switch debounce
  time.sleep(0.1)
except KeyboardInterrupt:
 print("\nExiting program.")
finally:
 # Cleanup GPIO settings
 GPIO.cleanup()
 print("GPIO cleaned up.")