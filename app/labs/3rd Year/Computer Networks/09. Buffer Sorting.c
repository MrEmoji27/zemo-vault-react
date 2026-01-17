#include <stdio.h>
#include <string.h>
#include <stdlib.h> 

typedef struct {
    char text[4]; 
    int sequence; 
} Frame;

void printFrames(Frame frames[], int n) {
    for (int i = 0; i < n; i++)
        printf("%s:%d\\t", frames[i].text, frames[i].sequence);
}

void shuffle(Frame frames[], int n) {
    for (int i = 0; i < n; i++) {
        int j = rand() % n; 
        Frame temp = frames[i];
        frames[i] = frames[j];
        frames[j] = temp;
    }
}

void sortFrames(Frame frames[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (frames[j].sequence > frames[j + 1].sequence) {
                Frame temp = frames[j];
                frames[j] = frames[j + 1];
                frames[j + 1] = temp;
            }
        }
    }
}

int main() {
    char sentence[100];
    printf("Enter a sentence: ");
    fgets(sentence, sizeof(sentence), stdin);
    
    sentence[strcspn(sentence, "\\n")] = '\\0';
    
    int len = strlen(sentence);
    int frameLen = (len + 2) / 3;
    Frame frames[frameLen];
    
    for (int i = 0; i < frameLen; i++) {
        strncpy(frames[i].text, sentence + i * 3, 3);
        frames[i].text[3] = '\\0'; 
        frames[i].sequence = i + 1; 
    }
    // Note: The original code in 3rdYear.js was cut off, so I am completing the main logic here reasonably.
    
    printf("\\nOriginal Frames:\\n");
    printFrames(frames, frameLen);
    
    shuffle(frames, frameLen);
    printf("\\n\\nShuffled Frames:\\n");
    printFrames(frames, frameLen);
    
    sortFrames(frames, frameLen);
    printf("\\n\\nSorted Frames:\\n");
    printFrames(frames, frameLen);
    printf("\\n");
    
    return 0;
}
