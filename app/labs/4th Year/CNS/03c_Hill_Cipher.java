import java.util.Scanner;

public class HillCipher {
    static int mod(int n) { return (n % 26 + 26) % 26; }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[][] key = new int[3][3];
        System.out.println("Enter 3x3 matrix for key:");
        for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) key[i][j] = sc.nextInt();
        System.out.print("Enter a 3 letter string: ");
        String message = sc.next().toLowerCase();
        int[] plain = new int[3];
        for (int i = 0; i < 3; i++) plain[i] = message.charAt(i) - 'a';

        StringBuilder encrypted = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            int value = 0;
            for (int j = 0; j < 3; j++) value += key[i][j] * plain[j];
            encrypted.append((char) ('a' + mod(value)));
        }
        System.out.println("Encrypted string is: " + encrypted);
        System.out.println("Decryption uses the modular inverse of the entered key matrix.");
    }
}
