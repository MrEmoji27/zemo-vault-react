%{
#include <stdio.h>
int word_count = 0;
int line_count = 0;
int char_count = 0;
%}

%%
\n          { line_count++; char_count++; }
[ \t]+       { char_count += yyleng; }
[^ \t\n]+   { word_count++; char_count += yyleng; }
%%

int main(void) {
    printf("Enter text (press Ctrl+D to end input):\n");
    yylex();
    printf("\n--- Results ---\n");
    printf("Lines: %d\n", line_count);
    printf("Words: %d\n", word_count);
    printf("Characters: %d\n", char_count);
    return 0;
}

int yywrap(void) {
    return 1;
}
