const int ledpin = 12; // LED is connected to digital pin 12
const int ldrpin = A0; // LDR is connected to Analog pin A0
int threshold = 600; // Light intensity threshold
void setup() {
Serial.begin(9600); // Start serial communication
pinMode(ledpin, OUTPUT); // Set LED pin as output
pinMode(ldrpin, INPUT);
}
void loop() {
intldrstatus = analogRead(ldrpin); // Read LDR sensor value
if (ldrstatus<= threshold) {
digitalWrite(ledpin, LOW); // Turn OFF LED (dark conditions)
Serial.print("Turn OFF Led ");
Serial.println(ldrstatus); // Print LDR value to Serial Monitor
} else {
digitalWrite(ledpin, HIGH); // Turn ON LED (bright conditions)
Serial.print("Turn on Led ");
Serial.println(ldrstatus); // Print LDR value to Serial Monitor
 }
}