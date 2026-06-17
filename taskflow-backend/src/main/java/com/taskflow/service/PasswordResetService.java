package com.taskflow.service;

import com.taskflow.dto.request.ForgotPasswordRequest;
import com.taskflow.dto.request.ResetPasswordRequest;
import com.taskflow.entity.PasswordResetToken;
import com.taskflow.entity.User;
import com.taskflow.repository.PasswordResetTokenRepository;
import com.taskflow.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository               userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender               mailSender;
    private final PasswordEncoder              passwordEncoder;

    /**
     * Génère un token de reset et tente d'envoyer l'email.
     * Retourne toujours le lien (pour le mode dev / démo universitaire).
     * Si l'email n'existe pas → retourne null (sans révéler l'info).
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) return null;

        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:4200/auth/reset-password?token=" + token;
        log.info("🔑 Reset link for {}: {}", user.getEmail(), resetLink);

        sendResetEmail(user, resetLink);

        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token invalide ou expiré"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Ce lien a déjà été utilisé");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le lien a expiré (valable 1 heure)");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private void sendResetEmail(User user, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("TaskFlow — Réinitialisation de votre mot de passe");
            helper.setText(buildEmailHtml(user.getFirstName(), resetLink), true);
            mailSender.send(message);
            log.info("✅ Email envoyé à {}", user.getEmail());
        } catch (MessagingException | MailException e) {
            log.warn("⚠️  Email non envoyé (config mail absente ou incorrecte): {}", e.getMessage());
            log.info("🔗 Utilisez ce lien directement: {}", resetLink);
        }
    }

    private String buildEmailHtml(String firstName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:3rem 1rem;">
                  <table width="520" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:2rem;text-align:center;">
                        <div style="font-size:2rem;">⚡</div>
                        <h1 style="color:#fff;margin:.5rem 0 0;font-size:1.5rem;font-weight:800;">TaskFlow</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:2.5rem 2rem;">
                        <h2 style="color:#1e293b;margin:0 0 .75rem;font-size:1.25rem;">Bonjour %s,</h2>
                        <p style="color:#64748b;margin:0 0 1.5rem;line-height:1.6;">
                          Vous avez demandé la réinitialisation de votre mot de passe TaskFlow.
                        </p>
                        <div style="text-align:center;margin:2rem 0;">
                          <a href="%s"
                             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                    color:#fff;padding:1rem 2.5rem;border-radius:12px;
                                    text-decoration:none;font-weight:700;font-size:1rem;">
                            🔐 Réinitialiser mon mot de passe
                          </a>
                        </div>
                        <p style="color:#94a3b8;font-size:.8rem;margin:0;line-height:1.6;">
                          Ce lien est valable <strong>1 heure</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="color:#94a3b8;font-size:.75rem;margin:0;">© 2026 TaskFlow — Projet universitaire</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(firstName, resetLink);
    }
}
