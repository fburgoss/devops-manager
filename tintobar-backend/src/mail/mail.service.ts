import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    // Asegúrate de tener RESEND_API_KEY en tu .env y en Render
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendReport(total: number, count: number) {
    const today = new Date().toLocaleDateString();

    await this.resend.emails.send({
      from: 'El TiintoBar <onboarding@resend.dev>',
      to: process.env.MAIL_USER || 'f.burgoss1589@gmail.com',
      subject: `🍷 Reporte de Cierre - El TintoBar [${today}]`,
      html: `
        <div style="background-color: #121212; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; padding: 40px 20px; border-radius: 8px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #1e1e1e; padding: 30px; border-radius: 12px; border: 1px solid #333333; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            
            <!-- Encabezado / Logo o Título MODIFICADO -->
            <div style="text-align: center; border-bottom: 2px solid #e53935; padding-bottom: 20px; margin-bottom: 25px;">
              
              <!-- AQUI AGREGAMOS TU LOGO -->
              <img src="URL_DE_TU_LOGO" alt="Logo El TintoBar" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
              
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">EL TIINTOBAR</h1>
              <p style="color: #aaaaaa; margin: 5px 0 0 0; font-size: 14px;">Resumen de Cierre Diario</p>
            </div>

            <!-- El resto del contenido sigue igual... -->
            <div style="margin-bottom: 25px;">
              <p style="color: #cccccc; font-size: 15px; margin-bottom: 20px;">Hola, Francisco. Aquí tienes las métricas correspondientes a las ventas registradas el día <strong>${today}</strong>:</p>
              
              <!-- Tarjeta de Totales -->
              <div style="background-color: #2a2a2a; padding: 15px 20px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #aaaaaa; font-size: 14px;">Total Recaudado:</span>
                <span style="color: #4caf50; font-size: 20px; font-weight: bold;">$${total.toLocaleString()}</span>
              </div>

              <div style="background-color: #2a2a2a; padding: 15px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #aaaaaa; font-size: 14px;">Tragos Vendidos:</span>
                <span style="color: #ffffff; font-size: 20px; font-weight: bold;">${count} un.</span>
              </div>
            </div>

            <!-- Pie de página -->
            <div style="text-align: center; border-top: 1px solid #333333; padding-top: 20px; color: #777777; font-size: 12px;">
              <p style="margin: 0;">Generado automáticamente por el sistema de gestión de El TiintoBar.</p>
            </div>

          </div>
        </div>
      `,
    });
  }
}
