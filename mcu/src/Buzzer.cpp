#include "Buzzer.h"
#include "pitches.h"

// Define pre-defined melodies
const Note MELODY_SUCCESS[] = { {NOTE_E5, 60}, {NOTE_G5, 60}, {NOTE_C6, 100} };
const Note MELODY_ERROR[]   = { {NOTE_G3, 100}, {NOTE_REST, 30}, {NOTE_G3, 100} };
const Note MELODY_CONFIRM[] = { {NOTE_E5, 50} };
const Note MELODY_STARTUP[] = { {NOTE_C4, 80}, {NOTE_E4, 80}, {NOTE_G4, 80} };

Buzzer::Buzzer(int pin) 
    : _pin{pin}, _currentMelody{nullptr}, _melodyLength{0}, _noteIndex{0}, _noteStart{0}, _isPlaying{false} 
{}

void Buzzer::begin() {
    pinMode(_pin, OUTPUT);
}

void Buzzer::update() {
    if (!_isPlaying) return;

    if (millis() - _noteStart >= (unsigned long)_currentMelody[_noteIndex].duration) {
        _noteIndex++;
        if (_noteIndex >= _melodyLength) {
            _isPlaying = false;
            noTone(_pin);
        } else {
            startNextNote();
        }
    }
}

void Buzzer::startNextNote() {
    int freq = _currentMelody[_noteIndex].frequency;
    if (freq <= 0) { // NOTE_REST or 0
        noTone(_pin);
    } else {
        tone(_pin, freq);
    }
    _noteStart = millis();
}

void Buzzer::playMelody(const Note* melody, int length) {
    _currentMelody = melody;
    _melodyLength = length;
    _noteIndex = 0;
    _isPlaying = true;
    startNextNote();
}

void Buzzer::playTone(int frequency, int duration) {
    static Note singleNote;
    singleNote.frequency = frequency;
    singleNote.duration = duration;
    playMelody(&singleNote, 1);
}

void Buzzer::playSuccess() { playMelody(MELODY_SUCCESS); }
void Buzzer::playError()   { playMelody(MELODY_ERROR); }
void Buzzer::playConfirm() { playMelody(MELODY_CONFIRM); }
void Buzzer::playStartup() { playMelody(MELODY_STARTUP); }

void Buzzer::playKeyTone(char key) {
    int freq = 0;
    switch (key) {
        case '1': freq = NOTE_C4; break;
        case '2': freq = NOTE_D4; break;
        case '3': freq = NOTE_E4; break;
        case 'A': freq = NOTE_F4; break;
        case '4': freq = NOTE_G4; break;
        case '5': freq = NOTE_A4; break;
        case '6': freq = NOTE_B4; break;
        case 'B': freq = NOTE_C5; break;
        case '7': freq = NOTE_D5; break;
        case '8': freq = NOTE_E5; break;
        case '9': freq = NOTE_F5; break;
        case 'C': freq = NOTE_G5; break;
        case '*': freq = NOTE_A5; break;
        case '0': freq = NOTE_B5; break;
        case '#': freq = NOTE_C6; break;
        case 'D': freq = NOTE_D6; break;
    }
    if (freq > 0) playTone(freq, 100);
}
