import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    // Si no encuentra la variable en el .env, usa un string vacío o tu clave temporal para que no falle al arrancar
    const apiKey = process.env.RESEND_API_KEY || 're_clave_temporal';
    this.resend = new Resend(apiKey);
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
            <div style="text-align: center; border-bottom: 2px solid #e53935; padding-bottom: 20px; margin-bottom: 25px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">EL TIINTOBAR</h1>
              <p style="color: #aaaaaa; margin: 5px 0 0 0; font-size: 14px;">Resumen de Cierre Diario</p>
            </div>
            <div style="margin-bottom: 25px;">
              <p style="color: #cccccc; font-size: 15px; margin-bottom: 20px;">Hola, Francisco. Aquí tienes las métricas correspondientes a las ventas registradas el día <strong>${today}</strong>:</p>
              <div style="background-color: #2a2a2a; padding: 15px 20px; border-radius: 8px; margin-bottom: 12px; display: flex; justifyContent: space-between; alignItems: center;">
                <span style="color: #aaaaaa; font-size: 14px;">Total Recaudado:</span>
                <span style="color: #4caf50; font-size: 20px; font-weight: bold;">$${total.toLocaleString()}</span>
              </div>
              <div style="background-color: #2a2a2a; padding: 15px 20px; border-radius: 8px; display: flex; justifyContent: space-between; alignItems: center;">
                <span style="color: #aaaaaa; font-size: 14px;">Tragos Vendidos:</span>
                <span style="color: #ffffff; font-size: 20px; font-weight: bold;">${count} un.</span>
              </div>
            </div>
            <div style="text-align: center; border-top: 1px solid #333333; padding-top: 20px; color: #777777; font-size: 12px;">
              <p style="margin: 0;">Generado automáticamente por el sistema de gestión de El TiintoBar.</p>
            </div>
          </div>
        </div>
      `,
    });
  }
}
