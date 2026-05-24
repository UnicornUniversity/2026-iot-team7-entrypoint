#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

struct Note {
    int frequency;
    int duration;
};

class Buzzer {
public:
    /**
     * Accepts hardware pin
     */
    Buzzer(int pin);

    /**
     * Initializes the pin mode.
     */
    void begin();
    
    /**
     * Updates the buzzer state. Should be called frequently in loop().
     */
    void update();

    /**
     * Plays a single tone. Non-blocking.
     */
    void playTone(int frequency, int duration);

    /**
     * Base method to play a melody.
     */
    void playMelody(const Note* melody, int length);

    /**
     * Template helper to automatically calculate length of fixed-size arrays.
     */
    template<size_t N>
    void playMelody(const Note (&melody)[N]) {
        playMelody(melody, (int)N);
    }

    /**
     * Pre-defined sounds
     */
    void playSuccess();
    void playError();
    void playConfirm();
    void playStartup();
    void playKeyTone(char key);

private:
    int _pin;
    const Note* _currentMelody;
    int _melodyLength;
    int _noteIndex;
    unsigned long _noteStart;
    bool _isPlaying;

    void startNextNote();
};

#endif
