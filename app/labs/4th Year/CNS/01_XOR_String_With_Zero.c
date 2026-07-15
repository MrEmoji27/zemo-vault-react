#include <stdio.h>
#include <string.h>

int main(void) {
    char str[] = "Hello World";

    for (size_t i = 0; i < strlen(str); i++) {
        putchar(str[i] ^ 0);
    }
    putchar('\n');
    return 0;
}
