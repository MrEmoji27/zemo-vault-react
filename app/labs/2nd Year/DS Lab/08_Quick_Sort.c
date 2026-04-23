#include <stdio.h>

// Function to swap two elements
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

void quicksort(int number[25],int first,int last)
{
    int i, j, pivot, temp;
    if(first<last)
    {
        pivot=first; // Choose the first element as pivot
        i=first;
        j=last;
        while(i<j)
        {
            while(number[i]<=number[pivot]&&i<last)
            i++;
            while(number[j]>number[pivot])
            j--;
            if(i<j) // swap two elements
            {
                swap(&number[i], &number[j]);
            }
        }
		// Swap the pivot element with the element at i+1 position
		swap(&number[pivot], &number[j]);
		// Recursive call on the left of pivot
        quicksort(number,first,j-1);
		// Recursive call on the right of pivot
        quicksort(number,j+1,last);
    }
}
int main()
{
    int i, count, number[25];
    printf("How many elements are u going to enter?: ");
    scanf("%d",&count);
    for(i=0;i<count;i++)
    {
        printf("\nEnter %d element: ", i+1);
        scanf("%d",&number[i]);
    }
    quicksort(number,0,count-1);
    printf("Order of Sorted elements: ");
    for(i=0;i<count;i++)
    printf(" %d",number[i]);
    return 0;
}