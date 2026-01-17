#include "DHT.h"
DHT dht(19,DHT11);
void setup()
{
Serial.begin(9600);
dht.begin();
}
void loop()
{
float hum = dht.readHumidity();
float temp = dht.readTemperature();
float tempF = temp * 9 / 5 + 32;
Serial.print("Humidity= ");
Serial.print(hum );
Serial.print("% \n");
Serial.print("Temperature in C=");
Serial.print(temp);
Serial.print("%*c ");
Serial.print("Temperature in F=");
Serial.print(tempF);
Serial.print("%*f ");
delay(500);
}