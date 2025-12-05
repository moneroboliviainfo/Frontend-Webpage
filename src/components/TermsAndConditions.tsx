import React from 'react';

interface TermsAndConditionsProps {
  showTitle?: boolean;
  compact?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
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
            TÉRMINOS Y CONDICIONES DE COMPRA – MONERO
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
            Bienvenido a Monero. Al realizar una compra en nuestra tienda física
            u online, usted acepta los presentes Términos y Condiciones de
            Venta, por lo que recomendamos leerlos cuidadosamente.
          </p>
        </>
      )}

      {/* Section 1 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          1. Información General
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Monero es una marca dedicada a la venta de prendas de vestir y
          accesorios para varón. Estos Términos regulan la relación entre el
          cliente y Monero respecto a la adquisición de productos ofrecidos en
          nuestros puntos de venta físicos y digitales.
        </p>
      </section>

      {/* Section 2 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          2. Productos
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Las características, tallas, colores y materiales de los productos
            están descritos en nuestros canales oficiales.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Puede existir una ligera variación en tonos o texturas debido a
            iluminación, pantalla o procesos de fabricación.
          </li>
          <li>
            Todos los productos están sujetos a disponibilidad. En caso de falta
            de stock previo o posterior a la compra, se notificará al cliente
            para realizar un cambio, reposición o reembolso.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          3. Precios
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Todos los precios están expresados en moneda local (Bolivianos) e
            incluyen los impuestos aplicables según normativa vigente.
          </li>
          <li>
            Monero se reserva el derecho de modificar precios sin previo aviso.
            Las variaciones no afectan compras ya confirmadas.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          4. Pagos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Aceptamos los siguientes métodos de pago:
        </p>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
            marginBottom: '0.75rem',
          }}
        >
          <li>Efectivo</li>
          <li>Transferencias bancarias</li>
          <li>Plataformas digitales autorizadas por Monero</li>
        </ul>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          El pago debe completarse para confirmar la compra.
        </p>
      </section>

      {/* Section 5 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          5. Envíos (si aplica venta online)
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Los costos y tiempos de envío varían según la ubicación del cliente.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Monero no se responsabiliza por retrasos atribuibles a empresas de
            mensajería.
          </li>
          <li>
            En caso de que el paquete llegue dañado, el cliente debe reportarlo
            dentro de 24 horas.
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          6. Cambios y Devoluciones
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Se aceptan cambios dentro de los 7 días posteriores a la compra
            presentando factura y con el producto en perfecto estado, sin uso,
            con etiquetas y empaque original.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            No se realizan devoluciones en efectivo, únicamente cambios por
            productos del mismo valor o superior (pagando la diferencia).
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Productos en descuento, promociones o liquidación no aplican a
            cambio, salvo defecto de fábrica.
          </li>
          <li>
            No se aceptan cambios por daños ocasionados por mal uso o desgaste
            normal.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          7. Garantía
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Las prendas cuentan con garantía por defectos de fabricación por un
            plazo de 15 días desde la compra.
          </li>
          <li>
            La garantía no cubre daños provocados por uso inadecuado, lavado
            incorrecto o manipulación externa.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          8. Privacidad y Datos Personales
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          La información proporcionada por el cliente será utilizada
          exclusivamente para la gestión de compras, entregas y comunicaciones
          comerciales autorizadas. Monero garantiza confidencialidad y
          protección de datos conforme la normativa vigente.
        </p>
      </section>

      {/* Section 9 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          9. Responsabilidad
        </h2>
        <ul
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
            paddingLeft: '1.5rem',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '0.5rem' }}>
            Monero no será responsable por pérdidas indirectas, lucro cesante o
            daños derivados del uso de los productos.
          </li>
          <li>
            El cliente es responsable de verificar tallas, instrucciones de
            cuidado y condiciones del producto al momento de la compra.
          </li>
        </ul>
      </section>

      {/* Section 10 */}
      <section style={{ marginBottom: sectionSpacing }}>
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          10. Modificación de Términos
        </h2>
        <p
          style={{
            fontSize: textSize,
            lineHeight: '1.8',
            color: '#374151',
          }}
        >
          Monero puede actualizar estos Términos y Condiciones en cualquier
          momento. Las modificaciones serán válidas desde su publicación.
        </p>
      </section>

      {/* Last updated */}
      {showTitle && (
        <div
          style={{
            marginTop: compact ? '2rem' : '3rem',
            paddingTop: compact ? '1rem' : '2rem',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            Última actualización: Diciembre 2025
          </p>
        </div>
      )}
    </article>
  );
};

export default TermsAndConditions;
