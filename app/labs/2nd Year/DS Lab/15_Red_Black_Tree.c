// Red Black Tree operations in C

#include <stdio.h>
#include <stdlib.h>

// Red-Black Tree Node Structure
typedef struct Node {
    int data;
    struct Node* parent;
    struct Node* left;
    struct Node* right;
    int color; // 0 for black, 1 for red
} Node;

// Red-Black Tree Structure
typedef struct RedBlackTree {
    Node* root;
} RedBlackTree;

// Create a new Red-Black Tree Node
Node* createNode(int data) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) {
        printf("Memory allocation error\n");
        exit(1);
    }
    newNode->data = data;
    newNode->parent = newNode->left = newNode->right = NULL;
    newNode->color = 1; // New nodes are initially red
    return newNode;
}

// Create a new Red-Black Tree
RedBlackTree* createRedBlackTree() {
    RedBlackTree* newTree = (RedBlackTree*)malloc(sizeof(RedBlackTree));
    if (newTree == NULL) {
        printf("Memory allocation error\n");
        exit(1);
    }
    newTree->root = NULL;
    return newTree;
}

// Function to perform left rotation
void leftRotate(RedBlackTree* tree, Node* x) {
    Node* y = x->right;
    x->right = y->left;
    if (y->left != NULL)
        y->left->parent = x;
    y->parent = x->parent;
    if (x->parent == NULL)
        tree->root = y;
    else if (x == x->parent->left)
        x->parent->left = y;
    else
        x->parent->right = y;
    y->left = x;
    x->parent = y;
}

// Function to perform right rotation
void rightRotate(RedBlackTree* tree, Node* y) {
    Node* x = y->left;
    y->left = x->right;
    if (x->right != NULL)
        x->right->parent = y;
    x->parent = y->parent;
    if (y->parent == NULL)
        tree->root = x;
    else if (y == y->parent->left)
        y->parent->left = x;
    else
        y->parent->right = x;
    x->right = y;
    y->parent = x;
}

// Function to fix the Red-Black Tree properties after insertion
void insertFixup(RedBlackTree* tree, Node* z) {
    while (z->parent != NULL && z->parent->color == 1) {
        if (z->parent == z->parent->parent->left) {
            Node* y = z->parent->parent->right;
            if (y != NULL && y->color == 1) {
                z->parent->color = 0; // Black
                y->color = 0; // Black
                z->parent->parent->color = 1; // Red
                z = z->parent->parent;
            } else {
                if (z == z->parent->right) {
                    z = z->parent;
                    leftRotate(tree, z);
                }
                z->parent->color = 0; // Black
                z->parent->parent->color = 1; // Red
                rightRotate(tree, z->parent->parent);
            }
        } else {
            Node* y = z->parent->parent->left;
            if (y != NULL && y->color == 1) {
                z->parent->color = 0; // Black
                y->color = 0; // Black
                z->parent->parent->color = 1; // Red
                z = z->parent->parent;
            } else {
                if (z == z->parent->left) {
                    z = z->parent;
                    rightRotate(tree, z);
                }
                z->parent->color = 0; // Black
                z->parent->parent->color = 1; // Red
                leftRotate(tree, z->parent->parent);
            }
        }
    }
    tree->root->color = 0; // Root must be black
}

// Function to insert a node into the Red-Black Tree
void insert(RedBlackTree* tree, int data) {
    Node* z = createNode(data);
    Node* y = NULL;
    Node* x = tree->root;

    while (x != NULL) {
        y = x;
        if (z->data < x->data)
            x = x->left;
        else
            x = x->right;
    }

    z->parent = y;
    if (y == NULL)
        tree->root = z;
    else if (z->data < y->data)
        y->left = z;
    else
        y->right = z;

    insertFixup(tree, z);
}

// Function to find the minimum value node in the tree rooted at a given node
Node* findMinValueNode(Node* node) {
    Node* current = node;
    while (current->left != NULL)
        current = current->left;
    return current;
}

