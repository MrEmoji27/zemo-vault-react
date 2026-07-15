import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Scanner;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;

public class DES {
    private static final String KEY = "ThisIsSecretEncryptionKey";

    static SecretKey key() throws Exception {
        return SecretKeyFactory.getInstance("DESede")
                .generateSecret(new DESedeKeySpec(KEY.getBytes(StandardCharsets.UTF_8)));
    }

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the string: ");
        String input = sc.nextLine();
        Cipher cipher = Cipher.getInstance("DESede");
        cipher.init(Cipher.ENCRYPT_MODE, key());
        String encrypted = Base64.getEncoder().encodeToString(cipher.doFinal(input.getBytes(StandardCharsets.UTF_8)));
        cipher.init(Cipher.DECRYPT_MODE, key());
        String decrypted = new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        System.out.println("String To Encrypt: " + input);
        System.out.println("Encrypted Value : " + encrypted);
        System.out.println("Decrypted Value : " + decrypted);
    }
}
