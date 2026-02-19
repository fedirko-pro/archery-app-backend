import type { EmailI18n } from './types';

export const es: EmailI18n = {
  footer:
    'Este es un correo electrónico automático. Por favor, no respondas a este mensaje.',

  passwordReset: {
    subject: 'Solicitud de restablecimiento de contraseña',
    heading: 'Solicitud de Restablecimiento de Contraseña',
    hello: 'Hola,',
    body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para establecer una nueva contraseña:',
    ctaLabel: 'Restablecer Contraseña',
    linkFallback:
      'Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 1 hora por razones de seguridad.',
    ignoreNote:
      'Si no solicitaste este restablecimiento de contraseña, ignora este correo.',
  },

  welcome: {
    subject: '¡Bienvenido/a a Archery App!',
    heading: '¡Bienvenido/a a Archery App!',
    greeting: 'Hola {{name}},',
    intro:
      '¡Gracias por unirte a nuestra comunidad de tiro con arco! Estamos encantados de tenerte con nosotros.',
    features: [
      'Completa tu perfil',
      'Únete a competiciones',
      'Sigue tu progreso',
      'Conéctate con otros arqueros',
    ],
    helpNote:
      'Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.',
  },

  invitation: {
    subject: 'Estás invitado/a a Archery App',
    heading: 'Estás Invitado/a a Archery App',
    body: '{{adminName}} ha creado una cuenta para ti en Archery App. Haz clic en el botón de abajo para establecer tu contraseña y comenzar:',
    ctaLabel: 'Establecer Contraseña',
    linkFallback:
      'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    expiry: 'Este enlace caducará en 24 horas.',
    ignoreNote:
      'Si no esperabas esta invitación, puedes ignorar este correo con seguridad.',
  },

  applicationSubmitted: {
    subject: 'Solicitud Enviada – {{tournamentTitle}}',
    heading: 'Solicitud Enviada',
    greeting: 'Hola {{name}},',
    successMessage:
      'Tu solicitud para {{tournamentTitle}} ha sido enviada con éxito.',
    labelTournament: 'Torneo',
    labelDate: 'Fecha',
    labelLocation: 'Ubicación',
    waitMessage:
      'Por favor, espera mientras el administrador revisa tu solicitud. Recibirás otro correo cuando se tome una decisión.',
    ctaLabel: 'Ver Mis Solicitudes',
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  },

  applicationStatus: {
    subjectApproved: 'Solicitud Aprobada – {{tournamentTitle}}',
    subjectRejected: 'Actualización de Solicitud – {{tournamentTitle}}',
    headingApproved: 'Solicitud de Torneo Aprobada ✓',
    headingUpdate: 'Actualización de Solicitud de Torneo',
    greeting: 'Hola {{name}},',
    approvedMessage:
      '¡Buenas noticias! Tu solicitud para {{tournamentTitle}} ha sido aprobada.',
    approvedDetail:
      'Ahora estás registrado/a en este torneo. Revisa los detalles de tu solicitud y prepárate para la competición.',
    approvedLookForward: '¡Esperamos verte allí!',
    rejectedMessage: 'Tu solicitud para {{tournamentTitle}} ha sido revisada.',
    feedbackLabel: 'Comentarios:',
    questionsNote:
      'Si tienes alguna pregunta o inquietud, no dudes en contactarnos.',
    ctaLabel: 'Ver Mis Solicitudes',
  },

  roleChanged: {
    subject: 'Tu función ha sido actualizada – Archery App',
    heading: 'Tu Función Ha Sido Actualizada',
    greeting: 'Hola {{name}},',
    body: '{{adminName}} ha actualizado tu función en Archery App:',
    permissionsHeading: 'Con la función {{role}} puedes:',
    questionsNote:
      'Si tienes alguna pregunta sobre tus nuevos permisos, contacta a tu administrador.',
    ctaLabel: 'Ver Mi Perfil',
    roleLabels: {
      user: 'Usuario',
      club_admin: 'Admin de Club',
      federation_admin: 'Admin de Federación',
      general_admin: 'Admin General',
    },
    rolePermissions: {
      user: [
        'Navegar y ver torneos',
        'Enviar solicitudes a torneos',
        'Ver y gestionar tus propias solicitudes',
        'Editar tu perfil',
      ],
      club_admin: [
        'Crear y editar torneos',
        'Ver y gestionar solicitudes de torneos',
        'Inscribir a otros usuarios en torneos',
        'Crear y editar usuarios',
      ],
      federation_admin: [
        'Crear y editar torneos',
        'Eliminar torneos',
        'Ver y gestionar solicitudes de torneos',
        'Editar y eliminar solicitudes, generar PDFs',
        'Inscribir a otros usuarios en torneos',
        'Crear, editar y eliminar usuarios',
      ],
      general_admin: [
        'Acceso completo a todos los torneos y solicitudes',
        'Crear, editar y eliminar usuarios',
        'Gestionar datos de referencia (categorías, clubes, divisiones, reglas)',
        'Gestionar permisos de función (Control de Acceso)',
        'Todas las demás capacidades administrativas',
      ],
    },
  },
};
