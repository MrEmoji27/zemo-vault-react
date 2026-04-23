#include <stdio.h>
void merge(int A[], int mid, int low, int high)
{
    int i, j, k, B[100];
    i = low;
    j = mid + 1;
    k = low;

    while (i <= mid && j <= high)
    {
        if (A[i] < A[j])
        {
            B[k] = A[i];
            i++;
            k++;
        }
        else
        {
            B[k] = A[j];
            j++;
            k++;
        }
    }
    while (i <= mid)
    {
        B[k] = A[i];
        k++;
        i++;
    }
    while (j <= high)
    {
        B[k] = A[j];
        k++;
        j++;
    }
	// It will copy data from temporary array to array
    for (int i = low; i <= high; i++)
    {
        A[i] = B[i];
    }
}

void mergeSort(int number[], int low, int high)
{
    int mid; 
    if(low<high)
	{
		// finding the mid value of the array. 
        mid = (low + high) /2;
		// Calling the merge sort for the first half
        mergeSort(number, low, mid);
		// Calling the merge sort for the second half
        mergeSort(number, mid+1, high);
		// Calling the merge function
        merge(number, mid, low, high);
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
    mergeSort(number,0,count-1);
    printf("Order of Sorted elements: ");
    for(i=0;i<count;i++)
    printf(" %d",number[i]);
    return 0;
}