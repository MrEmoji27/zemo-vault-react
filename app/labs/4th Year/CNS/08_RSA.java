import java.math.BigInteger;
import java.util.Scanner;

public class RSA {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a Prime number: ");
        BigInteger p = sc.nextBigInteger();
        System.out.print("Enter another prime number: ");
        BigInteger q = sc.nextBigInteger();
        BigInteger n = p.multiply(q);
        BigInteger phi = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE));
        BigInteger e = BigInteger.valueOf(2);
        while (!e.gcd(phi).equals(BigInteger.ONE)) e = e.add(BigInteger.ONE);
        BigInteger d = e.modInverse(phi);
        System.out.println("Encryption keys are: " + e + ", " + n);
        System.out.println("Decryption keys are: " + d + ", " + n);
    }
}
