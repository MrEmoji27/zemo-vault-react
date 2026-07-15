import java.util.Scanner;

public class SubstitutionCipher {
    public static void main(String[] args) {
        String alphabet = "abcdefghijklmnopqrstuvwxyz";
        String substitution = "zyxwvutsrqponmlkjihgfedcba";
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter any string: ");
        String text = sc.nextLine().toLowerCase();
        StringBuilder encrypted = new StringBuilder();

        for (char ch : text.toCharArray()) {
            int index = alphabet.indexOf(ch);
            encrypted.append(index >= 0 ? substitution.charAt(index) : ch);
        }
        System.out.println("The encrypted data is: " + encrypted);
    }
}
