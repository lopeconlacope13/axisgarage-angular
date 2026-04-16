import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Página de Condiciones de Servicio de Axis Garage.
 * Define las condiciones del alquiler ficticio: reservas, cancelaciones,
 * responsabilidad y uso permitido del vehículo.
 *
 * NOTA: Este contenido es ficticio. El proyecto es un TFG académico.
 */
@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper">
      <div style="max-width:52rem;margin:0 auto;padding:0 1.5rem;">

        <!-- Eyebrow y título -->
        <div class="eyebrow" style="color:#b8952a;margin-bottom:0.75rem;">LEGAL</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;">
          Terms of <span style="font-style:italic;">Service</span>
        </h1>
        <div class="gold-divider" style="margin-bottom:2rem;"></div>

        <!-- Banner de disclaimer TFG -->
        <div style="background:rgba(184,149,42,0.1);border:1px solid rgba(184,149,42,0.3);padding:1rem;margin-bottom:2rem;border-radius:4px;">
          <p style="color:#b8952a;font-size:0.8rem;text-align:center;margin:0;">
            &#9888; Este sitio es un proyecto académico ficticio desarrollado como Trabajo de Fin de Grado (DAW). No presta servicios reales.
          </p>
        </div>

        <!-- Contenido de las condiciones -->
        <div class="glass-card" style="padding:2rem;display:flex;flex-direction:column;gap:1.75rem;">

          <section>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.75rem;">1. Reservas</h2>
            <p style="color:rgba(245,245,240,0.65);font-size:0.9rem;line-height:1.75;">
              Para realizar una reserva es necesario estar registrado en la plataforma y tener al menos 25 años de edad
              con carné de conducir en vigor. La reserva queda confirmada una vez el equipo de Axis Garage la valida
              manualmente y el cliente recibe el correo de confirmación.
            </p>
          </section>

          <div style="height:1px;background:rgba(245,245,240,0.05);"></div>

          <section>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.75rem;">2. Cancelaciones y modificaciones</h2>
            <p style="color:rgba(245,245,240,0.65);font-size:0.9rem;line-height:1.75;">
              Las cancelaciones realizadas con más de <strong style="color:#f5f5f0;">72 horas</strong> de antelación
              a la fecha de recogida no tienen penalización. Las cancelaciones tardías (menos de 72 horas)
              conllevan un cargo equivalente a un día de alquiler. Las modificaciones de fecha están sujetas
              a disponibilidad del vehículo.
            </p>
          </section>

          <div style="height:1px;background:rgba(245,245,240,0.05);"></div>

          <section>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.75rem;">3. Uso del vehículo</h2>
            <p style="color:rgba(245,245,240,0.65);font-size:0.9rem;line-height:1.75;">
              El cliente se compromete a utilizar el vehículo de forma responsable, respetando las leyes de tráfico
              vigentes. Está prohibido: ceder el vehículo a terceros, participar en competiciones o pruebas de velocidad,
              circular fuera de los países acordados y llevar al vehículo fuera de vías asfaltadas.
            </p>
          </section>

          <div style="height:1px;background:rgba(245,245,240,0.05);"></div>

          <section>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.75rem;">4. Daños y responsabilidad</h2>
            <p style="color:rgba(245,245,240,0.65);font-size:0.9rem;line-height:1.75;">
              El cliente es responsable de los daños que se produzcan durante el período de alquiler que no estén
              cubiertos por la cobertura contratada. La cobertura Standard cubre daños de terceros;
              Premium añade daños propios; Total cubre todo tipo de incidencias sin franquicia.
            </p>
          </section>

          <div style="height:1px;background:rgba(245,245,240,0.05);"></div>

          <section>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.75rem;">5. Ley aplicable</h2>
            <p style="color:rgba(245,245,240,0.65);font-size:0.9rem;line-height:1.75;">
              Estas condiciones se rigen por la legislación española. Para cualquier controversia,
              las partes se someten a los juzgados y tribunales de Madrid capital.
            </p>
          </section>

        </div>

        <p style="color:rgba(245,245,240,0.2);font-size:0.7rem;text-align:center;margin-top:2rem;">
          Última actualización: mayo 2026
        </p>

      </div>
    </div>
  `
})
export class TermsOfServiceComponent {}
