#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 5

int queue[MAX_SIZE],front=-1, rear=-1;

// Function to add an element to the queue
void enqueue(int element) 
{
    if (rear == MAX_SIZE - 1) 
	{
        printf("Queue Overflow\n");
    } 
	else 
	{
		if(front == -1) 
			front = 0;
		queue[++rear] = element;
    }
}

// Function to remove an element from the queue
int dequeue() 
{
	int item;
    if (front == -1) 
	{
		printf("Queue Underflow\n");
        return -1; // Indicating underflow
    } 
	else 
	{
        int item = queue[front++];
        if (front > rear)   // Queue is now empty
		{ 
            front = -1;
            rear = -1;
        } 
        return item;
    }
}

// Function to display all the items from Queue
void display()
{
    int i;
    if (front == -1) 
	{
		printf("Queue is Empty\n");
    } 
    else
    {
        for(i=front;i<=rear;i++)
            printf("%d\t",queue[i]);
    }
}

// Main function
int main() {
    int ch,data;
    do{
        printf("\n1. Insert\n2. Delete\n3. Display\n4. Exit");
        printf("\nEnter your choice:   ");
        scanf("%d",&ch);
        switch(ch)
        {
            case 1: printf("Enter data to insert:  ");
                    scanf("%d",&data);
                    enqueue(data);
                    break;
            case 2: printf("Deleted: %d\n", dequeue());
                    break;
            case 3: display();
                    break;
            case 4: break;
            default: printf("your choice is wrong!..");
        }
    }while(ch!=4);
    return 0;
}