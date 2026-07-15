%{
#include <stdio.h>
%}

%%
[a-zA-Z][a-zA-Z0-9]*       { printf("%s is Identifier\n", yytext); }
[0-9]+                     { printf("%s is Constant\n", yytext); }
">"|"<"|">="|"<="|"=="|"!="
                            { printf("%s is Relational operator\n", yytext); }
"+"|"-"|"*"|"/"|"%"        { printf("%s is Arithmetic operator\n", yytext); }
"/*".*"*/"                 { printf("%s is Comment\n", yytext); }
[ \t\n]+                  ;
.                           { printf("%s is a special character\n", yytext); }
%%

int main(void) {
    yylex();
    return 0;
}

int yywrap(void) {
    return 1;
}
