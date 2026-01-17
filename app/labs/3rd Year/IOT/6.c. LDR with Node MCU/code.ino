#define LIGHT_SENSOR_PIN 35 // ESP32 pin GIOP35 (ADC0)
void setup() {
Serial.begin(9600);
}
void loop() {
int analogValue = analogRead(LIGHT_SENSOR_PIN);
Serial.print("Analog Value = ");
Serial.print(analogValue); // the raw analog reading
if (analogValue< 40) {
  Serial.println(" => Dark");
} else if (analogValue>41 && analogValue< 800) {
Serial.println(" => Dim");
} else if (analogValue>801 && analogValue< 2000) {
Serial.println(" => Light");
} else if (analogValue>2001 && analogValue< 3200) {
Serial.println(" => Bright");
} else {
Serial.println(" => Very bright");
}
delay(500);
}