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

void push(int value)
{
    struct node *newnode;
    newnode=create(value);
    if(head==NULL)
    {
        head=newnode;
    }
    else
    {
        newnode->next=head;
        head=newnode;
    }
}

void pop()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("Stack is underflow");
    }
    else
    {
        temp=head;
        head=head->next;
        free(temp);
    }
}

void show()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("Stack is empty");
    }
    else
    {
        temp=head;
        while(temp!=NULL)
        {
            printf("%d\n",temp->data);
            temp=temp->next;
        }
    }
}

void main()
{
    int ch,pos,value;
    do
    {
        printf("\n1. Push\n2. Pop\n3. Show\n4. Exit");
        printf("\nEnter your choice: ");
        scanf("%d",&ch);
        switch(ch)
        {
        case 1: printf("\nEnter the value: ");
                scanf("%d",&value);
                push(value);
                break;
        case 2: pop();
                break;
        case 3: show();
                break;
        case 4:break;
        default: printf("\nyour choice is wrong!.. ");
        }
    }while(ch!=4);
}