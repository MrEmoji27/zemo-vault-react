#include <stdio.h>
#include <stdlib.h>

// Definition of a node in a binary tree
struct Node 
{
    int data;
    struct Node *left;
    struct Node *right;
}*root=NULL;
int top=-1;
struct Node *s[40];

//push into stack
int push(struct Node *x)
{
    s[++top]=x;
}

//pop from stack
struct Node* pop()
{
    struct Node *x=s[top--];
    return(x);
}

// Function to create a new node
struct Node* createNode(int data) 
{
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = data;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

void preOrder(struct Node *root)
{
    struct Node *ptr;
    ptr=root;
    if(root==NULL){
        printf("\nTree is empty");
    }
    else
    {
        push(root);
        while(top!=-1)
        {
            ptr=pop();
            if(ptr!=NULL)
            {
               printf("%d ",ptr->data);
               push(ptr->right);
               push(ptr->left);
            }
        }
    }
}


void inOrder(struct Node *root)
{
    struct Node *ptr;
    ptr=root;
    if(root==NULL)
    {
        printf("\nTree is empty");
    }
    else
    {
        while(top!=-1||ptr!=NULL)
        {
            if(ptr!=NULL)
            {
                push(ptr);
                ptr=ptr->left;
            }
            else{
                ptr=pop();
                printf("%d ",ptr->data);
                ptr=ptr->right;
            }
        }
    }
}


void postOrder(struct Node *root)
{
    struct Node *ptr,*temp;
    ptr=root;
    temp=NULL;
    if(root==NULL)
    {
        printf("\nTree is empty");
    }
    else{
        while(ptr->left!=NULL)
        {
           push(ptr);
           ptr=ptr->left;
        }
        while(ptr!=NULL){
            if(ptr->right==NULL||ptr->right==temp)
            {
                printf("%d ",ptr->data);
                temp=ptr;
                ptr=pop();
            }
            else
            {
                push(ptr);
                ptr=ptr->right;
                while(ptr->left!=NULL)
                {
                    push(ptr);
                    ptr=ptr->left;
                }
            }
        }
    }
}

int main() {
    // Constructing a binary tree
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    root = createNode(1);
    root->left = createNode(2);
    root->right = createNode(3);
    root->left->left = createNode(4);
    root->left->right = createNode(5);

    /* Traversals
    printf("Pre-order traversal: ");
    preOrder(root);
    printf("\n"); */

    printf("In-order traversal: ");
    inOrder(root);
    printf("\n");

   /* printf("Post-order traversal: ");
    postOrder(root);
    printf("\n"); */

    return 0;
}