%{
#include <stdio.h>
#include <stdlib.h>
int COMMENT = 0;
%}

identifier [a-zA-Z][a-zA-Z0-9]*

%%
#.*                                                   { printf("%s is a preprocessor directive\n", yytext); }
"/*"                                                  { COMMENT = 1; printf("%s is a comment\n", yytext); }
int|float|char|double|while|for|struct|typedef|do|if|break|continue|void|switch|return|else|goto
                                                       { if (!COMMENT) printf("%s is a keyword\n", yytext); }
{identifier}\(                                        { if (!COMMENT) printf("FUNCTION %s\n", yytext); }
"{"|\{                                               { if (!COMMENT) printf("%s BLOCK BEGINS\n", yytext); }
"}"|\}                                               { if (!COMMENT) printf("%s BLOCK ENDS\n", yytext); }
{identifier}(\[[0-9]*\])?                             { if (!COMMENT) printf("%s IDENTIFIER\n", yytext); }
"*/"                                                  { COMMENT = 0; printf("%s is a comment terminator\n", yytext); }
[0-9]+                                                 { if (!COMMENT) printf("%s is a NUMBER\n", yytext); }
=                                                     { if (!COMMENT) printf("%s is an ASSIGNMENT OPERATOR\n", yytext); }
"<="|"!="|">="|"<"|"=="|">"                    { if (!COMMENT) printf("%s is a RELATIONAL OPERATOR\n", yytext); }
[;:,.@$%]                                              { if (!COMMENT) printf("%s is a SPECIAL OPERATOR\n", yytext); }
[ \t\n]+                                              ;
.                                                     { if (!COMMENT) printf("%s\n", yytext); }
%%

int main(void) {
    FILE *file = fopen("var.c", "r");
    if (!file) {
        perror("Could not open var.c");
        return 1;
    }
    yyin = file;
    yylex();
    fclose(file);
    return 0;
}

int yywrap(void) {
    return 1;
}
