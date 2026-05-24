#include "AttendanceTerminal.h"
#include <string.h>
#include <stdio.h>
#include <avr/pgmspace.h>
#include <EEPROM.h>

// --- PERSISTENCE ---
const int EEPROM_ADDR_LANG = 0;

// --- PROGMEM TRANSLATIONS ---
const char str_att_sys_en[] PROGMEM = "Attendance Sys";
const char str_att_sys_cz[] PROGMEM = "Dochazkovy Sys";

const char str_starting_en[] PROGMEM = "Starting...";
const char str_starting_cz[] PROGMEM = "Spousteni...";

const char str_sync_time_en[] PROGMEM = "Syncing Time...";
const char str_sync_time_cz[] PROGMEM = "Synchr. casu...";

const char str_idle_hint_en[] PROGMEM = "A=In, D=Out";
const char str_idle_hint_cz[] PROGMEM = "A=Prich, D=Odch";

const char str_arrival_en[] PROGMEM = "ARRIVAL";
const char str_arrival_cz[] PROGMEM = "PRICHOD";

const char str_departure_en[] PROGMEM = "DEPARTURE";
const char str_departure_cz[] PROGMEM = "ODCHOD";

const char str_back_en[] PROGMEM = "*BACK";
const char str_back_cz[] PROGMEM = "*ZPET";

const char str_welcome_en[] PROGMEM = "Welcome";
const char str_welcome_cz[] PROGMEM = "Vitejte";

const char str_goodbye_en[] PROGMEM = "Goodbye";
const char str_goodbye_cz[] PROGMEM = "Na shledanou";

const char str_timeout_en[] PROGMEM = "TIMEOUT ERROR";
const char str_timeout_cz[] PROGMEM = "VYPRSEL CAS";

const char str_denied_en[] PROGMEM = "DENIED";
const char str_denied_cz[] PROGMEM = "ZAMITNUTO";

const char str_server_err_en[] PROGMEM = "SERVER ERROR";
const char str_server_err_cz[] PROGMEM = "CHYBA SERVERU";

const char str_rec_en[] PROGMEM = "REC: ";
const char str_rec_cz[] PROGMEM = "KARTA:";

const char str_in_at_en[] PROGMEM = "IN  at ";
const char str_in_at_cz[] PROGMEM = "Prichod ";

const char str_out_at_en[] PROGMEM = "OUT at ";
const char str_out_at_cz[] PROGMEM = "Odchod  ";

// Translation Arrays
const char* const lang_en[] PROGMEM = {
    str_att_sys_en, str_starting_en, str_sync_time_en, str_idle_hint_en,
    str_arrival_en, str_departure_en, str_back_en, str_welcome_en,
    str_goodbye_en, str_timeout_en, str_denied_en, str_server_err_en,
    str_rec_en, str_in_at_en, str_out_at_en
};

const char* const lang_cz[] PROGMEM = {
    str_att_sys_cz, str_starting_cz, str_sync_time_cz, str_idle_hint_cz,
    str_arrival_cz, str_departure_cz, str_back_cz, str_welcome_cz,
    str_goodbye_cz, str_timeout_cz, str_denied_cz, str_server_err_cz,
    str_rec_cz, str_in_at_cz, str_out_at_cz
};

const char* const* const languages[] PROGMEM = { lang_en, lang_cz };

// Timing Constants
const unsigned long RESULT_DURATION = 2500;
const unsigned long PHASE_SWITCH_TIME = 1500;
const unsigned long CARD_WAIT_TIMEOUT = 20000; 
const unsigned long RESPONSE_TIMEOUT = 10000;  

AttendanceTerminal::AttendanceTerminal(LiquidCrystal& lcd, Keypad& keypad, MFRC522& rfid, Buzzer& buzzer, Clock& sysClock)
    : _lcd(lcd), _keypad(keypad), _rfid(rfid), _buzzer(buzzer), _sysClock(sysClock), 
      _currentState(WAITING_FOR_KEY), _currentLang(LANG_EN), _stateTimer(0), _phaseTwoTriggered(false), _rxIdx(0) 
{
    _currentEventType[0] = '\0';
    strcpy(_serverStatus, "ON");
    _dispFirstName[0] = '\0';
    _dispLastName[0] = '\0';
}

