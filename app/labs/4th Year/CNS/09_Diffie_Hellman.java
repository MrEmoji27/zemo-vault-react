import java.math.BigInteger;
import java.util.Scanner;

public class DiffieHellman {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter prime p: ");
        BigInteger p = sc.nextBigInteger();
        System.out.print("Enter primitive root g: ");
        BigInteger g = sc.nextBigInteger();
        System.out.print("Enter Alice's private key: ");
        BigInteger alicePrivate = sc.nextBigInteger();
        System.out.print("Enter Bob's private key: ");
        BigInteger bobPrivate = sc.nextBigInteger();
        BigInteger alicePublic = g.modPow(alicePrivate, p);
        BigInteger bobPublic = g.modPow(bobPrivate, p);
        BigInteger aliceSecret = bobPublic.modPow(alicePrivate, p);
        BigInteger bobSecret = alicePublic.modPow(bobPrivate, p);
        System.out.println("Alice public key: " + alicePublic);
        System.out.println("Bob public key: " + bobPublic);
        System.out.println("Shared secret: " + aliceSecret);
        System.out.println("Keys match: " + aliceSecret.equals(bobSecret));
    }
}