// Function to fix the Red-Black Tree properties after deletion
void deleteFixup(RedBlackTree* tree, Node* x) {
    while (x != tree->root && x->color == 0) {
        if (x == x->parent->left) {
            Node* w = x->parent->right;
            if (w->color == 1) {
                w->color = 0; // Change sibling to black
                x->parent->color = 1; // Change parent to red
                leftRotate(tree, x->parent);
                w = x->parent->right;
            }
            if (w->left->color == 0 && w->right->color == 0) {
                w->color = 1; // Change sibling to red
                x = x->parent; // Move up the tree
            } else {
                if (w->right->color == 0) {
                    w->left->color = 0; // Change sibling's left child to black
                    w->color = 1; // Change sibling to red
                    rightRotate(tree, w);
                    w = x->parent->right;
                }
                w->color = x->parent->color;
                x->parent->color = 0; // Change parent to black
                w->right->color = 0; // Change sibling's right child to black
                leftRotate(tree, x->parent);
                x = tree->root; // This is to exit the loop
            }
        } else {
            // Same as then clause with "right" and "left" exchanged
            Node* w = x->parent->left;
            if (w->color == 1) {
                w->color = 0;
                x->parent->color = 1;
                rightRotate(tree, x->parent);
                w = x->parent->left;
            }
            if (w->right->color == 0 && w->left->color == 0) {
                w->color = 1;
                x = x->parent;
            } else {
                if (w->left->color == 0) {
                    w->right->color = 0;
                    w->color = 1;
                    leftRotate(tree, w);
                    w = x->parent->left;
                }
                w->color = x->parent->color;
                x->parent->color = 0;
                w->left->color = 0;
                rightRotate(tree, x->parent);
                x = tree->root;
            }
        }
    }
    x->color = 0; // Ensure the root is black
}

// Transplant helper function
void transplant(RedBlackTree* tree, Node* u, Node* v) {
    if (u->parent == NULL) {
        tree->root = v;
    } else if (u == u->parent->left) {
        u->parent->left = v;
    } else {
        u->parent->right = v;
    }
    if (v != NULL) {
        v->parent = u->parent;
    }
}

// Function to delete a node from the Red-Black Tree
void delete(RedBlackTree* tree, int data) {
    Node* z = tree->root;
    while (z != NULL && z->data != data) {
        if (data < z->data)
            z = z->left;
        else
            z = z->right;
    }

    if (z == NULL) {
        printf("Node not found in the tree\n");
        return; // Node to be deleted not found
    }

    Node* y = z; // Node to be unlinked from the tree
    Node* x;     // y's only child or NULL
    int yOriginalColor = y->color;

    if (z->left == NULL) {
        x = z->right;
        transplant(tree, z, z->right);
    } else if (z->right == NULL) {
        x = z->left;
        transplant(tree, z, z->left);
    } else {
        y = findMinValueNode(z->right); // Find the minimum node of the right subtree
        yOriginalColor = y->color;
        x = y->right;

        if (y->parent == z) {
            x->parent = y; // Necessary when x is NULL
        } else {
            transplant(tree, y, y->right);
            y->right = z->right;
            y->right->parent = y;
        }

        transplant(tree, z, y);
        y->left = z->left;
        y->left->parent = y;
        y->color = z->color;
    }

    free(z);

    if (yOriginalColor == 0) {
        deleteFixup(tree, x);
    }
}

// Function to perform in-order traversal of the Red-Black Tree
void inOrderTraversal(Node* root) {
    char c[2][6]={"BLACK","RED"};
    if (root != NULL) {
        inOrderTraversal(root->left);
        printf("%d,%s -> ", root->data, c[root->color]);
        inOrderTraversal(root->right);
    }
}

// Function to free memory by deallocating nodes
void freeMemory(Node* root) {
    if (root == NULL)
        return;
    freeMemory(root->left);
    freeMemory(root->right);
    free(root);
}

int main() {
    int choice,value;
    RedBlackTree* tree = createRedBlackTree();
    do
    {
        printf("\n1. Insertion\n2. Deletion\n3. Display\n4. Exit");
        printf("\nEnter your choice: ");
        scanf("%d",&choice);
        switch(choice)
        {
        case 1: printf("Enter the value to be insert: ");
                scanf("%d",&value);
                insert(tree, value);
                break;
        case 2: printf("Enter the value to be deleted: ");
                scanf("%d",&value);
                delete(tree, value);
                break;
        case 3: inOrderTraversal(tree->root);
                break;
        case 4: freeMemory(tree->root);
                break;
        default: printf("\nWrong selection!!! Try again!!!");  
        }
    }while(choice!=4);
    return(0);
}