const __FlashStringHelper* AttendanceTerminal::getString(StringID id) {
    const char* const* const langPtr = (const char* const* const)pgm_read_word(&(languages[_currentLang]));
    const char* strPtr = (const char*)pgm_read_word(&(langPtr[id]));
    return (const __FlashStringHelper*)strPtr;
}

void AttendanceTerminal::begin() {
    // Load Language from EEPROM (Run during setup for hardware stability)
    byte savedLang = EEPROM.read(EEPROM_ADDR_LANG);
    if (savedLang < LANG_COUNT) {
        _currentLang = (Language)savedLang;
    } else {
        _currentLang = LANG_EN;
    }

    _lcd.begin(16, 2);
    _lcd.print(getString(STR_ATTENDANCE_SYS));
    _lcd.setCursor(0, 1);
    _lcd.print(getString(STR_STARTING));

    _rfid.PCD_Init();
    _buzzer.begin();
    _buzzer.playStartup();

    // Blocking Startup Sync
    bool timeSynced = false;
    unsigned long lastAttempt = 0;
    _lcd.clear();
    _lcd.print(getString(STR_SYNCING_TIME));

    while (!timeSynced) {
        _buzzer.update(); 
        if (millis() - lastAttempt > 1000) {
            Serial1.println(F("{\"type\":\"system\",\"status\":\"READY\"}"));
            lastAttempt = millis();
        }
        if (Serial1.available()) {
            char c = Serial1.read();
            if (c == '\n') {
                _rxBuf[_rxIdx] = '\0';
                if (strncmp(_rxBuf, "TIME|", 5) == 0) {
                    char* p1 = strchr(_rxBuf, '|');
                    char* p2 = strchr(p1 + 1, '|');
                    if (p1 && p2) {
                        *p2 = '\0';
                        _sysClock.sync(p1 + 1);
                        strncpy(_serverStatus, p2 + 1, sizeof(_serverStatus)-1);
                        timeSynced = true;
                    }
                }
                _rxIdx = 0;
            } else if (_rxIdx < (int)sizeof(_rxBuf) - 1) {
                _rxBuf[_rxIdx++] = c;
            }
        }
        delay(1);
    }

    _buzzer.playConfirm();
    resetToInitialState();
}

void AttendanceTerminal::update() {
    _buzzer.update();

    if (_sysClock.tick()) {
        if (_currentState != SHOWING_RESULT && _currentState != WAITING_FOR_RESPONSE) {
            refreshTimeDisplay();
        }
    }

    unsigned long elapsed = millis() - _stateTimer;
    char key = _keypad.getKey();

    // Handle * (Back/Reset)
    if (key == '*' && (_currentState == WAITING_FOR_CARD || _currentState == SHOWING_RESULT)) {
        resetToInitialState();
        _buzzer.playKeyTone('*');
        return;
    }

    // Logic Sub-Modules
    handleStateTimeouts(elapsed);
    handleInput(key);
    handleSerialData();
}

void AttendanceTerminal::handleStateTimeouts(unsigned long elapsed) {
    if (_currentState == SHOWING_RESULT) {
        if (elapsed >= RESULT_DURATION) {
            resetToInitialState();
        } 
        else if (elapsed >= PHASE_SWITCH_TIME && !_phaseTwoTriggered) {
            _phaseTwoTriggered = true;
            _lcd.setCursor(0, 0);
            _lcd.print(F("                "));
            _lcd.setCursor(0, 0);
            
            if (strcasecmp(_currentEventType, "ARRIVAL") == 0) {
                _lcd.print(getString(STR_WELCOME));
            } else if (strcasecmp(_currentEventType, "DEPARTURE") == 0) {
                _lcd.print(getString(STR_GOODBYE));
            } else {
                // Fallback for unknowns (e.g. accidental AUTO passthrough)
                _lcd.print(getString(STR_WELCOME));
            }
        }
    }
    else if (_currentState == WAITING_FOR_CARD) {
        if (elapsed >= CARD_WAIT_TIMEOUT) {
            resetToInitialState();
        }
    }
    else if (_currentState == WAITING_FOR_RESPONSE) {
        if (elapsed >= RESPONSE_TIMEOUT) {
            _lcd.setCursor(0, 1);
            _lcd.print(F("                "));
            _lcd.setCursor(0, 1);
            _lcd.print(getString(STR_TIMEOUT));
            _buzzer.playError();
            _stateTimer = millis();
            _currentState = SHOWING_RESULT;
        }
    }
}

