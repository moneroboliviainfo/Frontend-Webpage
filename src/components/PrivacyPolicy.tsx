import React from 'react';

interface PrivacyPolicyProps {
  showTitle?: boolean;
  compact?: boolean;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  showTitle = true,
  compact = false,
}) => {
  const headingSize = compact ? '1.25rem' : '1.5rem';
  const textSize = compact ? '0.9rem' : '1rem';
  const sectionSpacing = compact ? '1.5rem' : '2rem';

  return (
    <article
      style={{
        padding: compact ? '1rem' : '2rem',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Title */}
      {showTitle && (
        <>
          <h1
            style={{
              fontSize: compact ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#111',
              textAlign: 'center',
            }}
          >
            POLÍTICA DE PRIVACIDAD – MONERO
          </h1>

          <p
            style={{
              fontSize: textSize,
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: sectionSpacing,
              textAlign: 'center',
            }}
          >
            En Monero, nos comprometemos a proteger su privacidad y la seguridad
            de sus datos personales. Esta Política de Privacidad explica cómo
            recopilamos, usamos, compartimos y protegemos su información.
          </p>
        </>
      )}

      {/* Section 1: Información que Recopilamos */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          1. Información que Recopilamos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '1rem',
          }}
        >
          Recopilamos la siguiente información personal cuando usted realiza una
          compra o se registra en nuestro sitio:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>
            <strong>Datos de identificación:</strong> Nombre completo, número de
            documento de identidad
          </li>
          <li>
            <strong>Datos de contacto:</strong> Dirección de correo electrónico,
            número de teléfono, dirección postal
          </li>
          <li>
            <strong>Datos de compra:</strong> Historial de pedidos, productos
            adquiridos, preferencias de compra
          </li>
          <li>
            <strong>Datos de pago:</strong> Información necesaria para procesar
            pagos (procesada de forma segura por nuestros proveedores de pago)
          </li>
          <li>
            <strong>Datos de navegación:</strong> Dirección IP, tipo de
            navegador, páginas visitadas, tiempo de navegación
          </li>
        </ul>
      </section>

      {/* Section 2: Cómo Usamos su Información */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          2. Cómo Usamos su Información
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '1rem',
          }}
        >
          Utilizamos sus datos personales para los siguientes propósitos:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>Procesar y gestionar sus pedidos y pagos</li>
          <li>Comunicarnos con usted sobre sus compras y entregas</li>
          <li>Proporcionar servicio al cliente y soporte técnico</li>
          <li>Enviar notificaciones sobre promociones y ofertas especiales</li>
          <li>
            Mejorar nuestros productos, servicios y experiencia de usuario
          </li>
          <li>
            Prevenir fraudes y garantizar la seguridad de nuestros sistemas
          </li>
          <li>Cumplir con obligaciones legales y regulatorias</li>
        </ul>
      </section>

      {/* Section 3: Base Legal para el Tratamiento */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          3. Base Legal para el Tratamiento de Datos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Procesamos sus datos personales en base a:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>
            <strong>Consentimiento:</strong> Cuando usted acepta nuestros
            términos y condiciones
          </li>
          <li>
            <strong>Ejecución de contrato:</strong> Para procesar y entregar sus
            pedidos
          </li>
          <li>
            <strong>Obligación legal:</strong> Para cumplir con requisitos
            fiscales y legales
          </li>
          <li>
            <strong>Interés legítimo:</strong> Para mejorar nuestros servicios y
            prevenir fraudes
          </li>
        </ul>
      </section>

      {/* Section 4: Compartir Información */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          4. Compartir su Información
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '1rem',
          }}
        >
          Podemos compartir su información personal con terceros solo en las
          siguientes circunstancias:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>
            <strong>Proveedores de servicios:</strong> Empresas de envío,
            procesadores de pago, servicios de hosting
          </li>
          <li>
            <strong>Autoridades legales:</strong> Cuando sea requerido por ley o
            para proteger nuestros derechos
          </li>
          <li>
            <strong>Socios comerciales:</strong> Solo con su consentimiento
            explícito para campañas promocionales
          </li>
        </ul>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginTop: '1rem',
          }}
        >
          <strong>Nunca vendemos</strong> su información personal a terceros.
        </p>
      </section>

      {/* Section 5: Seguridad de Datos */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          5. Seguridad de sus Datos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Implementamos medidas técnicas y organizativas apropiadas para
          proteger su información personal contra acceso no autorizado,
          alteración, divulgación o destrucción. Estas medidas incluyen:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>Encriptación SSL/TLS para transmisión de datos</li>
          <li>Sistemas de almacenamiento seguros y respaldados</li>
          <li>Acceso restringido solo a personal autorizado</li>
          <li>Monitoreo continuo de seguridad y actualizaciones</li>
          <li>Protocolos de respuesta ante incidentes de seguridad</li>
        </ul>
      </section>

      {/* Section 6: Retención de Datos */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          6. Retención de Datos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Conservamos su información personal durante el tiempo necesario para
          cumplir con los propósitos descritos en esta política, a menos que la
          ley requiera o permita un período de retención más largo. Los datos de
          compras se conservan durante al menos 5 años por requisitos fiscales y
          contables.
        </p>
      </section>

      {/* Section 7: Sus Derechos */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          7. Sus Derechos de Privacidad
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '1rem',
          }}
        >
          Usted tiene los siguientes derechos respecto a sus datos personales:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li>
            <strong>Derecho de acceso:</strong> Solicitar una copia de sus datos
            personales
          </li>
          <li>
            <strong>Derecho de rectificación:</strong> Corregir datos inexactos
            o incompletos
          </li>
          <li>
            <strong>Derecho de supresión:</strong> Solicitar la eliminación de
            sus datos (con ciertas excepciones)
          </li>
          <li>
            <strong>Derecho de oposición:</strong> Oponerse al procesamiento de
            sus datos para ciertos fines
          </li>
          <li>
            <strong>Derecho de portabilidad:</strong> Recibir sus datos en un
            formato estructurado
          </li>
          <li>
            <strong>Derecho a retirar consentimiento:</strong> En cualquier
            momento, sin afectar la legalidad del procesamiento previo
          </li>
        </ul>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginTop: '1rem',
          }}
        >
          Para ejercer cualquiera de estos derechos, por favor contáctenos a
          través de nuestros canales de atención al cliente.
        </p>
      </section>

      {/* Section 9: Menores de Edad */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          8. Privacidad de Menores
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Nuestros servicios están dirigidos a personas mayores de 18 años. No
          recopilamos intencionalmente información personal de menores de edad
          sin el consentimiento de sus padres o tutores legales. Si descubrimos
          que hemos recopilado datos de un menor sin consentimiento,
          eliminaremos esa información de inmediato.
        </p>
      </section>

      {/* Section 10: Cambios a esta Política */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          9. Cambios a esta Política de Privacidad
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Podemos actualizar esta Política de Privacidad periódicamente para
          reflejar cambios en nuestras prácticas o por razones legales. Le
          notificaremos sobre cambios significativos mediante un aviso en
          nuestro sitio web o por correo electrónico. Le recomendamos revisar
          esta política regularmente.
        </p>
      </section>

      {/* Section 11: Contacto */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#111',
          }}
        >
          10. Contacto
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Si tiene preguntas, inquietudes o solicitudes relacionadas con esta
          Política de Privacidad o el tratamiento de sus datos personales, puede
          contactarnos a través de:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'none',
            marginTop: '1rem',
          }}
        >
          <li>
            <strong>Tienda física:</strong> Calle Destacamento 317 N° 1110,
            Sucre, Bolivia
          </li>
          <li>
            <strong>Horario de atención:</strong> Lunes a Sábado, 9:00 AM - 7:00
            PM
          </li>
          <li>
            <strong>WhatsApp:</strong> Disponible en nuestro sitio web
          </li>
        </ul>
      </section>

      {/* Last Updated */}
      <div
        style={{
          fontSize: compact ? '0.75rem' : '0.875rem',
          color: '#6b7280',
          marginTop: sectionSpacing,
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        Última actualización: Diciembre 2025
      </div>
    </article>
  );
};

export default PrivacyPolicy;
