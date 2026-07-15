import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class BlowFish {
    public static void main(String[] args) throws Exception {
        KeyGenerator generator = KeyGenerator.getInstance("Blowfish");
        generator.init(128);
        SecretKey key = generator.generateKey();
        Cipher cipher = Cipher.getInstance("Blowfish");
        String input = "Hello World";
        cipher.init(Cipher.ENCRYPT_MODE, key);
        String encrypted = Base64.getEncoder().encodeToString(cipher.doFinal(input.getBytes(StandardCharsets.UTF_8)));
        cipher.init(Cipher.DECRYPT_MODE, key);
        String decrypted = new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        System.out.println("Encrypted text: " + encrypted);
        System.out.println("Decrypted text: " + decrypted);
    }
}
