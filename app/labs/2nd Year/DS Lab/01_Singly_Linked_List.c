#include<stdio.h>
#include<stdlib.h>

struct node{
    int data;
    struct node*next;
}*head=NULL;

int count()
{
    struct node *temp;
    int i=1;
    temp=head;
    while(temp->next!=NULL)
    {
        temp=temp->next;
        i++;
    }
    return(i);
}

struct node *create(int value)
{
    struct node *temp;
    temp=(struct node*)malloc(sizeof(struct node));
    temp->data=value;
    temp->next=NULL;
    return temp;
}
void insert_begin(int value)
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

void insert_end(int value)
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

void insert_pos(int value,int pos)
{
    struct node *newnode, *temp1,*temp2;
    int i,c=1;
    newnode=create(value);
    i=count();
    if(pos==1)
        insert_begin(value);
    else if(pos>i+1)
    {
        printf("insertion is not posible");
        return;
    }
    else
    {
        temp1=head;
        while(c<=pos-1 && temp1!=NULL)
        {
            temp2=temp1;
            temp1=temp1->next;
            c++;
        }
        newnode->next=temp2->next;
        temp2->next=newnode;
    }
}

void delete_begin()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("deletion is not possible");
    }
    else
    {
        temp=head;
        head=head->next;
        free(temp);
    }
}
void delete_end()
{
    struct node *temp1,*temp2;
    if(head==NULL)
    {
        printf("deletion is not possible");
    }
    else
    {
        temp1=head;
        while(temp1->next!=NULL)
        {
            temp2=temp1;
            temp1=temp1->next;
        }
        temp2->next=NULL;
        free(temp1);
    }
}
void delete_pos(int pos)
{
    struct node *temp1,*temp2;
    int i,c=1;
    i=count();
    if(pos==1)
        delete_begin();
    else if(pos>i)
    {
        printf("Deletion is not posible");
        return;
    }
    else
    {
        temp1=head;
        while(c<=pos && temp1->next!=NULL)
        {
            temp2=temp1;
            temp1=temp1->next;
            c++;
        }
        temp2->next=temp1->next;
        free(temp1);
    }
}
void display()
{
    struct node *temp;
    if(head==NULL)
    {
        printf("list is empty");
    }
    else
    {
        temp=head;
        while(temp->next!=NULL)
        {
            printf("%d-> ",temp->data);
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
        printf("\n1.Insert Begin\n2.Insert End\n3.Insert Position\n4.Delete Begin\n5.Delete End\n6.Delete Position\n7.Display\n8.Exit\n");
        printf("enter your choice:");
        scanf("%d",&ch);
        switch(ch)
        {
        case 1: printf("enter the value:");
                scanf("%d",&value);
                insert_begin(value);
                break;
        case 2: printf("enter value:");
                scanf("%d",&value);
                insert_end(value);
                break;
        case 3: printf("enter value:");
                scanf("%d",&value);
                printf("enter position you want to insert: ");
                scanf("%d",&pos);
                insert_pos(value,pos);
                break;
        case 4: delete_begin();
                break;
        case 5: delete_end();
                break;
        case 6: printf("enter position you want to delete: ");
                scanf("%d",&pos);
                delete_pos(pos);
                break;
        case 7: display();
                break;
        case 8:break;
        default: printf("\nyour choice is wrong!.. ");
        }
    }while(ch!=8);
}