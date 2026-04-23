#include <stdio.h>
#include <stdlib.h>

// Structure for a node in the AVL tree
struct Node {
    int data;
    struct Node* left;
    struct Node* right;
    int height; // Height of the node
};

// Function to create a new node
struct Node* createNode(int data) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (newNode == NULL) {
        printf("Memory allocation error\n");
        exit(1);
    }
    newNode->data = data;
    newNode->left = newNode->right = NULL;
    newNode->height = 1; // Initialize height as 1 for a new node
    return newNode;
}

// Function to calculate the height of a node
int getHeight(struct Node* node) {
    if (node == NULL)
        return 0;
    return node->height;
}

// Function to find the maximum of two integers
int max(int a, int b) {
    return (a > b) ? a : b;
}

// Function to perform right rotation
struct Node* rightRotate(struct Node* y) {
    struct Node* x = y->left;
    struct Node* T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update heights
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;

    return x;
}

// Function to perform left rotation
struct Node* leftRotate(struct Node* x) {
    struct Node* y = x->right;
    struct Node* T2 = y->left;

    // Perform rotation
    y->left = x;
    x->right = T2;

    // Update heights
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;

    return y;
}

// Function to get the balance factor of a node
int getBalanceFactor(struct Node* node) {
    if (node == NULL)
        return 0;
    return getHeight(node->left) - getHeight(node->right);
}

// Function to insert a node into the AVL tree
struct Node* insert(struct Node* root, int data) {
    if (root == NULL)
        return createNode(data);

    if (data < root->data)
        root->left = insert(root->left, data);
    else if (data > root->data)
        root->right = insert(root->right, data);
    else
        return root; // Duplicate keys are not allowed

    // Update height of current node
    root->height = 1 + max(getHeight(root->left), getHeight(root->right));

    // Get the balance factor to check if rotation is needed
    int balance = getBalanceFactor(root);

    // Left-Left case (LL)
    if (balance > 1 && data < root->left->data)
        return rightRotate(root);

    // Right-Right case (RR)
    if (balance < -1 && data > root->right->data)
        return leftRotate(root);

    // Left-Right case (LR)
    if (balance > 1 && data > root->left->data) {
        root->left = leftRotate(root->left);
        return rightRotate(root);
    }

    // Right-Left case (RL)
    if (balance < -1 && data < root->right->data) {
        root->right = rightRotate(root->right);
        return leftRotate(root);
    }

    return root;
}

// Function to find the node with the minimum value in the tree
struct Node* findMinValueNode(struct Node* node) {
    struct Node* current = node;
    while (current->left != NULL)
        current = current->left;
    return current;
}

// Function to delete a node from the AVL tree
struct Node* deleteNode(struct Node* root, int data) {
    if (root == NULL)
        return root;

    if (data < root->data)
        root->left = deleteNode(root->left, data);
    else if (data > root->data)
        root->right = deleteNode(root->right, data);
    else {
        // Node with only one child or no child
        if ((root->left == NULL) || (root->right == NULL)) {
            struct Node* temp = root->left ? root->left : root->right;

            // No child case
            if (temp == NULL) {
                temp = root;
                root = NULL;
            } else // One child case
                *root = *temp; // Copy the contents of the non-empty child

            free(temp);
        } else {
            // Node with two children: Get the inorder successor (smallest
            // in the right subtree)
            struct Node* temp = findMinValueNode(root->right);

            // Copy the inorder successor's data to this node
            root->data = temp->data;

            // Delete the inorder successor
            root->right = deleteNode(root->right, temp->data);
        }
    }

    // If the tree had only one node then return
    if (root == NULL)
        return root;

    // Update height of current node
    root->height = 1 + max(getHeight(root->left), getHeight(root->right));

    // Get the balance factor to check if rotation is needed
    int balance = getBalanceFactor(root);

    // Left-Left case (LL)
    if (balance > 1 && getBalanceFactor(root->left) >= 0)
        return rightRotate(root);

    // Left-Right case (LR)
    if (balance > 1 && getBalanceFactor(root->left) < 0) {
        root->left = leftRotate(root->left);
        return rightRotate(root);
    }

    // Right-Right case (RR)
    if (balance < -1 && getBalanceFactor(root->right) <= 0)
        return leftRotate(root);

    // Right-Left case (RL)
    if (balance < -1 && getBalanceFactor(root->right) > 0) {
        root->right = rightRotate(root->right);
        return leftRotate(root);
    }

    return root;
}

// Function for in-order traversal of the AVL tree
void inOrderTraversal(struct Node* root)
{
   if(root != NULL) {
      inOrderTraversal(root->left);
      printf("%d ",root->data);          
      inOrderTraversal(root->right);
   }
}
// Function to free memory by deallocating nodes
void freeMemory(struct Node* root) {
    if (root == NULL)
        return;
    freeMemory(root->left);
    freeMemory(root->right);
    free(root);
}

int main() {
    int choice,value;
    struct Node* root = NULL;
    do
    {
        printf("\n1. Insertion\n2. Deletion\n3. Display\n4. Exit");
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
        case 3: inOrderTraversal(root);
                break;
        case 4: freeMemory(root);
                break;
        default: printf("\nWrong selection!!! Try again!!!");  
        }
    }while(choice!=4);
    return 0;
}