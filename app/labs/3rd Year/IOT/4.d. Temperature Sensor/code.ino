#include<DHT.h>
#define DHT11 PIN 4
DHT dht(DHT11PIN, DHT11);
void setup()
{
Serial.begin(9600);
dht.begin();
}
 void loop()
{
delay(2000);
float hum = dht.readHumidity();
float tempC= dht.readTemperature();
float tempF= dht.readTemperature(true);
Serial.print("Humidity: ");
Serial.print(hum);
Serial.print(" %, Temp: ");
Serial.print(tempC);
Serial.println("0C ");
Serial.print(tempF);
Serial.println("0F");
}