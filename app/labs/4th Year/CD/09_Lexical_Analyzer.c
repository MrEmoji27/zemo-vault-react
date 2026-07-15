#include <ctype.h>
#include <stdio.h>
#include <string.h>

static void classify_word(const char *word) {
    const char *keywords[] = {
        "for", "while", "do", "int", "float", "char",
        "double", "static", "switch", "case"
    };
    size_t keyword_count = sizeof(keywords) / sizeof(keywords[0]);

    for (size_t i = 0; i < keyword_count; i++) {
        if (strcmp(keywords[i], word) == 0) {
            printf("%s is a keyword\n", word);
            return;
        }
    }
    printf("%s is an identifier\n", word);
}

int main(void) {
    char input[4096];
    int numbers[100];
    int number_count = 0;
    int line_count = 1;

    printf("Enter the C program (press Ctrl+D to finish):\n");
    size_t length = fread(input, 1, sizeof(input) - 1, stdin);
    input[length] = '\0';

    for (size_t i = 0; i < length;) {
        if (isdigit((unsigned char) input[i])) {
            int value = 0;
            while (i < length && isdigit((unsigned char) input[i])) {
                value = value * 10 + input[i++] - '0';
            }
            if (number_count < 100) numbers[number_count++] = value;
        } else if (isalpha((unsigned char) input[i]) || input[i] == '_') {
            char word[100];
            size_t word_length = 0;
            while (i < length && (isalnum((unsigned char) input[i]) || input[i] == '_')) {
                if (word_length < sizeof(word) - 1) word[word_length++] = input[i];
                i++;
            }
            word[word_length] = '\0';
            classify_word(word);
        } else {
            if (input[i] == '\n') line_count++;
            if (!isspace((unsigned char) input[i])) printf("%c", input[i]);
            i++;
        }
    }

    printf("\nNumbers: ");
    for (int i = 0; i < number_count; i++) printf("%d ", numbers[i]);
    printf("\nTotal number of lines: %d\n", line_count);
    return 0;
}
