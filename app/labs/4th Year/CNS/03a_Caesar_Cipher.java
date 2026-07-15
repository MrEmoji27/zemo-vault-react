import java.util.Scanner;

public class CaesarCipher {
    static String encrypt(String text, int key) {
        StringBuilder result = new StringBuilder();
        for (char ch : text.toCharArray()) {
            if (Character.isUpperCase(ch)) ch = (char) ('A' + (ch - 'A' + key) % 26);
            else if (Character.isLowerCase(ch)) ch = (char) ('a' + (ch - 'a' + key) % 26);
            result.append(ch);
        }
        return result.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter any String: ");
        String text = sc.nextLine();
        System.out.print("Enter the Key: ");
        int key = ((sc.nextInt() % 26) + 26) % 26;
        String encrypted = encrypt(text, key);
        System.out.println("\nEncrypted String is: " + encrypted);
        System.out.println("Decrypted String is: " + encrypt(encrypted, 26 - key));
    }
}
