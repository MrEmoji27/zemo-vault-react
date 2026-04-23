#include <stdio.h>

// Function to swap two elements
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

/* heapify the subtree with root i */
void heapify(int* arr, int n, int i)
{
    // store largest as the root element
    int largest = i;
    int left = 2 * i + 1;
    int right  = 2 * i + 2;
    // now check whether the right and left right is larger than the root or not
    if (left < n && arr[left] > arr[largest])
    {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest])
    {
        largest = right;
    }
    // if the root is smaller than the children then swap it with the largest children's value
    if (largest != i)
    {
        swap(&arr[i], &arr[largest]);
        // again heapify that side of the heap where the root has gone
        heapify(arr, n, largest);
    }
}

/* sorts the given array of n size */
void heapsort(int* arr, int n)
{
    // build the binary max heap
    for (int i = n / 2 - 1; i >= 0; i--)
    {
        heapify(arr, n, i);
    }
    // sort the max heap
    for (int i = n - 1; i >= 0; i--)
    {
        // swap the root node and the last leaf node
        swap(&arr[i], &arr[0]);
        // again heapify the max heap from the root 
        heapify(arr, i, 0);
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
    heapsort(number,count);
    printf("Order of Sorted elements: ");
    for(i=0;i<count;i++)
    printf(" %d",number[i]);
    return 0;
}