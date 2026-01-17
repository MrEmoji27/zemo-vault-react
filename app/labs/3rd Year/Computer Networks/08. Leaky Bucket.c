#include <stdio.h>

void main() {
    int arriv;
    printf("enter the no of arrival \\n");
    scanf("%d", &arriv);
    
    int t[arriv];
    int packet[arriv];
    
    printf("enter the times \\n");
    int i;
    
    for (i = 0; i < arriv; i++) {
        printf("enter time t%d:", i + 1);
        scanf("%d", &t[i]);
        printf("enter packet p %d:", i + 1);
        scanf("%d", &packet[i]);
    }
    
    int ps = 20;
    int or = 2;
    int lo = 0;
    int ct = 1;
    
    for (i = 0; i < arriv; i++) {
        
        while (ct < t[i]) {
            printf("at time %d:no new packets arrived:", ct);
            printf("packets send:%d\\n", (lo > or ? or : lo));
            lo = lo - (lo > or ? or : lo);
            ct++;
        }
        
        int tp = packet[i] + lo;
        int psent = (tp > or) ? or : tp;
        lo = tp - psent;
        
        printf("at time %d:\\n", ct);
        printf("packets received:%d\\n", packet[i]);
        printf("packet sent:%d\\n", psent);
        printf("packet left:%d\\n\\n", lo);
        ct++;
    }
    
    while (lo > 0) {
        printf("at time %d :no new packets arrived\\n", ct);
        int psent = (lo > or) ? or : lo;
        lo = lo - psent;
        printf("packet sent:%d\\n", psent);
        printf("packet left:%d\\n\\n", lo);
        ct++;
    }
}
