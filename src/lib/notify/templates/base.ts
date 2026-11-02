/**
 * Base Layout Template untuk Email Notifikasi Kos Omi
 * Menggunakan inline CSS standar email client (Gmail, Outlook, Apple Mail)
 * Warna identitas: Primary HSL(217, 91%, 45%) -> #0a56e2 / #0b57d0
 */

export interface BaseEmailLayoutOptions {
  title: string;
  previewText?: string;
  userName: string;
  contentHtml: string;
  ctaButton?: {
    label: string;
    url: string;
  };
  noteHtml?: string;
}

export function renderBaseEmailLayout(options: BaseEmailLayoutOptions): string {
  const { title, previewText, userName, contentHtml, ctaButton, noteHtml } = options;

  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ''}
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <!-- Header Bar with Brand Primary -->
          <tr>
            <td style="background-color: #0b57d0; padding: 28px 32px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0;">
                      KOS OMI
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                      Sungai Bangek, Padang
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 700; color: #ffffff; background-color: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                      OFFICIAL NOTICE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
                Halo <strong>${userName}</strong>,
              </p>

              <!-- Dynamic Body Content -->
              <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                ${contentHtml}
              </div>

              <!-- CTA Button Section -->
              ${
                ctaButton
                  ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px 0;">
                  <tr>
                    <td align="center">
                      <a href="${ctaButton.url}" target="_blank" style="display: inline-block; background-color: #0b57d0; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        ${ctaButton.label} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              `
                  : ''
              }

              <!-- Additional Security/Info Note Box -->
              ${
                noteHtml
                  ? `
                <div style="margin-top: 24px; padding: 14px 16px; background-color: #f1f5f9; border-radius: 10px; border-left: 4px solid #0b57d0; font-size: 12px; color: #475569; line-height: 1.5;">
                  ${noteHtml}
                </div>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Contact & Verification Strip -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; line-height: 1.5;">
              Butuh bantuan atau kendala sewa? Hubungi Customer Service Pengelola Kos Omi via WhatsApp di <a href="https://wa.me/6281234567890" style="color: #0b57d0; font-weight: 700; text-decoration: none;">+62 812-3456-7890</a>.
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f172a; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #f1f5f9;">
                KOS OMI SUNGAI BANGEK, PADANG
              </p>
              <p style="margin: 0 0 10px 0;">
                Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)
              </p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">
                Email ini dikirim otomatis oleh sistem Kos Omi. Mohon tidak membalas langsung ke alamat ini.<br>
                &copy; ${currentYear} Kos Omi Sungai Bangek. Hak Cipta Dilindungi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
