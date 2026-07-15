import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;

public class AES {
    public static void main(String[] args) throws Exception {
        String message = args.length == 0 ? "AES still rocks!!" : args[0];
        KeyGenerator generator = KeyGenerator.getInstance("AES");
        generator.init(128);
        Key key = generator.generateKey();
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        String encrypted = Base64.getEncoder().encodeToString(cipher.doFinal(message.getBytes(StandardCharsets.UTF_8)));
        cipher.init(Cipher.DECRYPT_MODE, key);
        String original = new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        System.out.println("Encrypted string: " + encrypted);
        System.out.println("Original string: " + original);
    }
}
