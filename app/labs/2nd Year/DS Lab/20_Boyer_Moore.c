#include <stdio.h>
#include <string.h>

int max(int a, int b)
{
    if(a > b)
		return a;
    else
		return b;
}
int boyermorre(char p[],char t[])
{
    int bctable[128],i,j,k;
    int n = strlen(t);
    int m = strlen(p);
    for(j=0; j<128; j++)
    {
        bctable[j]=m;
    }
    for(j=0; j<m; j++)
    {
        k=(int)p[j];
        bctable[k]=m-j-1;
    }
    i=m-1;
    while(i < n)
    {
        j=m-1;
        while(j >= 0 && p[j] == t[i])
        {
            i--;
            j--;
        }
        if(j == -1)
            return i+1;
        i = i + max((int)bctable[t[i]],m-j);
    }
    return 0;
}


int main() {
   char t[]="kiss*miss*in*mississippi";
   char p[]="missi";
   int i;
   i=boyermorre(p,t);
   if(i)
		printf("pattern is present in text at position %d",i+1);
   else
		printf("pattern is not present in text");
   return 0;
}