import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Scanner;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class BlowFishCipher {
    public static void main(String[] args) throws Exception {
        KeyGenerator generator = KeyGenerator.getInstance("Blowfish");
        SecretKey secretKey = generator.generateKey();
        Scanner sc = new Scanner(System.in);
        System.out.print("Input your message: ");
        String input = sc.nextLine();
        Cipher cipher = Cipher.getInstance("Blowfish");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encrypted = cipher.doFinal(input.getBytes(StandardCharsets.UTF_8));
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decrypted = cipher.doFinal(encrypted);
        System.out.println("Encrypted text: " + Base64.getEncoder().encodeToString(encrypted));
        System.out.println("Decrypted text: " + new String(decrypted, StandardCharsets.UTF_8));
    }
}
