const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "https://comproved.com.br").replace(/\/$/, "");


function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comproved</title></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr>
          <td style="background:#0b1b3f;border-radius:12px 12px 0 0;padding:24px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="vertical-align:middle;padding-right:12px;">
                  <img src="${BASE_URL}/logo-email.svg" width="40" height="40" alt="Comproved" style="display:block;border-radius:8px;" />
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">Comproved</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Você está recebendo este e-mail porque possui uma conta no Comproved.<br>
              <a href="${BASE_URL}" style="color:#2a5bff;text-decoration:none;">comproved.com.br</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function otpEmail(name: string, otp: string): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0b1b3f;">Olá, ${name}!</p>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
      Use o código abaixo para verificar seu e-mail. Ele expira em <strong>10 minutos</strong>.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#f0f4ff;border:2px dashed #6b8fff;border-radius:12px;padding:20px 40px;">
        <span style="font-size:40px;font-weight:800;letter-spacing:0.18em;color:#0b1b3f;font-family:'Courier New',monospace;">${otp}</span>
      </div>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Não compartilhe este código com ninguém.</p>
    </div>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
      Se você não solicitou este código, ignore este e-mail com segurança.
    </p>
  `);
}

export function resetPasswordEmail(name: string, url: string): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0b1b3f;">Olá, ${name}!</p>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
      Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${url}"
        style="display:inline-block;background:#2a5bff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;letter-spacing:0.01em;">
        Redefinir minha senha
      </a>
    </div>

    <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
        ⏱ Este link expira em <strong>1 hora</strong>. Após isso, será necessário solicitar novamente.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
      Se você não solicitou a redefinição de senha, ignore este e-mail — sua senha permanece a mesma.
    </p>
  `);
}

export function verifyEmailTemplate(name: string, url: string): string {
  return layout(`
    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0b1b3f;">Olá, ${name}!</p>
    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
      Bem-vindo ao Comproved! Confirme seu endereço de e-mail para ativar sua conta.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${url}"
        style="display:inline-block;background:#2a5bff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;letter-spacing:0.01em;">
        Confirmar e-mail
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
      O link expira em <strong>24 horas</strong>. Se você não criou uma conta no Comproved, ignore este e-mail.
    </p>
  `);
}