void AttendanceTerminal::handleInput(char key) {
    if (_currentState == WAITING_FOR_KEY) {
        // Toggle Language
        if (key == '#') {
            _currentLang = (Language)((_currentLang + 1) % LANG_COUNT);
            EEPROM.update(EEPROM_ADDR_LANG, (byte)_currentLang); // Persistent save
            _buzzer.playKeyTone('#');
            resetToInitialState();
            return;
        }

        if (key == 'A' || key == 'D') {
            strncpy(_currentEventType, (key == 'A') ? "ARRIVAL" : "DEPARTURE", sizeof(_currentEventType)-1);
            _currentState = WAITING_FOR_CARD;
            _stateTimer = millis(); 
            _lcd.setCursor(0, 1);
            _lcd.print(F("                "));
            _lcd.setCursor(0, 1);
            _lcd.print((key == 'A') ? getString(STR_ARRIVAL_DISP) : getString(STR_DEPARTURE_DISP));
            _lcd.setCursor(11, 1);
            _lcd.print(getString(STR_BACK_HINT));
            _buzzer.playKeyTone(key);
        } 
        else if (strcmp(_serverStatus, "ON") == 0 && _rfid.PICC_IsNewCardPresent() && _rfid.PICC_ReadCardSerial()) {
            strncpy(_currentEventType, "AUTO", sizeof(_currentEventType)-1);
            handleScan();
        }
    } 
    else if (_currentState == WAITING_FOR_CARD) {
        if (key == 'A' || key == 'D') { // Mode Switch
            strncpy(_currentEventType, (key == 'A') ? "ARRIVAL" : "DEPARTURE", sizeof(_currentEventType)-1);
            _stateTimer = millis();
            _lcd.setCursor(0, 1);
            _lcd.print(F("                "));
            _lcd.setCursor(0, 1);
            _lcd.print((key == 'A') ? getString(STR_ARRIVAL_DISP) : getString(STR_DEPARTURE_DISP));
            _lcd.setCursor(11, 1);
            _lcd.print(getString(STR_BACK_HINT));
            _buzzer.playKeyTone(key);
        }
        else if (_rfid.PICC_IsNewCardPresent() && _rfid.PICC_ReadCardSerial()) {
            handleScan();
        }
    }
}

