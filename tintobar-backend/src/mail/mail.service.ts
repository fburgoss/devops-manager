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

    // Aquí defines tu correo, debe ser un dominio verificado o el de prueba
    await this.resend.emails.send({
      from: 'El TintoBar <onboarding@resend.dev>', // Usa este mientras no verifiques dominio
      to: process.env.MAIL_USER || 'f.burgoss1589@gmail.com',
      subject: `📈 Cierre de Caja El TintoBar - ${today}`,
      html: `
        <h1>Reporte Diario</h1>
        <p>Total Recaudado: <strong>$${total.toLocaleString()}</strong></p>
        <p>Tragos Vendidos: <strong>${count} un.</strong></p>
      `,
    });
  }
}
