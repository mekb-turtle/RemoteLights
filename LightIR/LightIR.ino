#include <Arduino.h>
#include <IRremote.hpp>

// Use WRITING when using the project (IR transmitter required)
// Use READING to record what signals are sent from your remote (IR receiver required)
// Currently, this is configured to iDual lights - NEC 0xFE02 - you will need to change the code to match your lights

//#define READING
#define WRITING

const int writePin = 7;
const int readPin = 6;

const int ledTime = 500;

const int writeLightPin = 5;
bool writeLight = false;
unsigned long writeLightLast;

const int readLightPin = 4;
bool readLight = false;
unsigned long readLightLast;

void setup() {
  Serial.begin(9600);

#ifdef WRITING
  pinMode(writeLightPin, OUTPUT);
  IrSender.begin(writePin);
#endif

#ifdef READING
  pinMode(readLightPin, OUTPUT);
  IrReceiver.begin(readPin, ENABLE_LED_FEEDBACK);
#endif
}

size_t i = 0;

void loop() {
  unsigned long current = millis();

#ifdef WRITING
  if (writeLight && current >= writeLightLast) {
    writeLight = false;
    digitalWrite(writeLightPin, LOW);
  }
#endif

#ifdef READING
  if (readLight && current >= readLightLast) {
    readLight = false;
    digitalWrite(readLightPin, LOW);
  }
#endif

#ifdef WRITING
  if (Serial.available() > 1) {
    uint8_t input = Serial.read();
    if (i == 3) {
      writeLight = true;
      digitalWrite(writeLightPin, HIGH);
      writeLightLast = current + ledTime;

      IrSender.sendNEC(0xFE02, input, 10);

      i = 0;
    } else if ((i == 0 && input == 'L') || (i == 1 && input == 'E') || (i == 2 && input == 'D')) {
      ++i;
    } else i = 0;
  }
#endif

#ifdef READING
  if (IrReceiver.decode()) {
    if (IrReceiver.decodedIRData.protocol == NEC) {
      readLight = true;
      digitalWrite(readLightPin, HIGH);
      readLightLast = current + ledTime;

      IrReceiver.printIRSendUsage(&Serial);
      Serial.println();
    }

    IrReceiver.resume();
  }
#endif
}