void AttendanceTerminal::handleSerialData() {
    while (Serial1.available()) {
        char c = Serial1.read();
        if (c == '\n' || c == '\r') {
            if (_rxIdx == 0) continue;
            _rxBuf[_rxIdx] = '\0';
            _rxIdx = 0; 

            Serial.print(F("Pi -> MCU: ")); Serial.println(_rxBuf);

            if (strncmp(_rxBuf, "TIME|", 5) == 0) {
                char* p1 = strchr(_rxBuf, '|');
                char* p2 = strchr(p1 + 1, '|');
                if (p1 && p2) {
                    *p2 = '\0';
                    _sysClock.sync(p1 + 1);
                    strncpy(_serverStatus, p2 + 1, sizeof(_serverStatus)-1);
                    if (_currentState == WAITING_FOR_KEY) refreshTimeDisplay();
                }
            } 
            else if (strncmp(_rxBuf, "OK|", 3) == 0) {
                char* p1 = strchr(_rxBuf, '|');
                char* p2 = strchr(p1 + 1, '|');
                char* p3 = strchr(p2 + 1, '|');
                char* p4 = strchr(p3 + 1, '|');
                
                if (p1 && p2 && p3 && p4) {
                    *p2 = '\0'; *p3 = '\0'; *p4 = '\0';
                    strncpy(_currentEventType, p1 + 1, sizeof(_currentEventType)-1);
                    strncpy(_dispFirstName, p2 + 1, sizeof(_dispFirstName)-1);
                    strncpy(_dispLastName, p3 + 1, sizeof(_dispLastName)-1);
                    char* timeStr = p4 + 1;
                    
                    strcpy(_serverStatus, "ON");
                    _currentState = SHOWING_RESULT;
                    _stateTimer = millis();
                    _phaseTwoTriggered = false;
                    
                    _lcd.clear();
                    _lcd.print(_dispLastName);
                    if (strlen(_dispLastName) > 0) _lcd.print(" ");
                    _lcd.print(_dispFirstName);
                    
                    _lcd.setCursor(0, 1);
                    if (strcasecmp(_currentEventType, "ARRIVAL") == 0) _lcd.print(getString(STR_IN_AT));
                    else _lcd.print(getString(STR_OUT_AT));
                    _lcd.print(timeStr);
                    _buzzer.playSuccess();
                }
            } 
            else if (strncmp(_rxBuf, "LOCAL_OK|", 9) == 0) {
                char* p1 = strchr(_rxBuf, '|');
                char* p2 = strchr(p1 + 1, '|');
                char* p3 = strchr(p2 + 1, '|');
                
                if (p1 && p2 && p3) {
                    *p2 = '\0'; *p3 = '\0';
                    strncpy(_currentEventType, p1 + 1, sizeof(_currentEventType)-1);
                    char* uid = p2 + 1;
                    char* timeStr = p3 + 1;
                    
                    strcpy(_serverStatus, "OFF");
                    _currentState = SHOWING_RESULT;
                    _stateTimer = millis();
                    _phaseTwoTriggered = true; 

                    _lcd.clear();
                    _lcd.print(F("ID: ")); _lcd.print(uid);
                    _lcd.setCursor(0, 1);
                    if (strcasecmp(_currentEventType, "ARRIVAL") == 0) _lcd.print(getString(STR_IN_AT));
                    else _lcd.print(getString(STR_OUT_AT));
                    _lcd.print(timeStr);
                    _buzzer.playSuccess();
                }
            } 
            else if (strcmp(_rxBuf, "DENIED") == 0) {
                strcpy(_serverStatus, "ON");
                _currentState = SHOWING_RESULT;
                _stateTimer = millis();
                _phaseTwoTriggered = true;
                _lcd.setCursor(0, 1);
                _lcd.print(F("                "));
                _lcd.setCursor(0, 1);
                _lcd.print(getString(STR_DENIED));
                _buzzer.playError();
            } 
            else if (strcmp(_rxBuf, "SERVER_ERROR") == 0) {
                strcpy(_serverStatus, "OFF");
                _currentState = SHOWING_RESULT;
                _stateTimer = millis();
                _phaseTwoTriggered = true;
                _lcd.setCursor(0, 1);
                _lcd.print(F("                "));
                _lcd.setCursor(0, 1);
                _lcd.print(getString(STR_SERVER_ERROR));
                _buzzer.playError();
            }
        } else {
            if (_rxIdx < (int)sizeof(_rxBuf) - 1) {
                _rxBuf[_rxIdx++] = c;
            }
        }
    }
}

void AttendanceTerminal::handleScan() {
    char uidStr[UID_BUF_SIZE] = "";
    char* ptr = uidStr;
    for (byte i = 0; i < _rfid.uid.size && i < 7; i++) {
        ptr += sprintf(ptr, "%02X", _rfid.uid.uidByte[i]);
    }

    char json[JSON_BUF_SIZE];
    snprintf(json, sizeof(json), "{\"type\":\"attendance\",\"event\":\"%s\",\"uid\":\"%s\"}", _currentEventType, uidStr);
    
    Serial1.println(json);
    Serial.print(F("MCU -> Pi: ")); Serial.println(json);

    _lcd.setCursor(0, 1);
    _lcd.print(F("                "));
    _lcd.setCursor(0, 1);
    _lcd.print(getString(STR_REC));
    _lcd.print(uidStr);
    
    _currentState = WAITING_FOR_RESPONSE;
    _stateTimer = millis(); 
    
    _buzzer.playConfirm();
    _rfid.PICC_HaltA();
    _rfid.PCD_StopCrypto1();
}

void AttendanceTerminal::resetToInitialState() {
    _currentState = WAITING_FOR_KEY;
    _currentEventType[0] = '\0';
    _dispFirstName[0] = '\0';
    _dispLastName[0] = '\0';
    _phaseTwoTriggered = false;
    _lcd.clear();
    refreshTimeDisplay();
    _lcd.setCursor(0, 1);
    _lcd.print(getString(STR_IDLE_HINT));
    Serial.println(F("Terminal: Idle"));
}

void AttendanceTerminal::refreshTimeDisplay() {
    _lcd.setCursor(0, 0);
    _lcd.print(F("SRV:"));
    _lcd.print(_serverStatus);
    if (strcmp(_serverStatus, "ON") == 0) _lcd.print(F("  ")); 
    else _lcd.print(F(" "));                     
    _lcd.print(_sysClock.getTimeString());
}
