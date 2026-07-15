// Symbol table implementation
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int count = 0;
    char expression[100];
    char symbol;

    printf("Input the expression ending with $ sign: ");
    while (count < 99 && (symbol = getchar()) != '$') {
        expression[count++] = symbol;
    }
    expression[count] = '\0';

    printf("\nGiven Expression: %s\n", expression);
    printf("\nSymbol\tAddress\tType\n");

    for (int i = 0; i < count; i++) {
        char current = expression[i];
        if (isalpha((unsigned char) current)) {
            printf("%c\t%p\tidentifier\n", current, (void *) &expression[i]);
        } else if (isdigit((unsigned char) current)) {
            printf("%c\t%p\tconstant\n", current, (void *) &expression[i]);
        } else if (current == '+' || current == '-' ||
                   current == '*' || current == '/' || current == '=') {
            printf("%c\t%p\toperator\n", current, (void *) &expression[i]);
        }
    }
    return 0;
}
