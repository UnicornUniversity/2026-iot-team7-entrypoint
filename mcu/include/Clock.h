#ifndef CLOCK_H
#define CLOCK_H

class Clock {
public:
    static const int TIME_BUF_SIZE = 10;
    Clock();
    
    /**
     * Syncs the internal clock with a string in HH:mm:ss format
     */
    void sync(const char* timeStr);
    
    /**
     * Updates the internal counters based on millis().
     * Returns true if a second has passed.
     */
    bool tick();
    /**
     * Returns the current time as a formatted string: HH:mm:ss
     */
    const char* getTimeString();

    private:
    int _h, _m, _s;
    unsigned long _lastTick;
    char _timeBuf[TIME_BUF_SIZE];
};

#endif
