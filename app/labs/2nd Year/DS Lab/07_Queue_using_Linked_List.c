#include<stdio.h>
#include<stdlib.h>

struct node{
    int data;
    struct node*next;
}*head=NULL;

struct node *create(int value)
{
    struct node *temp;
    temp=(struct node*)malloc(sizeof(struct node));
    temp->data=value;
    temp->next=NULL;
    return temp;
}

void enqueue(int value)
{
    struct node *newnode, *temp;
    newnode=create(value);
    if(head==NULL)
    {
        head=newnode;
    }
    else
    {
        temp=head;
        while(temp->next!=NULL)
        {
            temp=temp->next;
        }
        temp->next=newnode;
    }
}

void dequeue()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("Queue Underflow");
    }
    else
    {
        temp=head;
        head=head->next;
        free(temp);
    }
}

void display()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("Queue is empty");
    }
    else
    {
        temp=head;
        while(temp->next!=NULL)
        {
            printf("%d, ",temp->data);
            temp=temp->next;
        }
        printf("%d",temp->data);
    }
}

void main()
{
    int ch,pos,value;
    do
    {
       printf("\n1. Insert\n2. Delete\n3. Display\n4. Exit");
        printf("\nEnter your choice:   ");
        scanf("%d",&ch);
        switch(ch)
        {
        case 1: printf("Enter data to insert:  ");
                scanf("%d",&value);
                enqueue(value);
                break;
        case 2: dequeue();
                break;
        case 3: display();
                break;
        case 4:break;
        default: printf("\nyour choice is wrong!..");
        }
    }while(ch!=4);
}