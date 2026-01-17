#include <stdio.h>
#include <string.h>

int main() {
    char data[100];
    char stuffed_data[200];
    int i, j, count;

    printf("Enter binary data: ");
    scanf("%s", data);

    i = 0; // Index for input data
    j = 0; // Index for stuffed_data
    count = 0; // To count consecutive 1s

    while(data[i] != '\\0') {
        stuffed_data[j] = data[i];
        if(data[i] == '1') {
            count++;
        } else {
            count = 0;
        }

        if(count == 5) {
            j++; // Move to next position
            stuffed_data[j] = '0'; // Stuff a '0'
            count = 0; // Reset the count
        }
        i++;
        j++;
    }
    stuffed_data[j] = '\\0'; // Null terminate the stuffed string

    printf("Original Data: %s\\n", data);
    printf("Stuffed Data:  01111110 %s 01111110\\n", stuffed_data);

    return 0;
}
