#include <Arduino.h>
#include <SPI.h>
#include "AttendanceTerminal.h"

// Hardware Configuration
const byte rowPins[4] = {47, 46, 45, 44};
const byte colPins[4] = {43, 42, 41, 40};
char hexaKeys[4][4] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}};

Keypad keypad = Keypad(makeKeymap(hexaKeys), (byte*)rowPins, (byte*)colPins, 4, 4);
LiquidCrystal lcd(7, 6, 5, 4, 3, 2);
MFRC522 rfid(53, 49);
Buzzer buzzer(11);

Clock sysClock;

// The Terminal Engine
AttendanceTerminal terminal(lcd, keypad, rfid, buzzer, sysClock);

void setup()
{
  Serial.begin(115200);   // USB Debug
  Serial1.begin(115200);  // Raspberry Pi link
  Serial1.setTimeout(50); 
  
  // Basic Hardware Init
  SPI.begin();
  
  // Start the Terminal Engine (Handshake + Sync)
  terminal.begin();
}

void loop()
{
  terminal.update();
}
