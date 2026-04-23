#include <stdio.h>
#include <stdlib.h>

struct node 
{
  int key;
  struct node *left, *right;
};

// Create a node
struct node *newNode(int item) 
{
  struct node *temp = (struct node *)malloc(sizeof(struct node));
  temp->key = item;
  temp->left = temp->right = NULL;
  return temp;
}

// Inorder Traversal
void inorder(struct node *root) 
{
    if (root != NULL) 
    {   // Traverse left
        inorder(root->left);
        // Traverse root
        printf("%d -> ", root->key);
        // Traverse right
        inorder(root->right);
    }
}

// preorder Traversal
void preorder(struct node *root) 
{   
    if (root != NULL) 
    {
        printf("%d -> ", root->key);
        preorder(root->left);
        preorder(root->right);
    }
}

// postorder Traversal
void postorder(struct node *root) 
{
    if (root != NULL) 
    {
        postorder(root->left);
        postorder(root->right);
        printf("%d -> ", root->key);
  }
}

// Insert a node
struct node *insert(struct node *node, int key) 
{   // Return a new node if the tree is empty
    if (node == NULL) 
        return newNode(key);
    // Traverse to the right place and insert the node
    if (key < node->key)
        node->left = insert(node->left, key);
    else
        node->right = insert(node->right, key);
    return node;
}

// Find the inorder successor
struct node *minValueNode(struct node *node) 
{
    struct node *current = node;
    // Find the leftmost leaf
    while (current && current->left != NULL)
        current = current->left;
    return current;
}

// Deleting a node
struct node *deleteNode(struct node *root, int key) 
{   // Return if the tree is empty
    if (root == NULL) 
        return root;
    // Find the node to be deleted
    if (key < root->key)
        root->left = deleteNode(root->left, key);
    else if (key > root->key)
        root->right = deleteNode(root->right, key);
    else 
    {
        // If the node is with only one child or no child
        if (root->left == NULL) 
        {
            struct node *temp = root->right;
            free(root);
            return temp;
        } 
        else if (root->right == NULL) 
        {
            struct node *temp = root->left;
            free(root);
            return temp;
        }
        // If the node has two children
        struct node *temp = minValueNode(root->right);
        // Place the inorder successor in position of the node to be deleted
        root->key = temp->key;
        // Delete the inorder successor
        root->right = deleteNode(root->right, temp->key);
    }
    return root;
}

// Function to free memory by deallocating nodes
void freeMemory(struct node *root) 
{
    if (root == NULL)
        return;
    freeMemory(root->left);
    freeMemory(root->right);
    free(root);
}

int main() {
    int choice,value;
  struct node *root = NULL;
  do
    {
        printf("\n1. Insertion\n2. Deletion\n3. inorder\n4. preorder\n5. postorder\n6. Exit");
        printf("\nEnter your choice: ");
        scanf("%d",&choice);
        switch(choice)
        {
        case 1: printf("Enter the value to be insert: ");
                scanf("%d",&value);
                root = insert(root, value);
                break;
        case 2: printf("Enter the value to be deleted: ");
                scanf("%d",&value);
                root = deleteNode(root, value);
                break;
        case 3: inorder(root);
                break;
        case 4: preorder(root);
                break;
        case 5: postorder(root);
                break;
        case 6: freeMemory(root);
                break;
        default: printf("\nWrong selection!!! Try again!!!");  
        }
    }while(choice!=6);
    return (0);
}