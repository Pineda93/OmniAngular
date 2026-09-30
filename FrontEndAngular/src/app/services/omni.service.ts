import { Injectable, signal, computed } from '@angular/core';
import { Medicamento, DistribucionLote, AlertaStock } from '../models/medicamento.model';

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

  private distribucionesSignal = signal<DistribucionLote[]>([
    { id: 1, loteOrigen: 'LOTE-2026-A', medicamentoId: 1, nombreMedicamento: 'Amoxicilina 500mg (Cápsulas)', cantidadAsignada: 2000, destinoInstitucion: 'IGSS', departamentoDestino: 'Guatemala', fechaDistribucion: '2026-09-28', estado: 'En Tránsito' },
    { id: 2, loteOrigen: 'LOTE-2026-A', medicamentoId: 1, nombreMedicamento: 'Amoxicilina 500mg (Cápsulas)', cantidadAsignada: 1000, destinoInstitucion: 'Hospital Público', departamentoDestino: 'Quetzaltenango', fechaDistribucion: '2026-09-28', estado: 'Pendiente' }
  ]);

  private alertasStockSignal = signal<AlertaStock[]>([
    { id: 1, institucion: 'Hospital Roosevelt', tipoInstitucion: 'Hospital Público', departamento: 'Guatemala', medicamentoSolicitado: 'Amoxicilina 500mg (Cápsulas)', cantidadActual: 50, cantidadMinima: 500, prioridad: 'Crítica', fechaReporte: '2026-09-29', estado: 'Pendiente', notas: 'Stock casi agotado, se necesita reabastecimiento urgente.' },
    { id: 2, institucion: 'IGSS Zona 9', tipoInstitucion: 'IGSS', departamento: 'Guatemala', medicamentoSolicitado: 'Insulina Humana NPH (Cadena de Frío)', cantidadActual: 120, cantidadMinima: 300, prioridad: 'Alta', fechaReporte: '2026-09-29', estado: 'En Proceso' },
    { id: 3, institucion: 'Hospital Regional de Escuintla', tipoInstitucion: 'Hospital Público', departamento: 'Escuintla', medicamentoSolicitado: 'Suero Oral Electrolitos', cantidadActual: 200, cantidadMinima: 400, prioridad: 'Media', fechaReporte: '2026-09-28', estado: 'Pendiente' }
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

  public distribuciones = computed(() => this.distribucionesSignal());
  public alertasStock = computed(() => this.alertasStockSignal());
  public alertasStockPendientes = computed(() => this.alertasStockSignal().filter(a => a.estado !== 'Resuelta').length);

  // UMBRAL DE STOCK BAJO (si la cantidad cae por debajo de este número, se genera alerta automática)
  private readonly UMBRAL_CRITICO = 200;
  private readonly UMBRAL_ALTO = 500;
  private readonly UMBRAL_MEDIO = 1000;

  // Alertas automáticas generadas por detección de stock bajo en inventario
  public alertasAutomaticas = computed(() => {
    const medicamentos = this.medicamentosSignal();
    const alertas: {
      medicamento: string;
      lote: string;
      cantidad: number;
      destino: string;
      departamento: string;
      prioridad: 'Crítica' | 'Alta' | 'Media';
      mensaje: string;
    }[] = [];

    medicamentos.forEach(med => {
      if (med.estado !== 'Disponible') return;

      if (med.cantidad <= this.UMBRAL_CRITICO) {
        alertas.push({
          medicamento: med.nombre,
          lote: med.lote,
          cantidad: med.cantidad,
          destino: med.destino,
          departamento: med.departamentoDestino,
          prioridad: 'Crítica',
          mensaje: `Stock crítico: Solo quedan ${med.cantidad} unidades. Reabastecimiento urgente requerido.`
        });
      } else if (med.cantidad <= this.UMBRAL_ALTO) {
        alertas.push({
          medicamento: med.nombre,
          lote: med.lote,
          cantidad: med.cantidad,
          destino: med.destino,
          departamento: med.departamentoDestino,
          prioridad: 'Alta',
          mensaje: `Stock bajo: ${med.cantidad} unidades restantes. Planificar reabastecimiento.`
        });
      } else if (med.cantidad <= this.UMBRAL_MEDIO) {
        alertas.push({
          medicamento: med.nombre,
          lote: med.lote,
          cantidad: med.cantidad,
          destino: med.destino,
          departamento: med.departamentoDestino,
          prioridad: 'Media',
          mensaje: `Stock moderado: ${med.cantidad} unidades. Monitorear niveles.`
        });
      }
    });

    return alertas.sort((a, b) => {
      const orden = { 'Crítica': 0, 'Alta': 1, 'Media': 2 };
      return orden[a.prioridad] - orden[b.prioridad];
    });
  });

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

  // MÉTODOS NUEVOS

  public dividirLote(medicamentoId: number, asignaciones: {cantidad: number, destino: 'IGSS' | 'Hospital Público' | 'Farmacia Privada', departamento: string}[]) {
    const medicamento = this.medicamentosSignal().find(m => m.id === medicamentoId);
    if (!medicamento) {
      this.mensajeError.set('Medicamento no encontrado.');
      return;
    }

    const totalAsignado = asignaciones.reduce((sum, a) => sum + a.cantidad, 0);
    if (totalAsignado > medicamento.cantidad) {
      this.mensajeError.set(`Cantidad total asignada (${totalAsignado}) excede la cantidad disponible (${medicamento.cantidad}).`);
      return;
    }

    const nuevasDistribuciones: DistribucionLote[] = asignaciones.map((a, i) => ({
      id: Date.now() + i,
      loteOrigen: medicamento.lote,
      medicamentoId: medicamento.id,
      nombreMedicamento: medicamento.nombre,
      cantidadAsignada: a.cantidad,
      destinoInstitucion: a.destino,
      departamentoDestino: a.departamento,
      fechaDistribucion: new Date().toISOString().split('T')[0],
      estado: 'Pendiente'
    }));

    this.distribucionesSignal.update(list => [...list, ...nuevasDistribuciones]);
    
    this.medicamentosSignal.update(list => 
      list.map(m => m.id === medicamentoId ? { ...m, cantidad: m.cantidad - totalAsignado } : m)
    );

    this.mensajeExito.set(`Lote [${medicamento.lote}] fraccionado en ${asignaciones.length} destinos correctamente.`);
  }

  public actualizarEstadoDistribucion(id: number, nuevoEstado: 'Pendiente' | 'En Tránsito' | 'Entregado') {
    this.distribucionesSignal.update(list =>
      list.map(d => d.id === id ? { ...d, estado: nuevoEstado } : d)
    );
  }

  public reportarAlertaStock(alerta: Omit<AlertaStock, 'id' | 'fechaReporte' | 'estado'>) {
    const nuevaAlerta: AlertaStock = {
      ...alerta,
      id: Date.now(),
      fechaReporte: new Date().toISOString().split('T')[0],
      estado: 'Pendiente'
    };
    this.alertasStockSignal.update(list => [...list, nuevaAlerta]);
    this.mensajeExito.set('Alerta de stock reportada exitosamente.');
  }

  public atenderAlertaStock(id: number) {
    this.alertasStockSignal.update(list =>
      list.map(a => a.id === id ? { ...a, estado: 'En Proceso' } : a)
    );
  }

  public resolverAlertaStock(id: number) {
    this.alertasStockSignal.update(list =>
      list.map(a => a.id === id ? { ...a, estado: 'Resuelta' } : a)
    );
  }

  public getMedicamentosDisponibles() {
    return this.medicamentosSignal().filter(m => m.estado === 'Disponible' && m.cantidad > 0);
  }
}