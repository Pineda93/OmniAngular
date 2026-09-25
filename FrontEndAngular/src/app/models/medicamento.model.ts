export interface Medicamento {
  id: number;
  nombre: string;
  registroSanitario: string; // Autorización DRCPFA
  lote: string;
  fechaVencimiento: string; // YYYY-MM-DD (Base para el algoritmo FEFO)
  cantidad: number; // Unidades
  precioUnitario: number; // En Quetzales (Q) para cálculo financiero en Analytics
  temperatura: string; // Control de Cadena de Frío
  destino: 'IGSS' | 'Hospital Público' | 'Farmacia Privada';
  departamentoDestino: string; // Para el mapa (Guatemala, Quetzaltenango, Escuintla, PETEGOD.)
  estado: 'Disponible' | 'Despachado' | 'Alerta Sanitaria';
  motivoAlerta?: string;
}