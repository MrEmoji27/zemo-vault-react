#include <stdio.h>
#include <ctype.h>

void encrypt(char text[], int key) {
    char ch;
    for (int i = 0; text[i] != '\\0'; ++i) {
        ch = text[i];
        if (isalnum(ch)) {
            if (islower(ch)) {
                ch = (ch - 'a' + key) % 26 + 'a';
            }
            if (isupper(ch)) {
                ch = (ch - 'A' + key) % 26 + 'A';
            }
            if (isdigit(ch)) {
                ch = (ch - '0' + key) % 10 + '0';
            }
        } else {
            printf("Invalid Message\\n");
            return;
        }
        text[i] = ch;
    }
    printf("Encrypted message: %s\\n", text);
}

void decrypt(char text[], int key) {
    char ch;
    for (int i = 0; text[i] != '\\0'; ++i) {
        ch = text[i];
        if (isalnum(ch)) {
            if (islower(ch)) {
                ch = (ch - 'a' - key + 26) % 26 + 'a';
            }
            if (isupper(ch)) {
                ch = (ch - 'A' - key + 26) % 26 + 'A';
            }
            if (isdigit(ch)) {
                ch = (ch - '0' - key + 10) % 10 + '0';
            }
        } else {
            printf("Invalid Message\\n");
            return;
        }
        text[i] = ch;
    }
    printf("Decrypted message: %s\\n", text);
}

int main() {
    char text[500];
    int key = 3;
    
    printf("Enter a message to encrypt/decrypt: ");
    scanf("%s", text);
    
    encrypt(text, key);
    decrypt(text, key);
    
    return 0;
}
