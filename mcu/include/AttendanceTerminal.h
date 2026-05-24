#ifndef ATTENDANCE_TERMINAL_H
#define ATTENDANCE_TERMINAL_H

#include <Arduino.h>
#include <Keypad.h>
#include <LiquidCrystal.h>
#include <MFRC522.h>
#include "Buzzer.h"
#include "Clock.h"

enum SystemState {
  WAITING_FOR_KEY,
  WAITING_FOR_CARD,
  WAITING_FOR_RESPONSE,
  SHOWING_RESULT
};

enum Language { 
  LANG_EN, 
  LANG_CZ, 
  LANG_COUNT 
};

enum StringID {
  STR_ATTENDANCE_SYS,
  STR_STARTING,
  STR_SYNCING_TIME,
  STR_IDLE_HINT,
  STR_ARRIVAL_DISP,
  STR_DEPARTURE_DISP,
  STR_BACK_HINT,
  STR_WELCOME,
  STR_GOODBYE,
  STR_TIMEOUT,
  STR_DENIED,
  STR_SERVER_ERROR,
  STR_REC,
  STR_IN_AT,
  STR_OUT_AT,
  STR_COUNT
};

class AttendanceTerminal {
public:
    // Memory Constraints
    static const int MAX_NAME_LEN = 32;
    static const int MAX_EVENT_TYPE_LEN = 16;
    static const int MAX_SRV_STATUS_LEN = 4;
    static const int RX_BUF_SIZE = 128;
    static const int JSON_BUF_SIZE = 128;
    static const int UID_BUF_SIZE = 16;

    AttendanceTerminal(LiquidCrystal& lcd, Keypad& keypad, MFRC522& rfid, Buzzer& buzzer, Clock& sysClock);
    
    void begin();    // Handles blocking startup sync and EEPROM load
    void update();   // Main non-blocking update loop

private:
    LiquidCrystal& _lcd;
    Keypad& _keypad;
    MFRC522& _rfid;
    Buzzer& _buzzer;
    Clock& _sysClock;

    SystemState _currentState;
    Language _currentLang;
    char _currentEventType[MAX_EVENT_TYPE_LEN]; 
    char _serverStatus[MAX_SRV_STATUS_LEN]; 
    unsigned long _stateTimer;

    char _dispFirstName[MAX_NAME_LEN];
    char _dispLastName[MAX_NAME_LEN];
    bool _phaseTwoTriggered;

    // Serial parsing buffer
    char _rxBuf[RX_BUF_SIZE];
    int _rxIdx;

    // Internal Helpers
    const __FlashStringHelper* getString(StringID id);
    void handleSerialData();
    void handleInput(char key);
    void handleStateTimeouts(unsigned long elapsed);
    void handleScan();
    void resetToInitialState();
    void refreshTimeDisplay();
};

#endif
