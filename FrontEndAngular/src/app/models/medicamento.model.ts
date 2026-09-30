// Existing interface stays exactly the same
export interface Medicamento {
  id: number;
  nombre: string;
  registroSanitario: string;
  lote: string;
  fechaVencimiento: string;
  cantidad: number;
  precioUnitario: number;
  temperatura: string;
  destino: 'IGSS' | 'Hospital Público' | 'Farmacia Privada';
  departamentoDestino: string;
  estado: 'Disponible' | 'Despachado' | 'Alerta Sanitaria';
  motivoAlerta?: string;
}

// New: Split distribution record
export interface DistribucionLote {
  id: number;
  loteOrigen: string;            // Original batch lot number
  medicamentoId: number;         // Reference to the source Medicamento
  nombreMedicamento: string;
  cantidadAsignada: number;
  destinoInstitucion: 'IGSS' | 'Hospital Público' | 'Farmacia Privada';
  departamentoDestino: string;
  fechaDistribucion: string;     // ISO date
  estado: 'Pendiente' | 'En Tránsito' | 'Entregado';
}

// New: Stock alert from hospitals
export interface AlertaStock {
  id: number;
  institucion: string;           // e.g., 'IGSS Central', 'Hospital Roosevelt'
  tipoInstitucion: 'IGSS' | 'Hospital Público' | 'Farmacia Privada';
  departamento: string;
  medicamentoSolicitado: string; // Name of the medicine needed
  cantidadActual: number;        // Current stock they have
  cantidadMinima: number;        // Minimum they should have
  prioridad: 'Crítica' | 'Alta' | 'Media';
  fechaReporte: string;          // ISO date
  estado: 'Pendiente' | 'En Proceso' | 'Resuelta';
  notas?: string;
}