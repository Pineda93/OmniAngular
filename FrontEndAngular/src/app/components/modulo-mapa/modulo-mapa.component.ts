import { Component, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

import { OmniService } from '../../services/omni.service';
import { Medicamento } from '../../models/medicamento.model';

declare let L: any;

const COORDENADAS_DEPARTAMENTOS: { [key: string]: [number, number] } = {
  'Guatemala': [14.63991530692092, -90.52096009040442],
  'Quetzaltenango': [14.860016317453532, -91.54001712079123],
  'Escuintla': [14.294975319113835, -90.78265214380518],
  'Petén': [16.913522090583303, -89.91298208979818],      
  'Izabal': [15.460210429932761, -88.85936379008118],     
};

@Component({
  selector: 'app-modulo-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: system-ui, sans-serif;">
      <h2 style="color: #0f172a; margin-bottom: 5px;">
        Geolocalización y Trazabilidad por Departamentos (Guatemala)
      </h2>
      <p style="color: #475569; margin-bottom: 15px;">
        Visualización en tiempo real de envíos y estado sanitario de medicamentos según <code>departamentoDestino</code>.
      </p>

      <div id="map" style="height: 520px; width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
    </div>
  `
})
export class ModuloMapaComponent implements AfterViewInit {
  public omniService = inject(OmniService);
  private platformId = inject(PLATFORM_ID);
  private map: any;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  private initMap(): void {
    if (typeof L === 'undefined') return;

    this.map = L.map('map').setView([14.6349, -90.5069], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap - PharmaTrace GT'
    }).addTo(this.map);

    this.cargarMarcadores();
  }

  private cargarMarcadores(): void {
    // Obtenemos el inventario general del servicio
    const listaMedicamentos: Medicamento[] = (this.omniService as any).medicamentosSignal();

    listaMedicamentos.forEach((med) => {
      const coords = COORDENADAS_DEPARTAMENTOS[med.departamentoDestino] || [14.6349, -90.5069];
      const marker = L.marker(coords).addTo(this.map);

      // Asignar color según el estado del lote en el OmniService
      const colorEstado = med.estado === 'Alerta Sanitaria' ? '#dc2626' : (med.estado === 'Despachado' ? '#059669' : '#2563eb');

      const popupContent = `
        <div style="font-size: 13px; line-height: 1.5; font-family: sans-serif;">
          <h4 style="margin: 0 0 5px 0; color: #1e293b;">${med.destino} (${med.departamentoDestino})</h4>
          <b>Medicamento:</b> ${med.nombre}<br>
          <b>Lote:</b> <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 3px;">${med.lote}</code><br>
          <b>Cantidad:</b> ${med.cantidad} unidades<br>
          <b>Temp. Almacenamiento:</b> ${med.temperatura}<br>
          <b>Estado:</b> <span style="font-weight: bold; color: ${colorEstado};">${med.estado}</span>
          ${med.motivoAlerta ? `<br><small style="color: #dc2626;"><b>Motivo:</b> ${med.motivoAlerta}</small>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }
}