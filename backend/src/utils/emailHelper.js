// backend/src/utils/emailHelper.js
const fs = require('fs');
const path = require('path');
const { transporter, defaultFrom, isSmtpConfigured } = require('../config/mailer');

// Rutas a las vistas del correo
const htmlTemplatePath = path.join(__dirname, '../views/emails/bienvenida.html');
const txtTemplatePath = path.join(__dirname, '../views/emails/bienvenida.txt');

// Caché en memoria para evitar lecturas continuas a disco
let htmlTemplateCache = null;
let txtTemplateCache = null;

const cargarPlantillas = () => {
  if (!htmlTemplateCache) {
    htmlTemplateCache = fs.readFileSync(htmlTemplatePath, 'utf-8');
  }
  if (!txtTemplateCache) {
    txtTemplateCache = fs.readFileSync(txtTemplatePath, 'utf-8');
  }
  return {
    htmlTemplate: htmlTemplateCache,
    txtTemplate: txtTemplateCache,
  };
};

/**
 * Reemplaza variables en formato {{clave}} por su valor
 */
const interpolarPlantilla = (plantilla, variables) => {
  return Object.entries(variables).reduce((resultado, [clave, valor]) => {
    const regex = new RegExp(`{{${clave}}}`, 'g');
    return resultado.replace(regex, valor || '');
  }, plantilla);
};

/**
 * Envía el correo de bienvenida de forma asíncrona y segura (sin lanzar excepciones).
 *
 * @param {Object} params
 * @param {string} params.correo - Dirección de correo del destinatario
 * @param {string} [params.nombre] - Nombre del alumno
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const enviarCorreoBienvenida = async ({ correo, nombre }) => {
  if (!correo) {
    console.warn('[EmailHelper] No se especificó correo para el envío de bienvenida.');
    return { success: false, error: 'Correo no especificado' };
  }

  try {
    const { htmlTemplate, txtTemplate } = cargarPlantillas();

    const loginUrl =
      process.env.FRONTEND_URL ||
      'https://skillup-campus.vercel.app';

    const variables = {
      nombre: (nombre && nombre.trim()) || 'Estudiante',
      loginUrl,
      currentYear: new Date().getFullYear().toString(),
    };

    const htmlContent = interpolarPlantilla(htmlTemplate, variables);
    const txtContent = interpolarPlantilla(txtTemplate, variables);

    const mailOptions = {
      from: defaultFrom,
      to: correo,
      subject: '¡Te damos la bienvenida a SkillUp Campus! 🎓',
      text: txtContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    if (isSmtpConfigured) {
      console.log(
        `[EmailHelper] Correo de bienvenida enviado con éxito a ${correo}. ID: ${info.messageId}`
      );
    } else {
      console.log(
        `[EmailHelper] [Modo Simulación] Correo de bienvenida preparado para ${correo}:`,
        info.message ? JSON.parse(info.message).subject : 'Enviado a stream'
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Aislamiento total: logueamos el error sin interrumpir el proceso que invocó la función
    console.error(
      `[EmailHelper] Error al enviar correo de bienvenida a ${correo}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};

module.exports = {
  enviarCorreoBienvenida,
};

