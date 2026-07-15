import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class SHA1 {
    static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) result.append(String.format("%02X", b));
        return result.toString();
    }

    public static void main(String[] args) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        String[] inputs = {"", "abc", "abcdefghijklmnopqrstuvwxyz"};
        for (String input : inputs)
            System.out.println("SHA1(\"" + input + "\") = " + hex(digest.digest(input.getBytes(StandardCharsets.UTF_8))));
    }
}
