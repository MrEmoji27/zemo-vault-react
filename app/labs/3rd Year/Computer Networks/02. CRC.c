#include <stdio.h>
#include <math.h>

int gen[4], genl = 4, frl = 8, rem[4];

void calculateCRC(int fr[]);

int main() {
    int i, j, fr[8], dupfr[11], recfr[11], tlen, flag;

    printf("Enter frame: ");
    for(i = 0; i < frl; i++) {
        scanf("%d", &fr[i]);
        dupfr[i] = fr[i];
    }

    printf("Enter generator: ");
    for(i = 0; i < genl; i++) {
        scanf("%d", &gen[i]);
    }

    tlen = frl + genl - 1;
    for(i = frl; i < tlen; i++) {
        dupfr[i] = 0;
    }

    calculateCRC(dupfr);

    for(i = 0; i < frl; i++) {
        recfr[i] = fr[i];
    }

    for(i = frl, j = 1; i < tlen; i++, j++) {
        recfr[i] = rem[j];
    }

    calculateCRC(recfr);

    flag = 0;
    for(i = 0; i < genl; i++) {
        if(rem[i] != 0)
            flag++;
    }

    if(flag == 0) {
        printf("Frame received correctly.\\n");
    } else {
        printf("Error detected in received frame.\\n");
    }

    return 0;
}

void calculateCRC(int fr[]) {
    int k, k1, i, j;
    for(k = 0; k < frl; k++) {
        if(fr[k] == 1) {
            k1 = k;
            for(i = 0, j = k; i < genl; i++, j++) {
                rem[i] = fr[j] ^ gen[i];
            }
            for(i = 0; i < genl; i++) {
                fr[k1] = rem[i];
                k1++;
            }
        }
    }
}
