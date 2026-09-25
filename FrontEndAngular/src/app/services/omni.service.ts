import { Injectable, signal, computed } from '@angular/core';
import { Medicamento } from '../models/medicamento.model';

@Injectable({
  providedIn: 'root'
})
export class OmniService {
  // BASE DE DATOS EN MEMORIA COMPARTIDA
  private medicamentosSignal = signal<Medicamento[]>([
    {
      id: 1,
      nombre: 'Amoxicilina 500mg (Cápsulas)',
      registroSanitario: 'PF-44211-2025',
      lote: 'LOTE-2026-A',
      fechaVencimiento: '2026-10-15',
      cantidad: 5000,
      precioUnitario: 3.50,
      temperatura: '15°C - 25°C',
      destino: 'IGSS',
      departamentoDestino: 'Guatemala',
      estado: 'Disponible'
    },
    {
      id: 2,
      nombre: 'Amoxicilina 500mg (Cápsulas)',
      registroSanitario: 'PF-44211-2025',
      lote: 'LOTE-2027-B',
      fechaVencimiento: '2027-04-20',
      cantidad: 12000,
      precioUnitario: 3.50,
      temperatura: '15°C - 25°C',
      destino: 'Hospital Público',
      departamentoDestino: 'Quetzaltenango',
      estado: 'Disponible'
    },
    {
      id: 3,
      nombre: 'Insulina Humana NPH (Cadena de Frío)',
      registroSanitario: 'PF-00921-2024',
      lote: 'LOTE-COLD-01',
      fechaVencimiento: '2026-11-01',
      cantidad: 850,
      precioUnitario: 145.00,
      temperatura: '2°C - 8°C (Sensible)',
      destino: 'IGSS',
      departamentoDestino: 'Escuintla',
      estado: 'Disponible'
    },
    {
      id: 4,
      nombre: 'Paracetamol Jarabe 120mg/5ml',
      registroSanitario: 'PF-88123-2023',
      lote: 'LOTE-SUSPECT-99',
      fechaVencimiento: '2026-12-30',
      cantidad: 1200,
      precioUnitario: 18.00,
      temperatura: '15°C - 30°C',
      destino: 'Farmacia Privada',
      departamentoDestino: 'Guatemala',
      estado: 'Alerta Sanitaria',
      motivoAlerta: 'Reporte DRCPFA: Sospecha de alteración en etiqueta y sello de seguridad.'
    },
    {
      id: 5,
      nombre: 'Suero Oral Electrolitos',
      registroSanitario: 'PF-11200-2025',
      lote: 'LOTE-PETEN-01',
      fechaVencimiento: '2027-01-10',
      cantidad: 3000,
      precioUnitario: 12.50,
      temperatura: '15°C - 30°C',
      destino: 'Hospital Público',
      departamentoDestino: 'Petén',
      estado: 'Disponible'
    },
    {
      id: 6,
      nombre: 'Cefalexina 500mg',
      registroSanitario: 'PF-99100-2024',
      lote: 'LOTE-IZABAL-02',
      fechaVencimiento: '2026-12-01',
      cantidad: 1500,
      precioUnitario: 25.00,
      temperatura: '15°C - 25°C',
      destino: 'Hospital Público',
      departamentoDestino: 'Izabal',
      estado: 'Disponible'
    }
  ]);

  public mensajeError = signal<string | null>(null);
  public mensajeExito = signal<string | null>(null);

  // ORDENAMIENTO AUTOMÁTICO FEFO
  public inventarioFEFO = computed(() => {
    return [...this.medicamentosSignal()].sort((a, b) => 
      new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
    );
  });

  public totalRegistros = computed(() => this.medicamentosSignal().length);
  public disponibles = computed(() => this.medicamentosSignal().filter(m => m.estado === 'Disponible').length);
  public alertasActivas = computed(() => this.medicamentosSignal().filter(m => m.estado === 'Alerta Sanitaria').length);

  // MÉTODOS DE OPERACIÓN PARA CADA INTEGRANTE

  // Integrante 1 (Ingreso)
  public agregarLote(nuevo: Omit<Medicamento, 'id' | 'estado'>) {
    const registro: Medicamento = {
      ...nuevo,
      id: Date.now(),
      estado: 'Disponible'
    };
    this.medicamentosSignal.update(list => [...list, registro]);
    this.mensajeExito.set(`Lote ${registro.lote} de ${registro.nombre} correctamente ingresado al sistema.`);
  }

  // Integrante 2 (FEFO)
  public despacharLoteFEFO(item: Medicamento): boolean {
    const loteMasAntiguo = this.inventarioFEFO().find(m => 
      m.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim() &&
      m.estado === 'Disponible' &&
      new Date(m.fechaVencimiento) < new Date(item.fechaVencimiento)
    );

    if (loteMasAntiguo) {
      this.mensajeError.set(
        `Violación FEFO: No puedes despachar el lote [${item.lote}]. Existe el lote [${loteMasAntiguo.lote}] con vencimiento más cercano (${loteMasAntiguo.fechaVencimiento}) que debe salir primero.`
      );
      return false;
    }

    this.medicamentosSignal.update(list =>
      list.map(m => m.id === item.id ? { ...m, estado: 'Despachado' } : m)
    );
    this.mensajeExito.set(`Despacho autorizado del lote [${item.lote}] hacia ${item.destino} (${item.departamentoDestino}).`);
    return true;
  }

  // Integrante 3 (Farmacovigilancia)
  public emitirAlertaSanitaria(lote: string, motivo: string) {
    this.medicamentosSignal.update(list =>
      list.map(m => m.lote === lote ? { ...m, estado: 'Alerta Sanitaria', motivoAlerta: motivo } : m)
    );
    this.mensajeError.set(`ALERTA SANITARIA DRCPFA: Lote [${lote}] inmovilizado a nivel nacional.`);
  }

  public resolverAlerta(id: number) {
    this.medicamentosSignal.update(list =>
      list.map(m => m.id === id ? { ...m, estado: 'Disponible', motivoAlerta: undefined } : m)
    );
    this.mensajeExito.set('El lote ha sido verificado y rehabilitado para su distribución.');
  }

  public limpiarMensajes() {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
  }
}