import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendDailyReport(totalSales: number, salesCount: number) {
    const today = new Date().toLocaleDateString('es-CL');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ff4757; margin: 0;">El TintoBar</h1>
          <p style="color: #a4b0be; font-size: 14px;">Control rápido de transacciones diarias</p>
        </div>
        <div style="background-color: #1e1e1e; padding: 20px; border-radius: 6px; border: 1px solid #2f3542;">
          <h2 style="color: #2ed573; margin-top: 0;">📊 Reporte de Cierre de Día</h2>
          <p><strong>Fecha:</strong> ${today}</p>
          <p><strong>Total de tragos vendidos:</strong> ${salesCount} un.</p>
          <p style="font-size: 18px;"><strong>Recaudación Total:</strong> <span style="color: #2ed573;">$${totalSales.toLocaleString()}</span></p>
        </div>
        <p style="text-align: center; color: #747d8c; font-size: 12px; margin-top: 20px;">
          Este es un correo automático generado por tu aplicación de El TintoBar.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"El TintoBar Bot" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: `📈 Cierre de Caja El TintoBar - ${today}`,
      html: htmlContent,
    });
  }
}
