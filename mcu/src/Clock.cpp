#include "Clock.h"
#include <ctype.h>
#include <string.h>
#include <Arduino.h>

Clock::Clock() : _h{0}, _m{0}, _s{0}, _lastTick{0} {}

#include <ctype.h>

void Clock::sync(const char* timeStr) {
    // Expected format: HH:mm:ss (length 8)
    // Validate length and digits at specific positions
    if (strlen(timeStr) == 8 && 
        isdigit(timeStr[0]) && isdigit(timeStr[1]) &&
        isdigit(timeStr[3]) && isdigit(timeStr[4]) &&
        isdigit(timeStr[6]) && isdigit(timeStr[7])) {

        _h = (timeStr[0] - '0') * 10 + (timeStr[1] - '0');
        _m = (timeStr[3] - '0') * 10 + (timeStr[4] - '0');
        _s = (timeStr[6] - '0') * 10 + (timeStr[7] - '0');

        // Reset the reference point to align the next tick with the sync event
        _lastTick = millis();
    }
}

bool Clock::tick() {
    bool updated = false;
    // Catch-up logic for elapsed seconds
    while (millis() - _lastTick >= 1000) {
        _lastTick += 1000;
        _s++;
        
        _m += (_s / 60);
        _s %= 60;
        
        _h += (_m / 60);
        _m %= 60;
        
        _h %= 24;
        
        updated = true;
    }
    return updated;
}

const char* Clock::getTimeString() {
    snprintf(_timeBuf, sizeof(_timeBuf), "%02d:%02d:%02d", _h, _m, _s);
    return _timeBuf;
}
