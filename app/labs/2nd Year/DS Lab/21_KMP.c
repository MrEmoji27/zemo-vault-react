#include <stdio.h>
#include <string.h>

int lps[100];
void longestPrefixSuffix(char p[])
{
	int i=1,j=0;
	int m = strlen(p);
	lps[0] = 0;
	while(i < m)
	{
		if( p[j] == p[i])
		{
			lps[i]=j+1;
			i++;
			j++;
		}
		else if(j>0)
			j = lps[j-1];
		else
		{
			lps[i]=0;
			i++;
		}
	}
}

int kmp (char p[],char t[])
{
	int n,m;
	int i=0,j=0;
	n = strlen(t);
    m = strlen(p);
	longestPrefixSuffix(p);
	while( i < n )
	{
		if ( p[j] == t[i])
		{
			if (j == m-1 ) 
				return i-j;
			i++; 
			j++;
		}
		else if(j>0)
			j = lps[j-1];
		else 
			i++;
	}
	return 0;
}

int main() {
   char t[]="kiss*miss*in*mississippi";
   char p[]="missi";
   int i;
   i=kmp(p,t);
   if(i)
		printf("pattern is present in text at position %d",i+1);
   else
		printf("pattern is not present in text");
   return 0;
}