#include <stdio.h>
#include <string.h>

int main(void) {
    char str[] = "Hello World";
    size_t len = strlen(str);

    printf("AND with 127: ");
    for (size_t i = 0; i < len; i++) putchar(str[i] & 127);

    printf("\nXOR with 127: ");
    for (size_t i = 0; i < len; i++) putchar(str[i] ^ 127);
    putchar('\n');
    return 0;
}
