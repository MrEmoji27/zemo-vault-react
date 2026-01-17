int buttonPin = 2; // Digital pin where the button is connected.
int ledPin = 13; // Digital pin where the LED is connected.
bool buttonState = false;
void setup() {
pinMode(ledPin, OUTPUT); // LED pin as an output.
pinMode(buttonPin, INPUT); // Button pin as an input.
}
void loop() {
buttonState = digitalRead(buttonPin);
if (buttonState == HIGH){
digitalWrite(ledPin, HIGH); // Turn LED on.
} else {
digitalWrite(ledPin, LOW); // Turn LED off.
}
}