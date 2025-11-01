package com.neocare.auth_service.helper;
import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    // Hash the password
    public static String encode(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt(12)); // 12 = strength
    }

    // Verify password
    public static boolean matches(String rawPassword, String encodedPassword) {
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }
}

