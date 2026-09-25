import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modulo-ingreso.component.html',
  styleUrls: ['./modulo-ingreso.component.css']
})
  export class IngresoComponent {
  private fb = inject(FormBuilder);
  public omniService = inject(OmniService);

  // Definición del formulario con validaciones básicas
  public ingresoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    registroSanitario: ['', [Validators.required]], // Ej. Validación simulación MSPAS
    lote: ['', [Validators.required]],
    fechaVencimiento: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0.01, [Validators.required, Validators.min(0.01)]],
    temperatura: ['15°C - 25°C', [Validators.required]],
    destino: ['IGSS', [Validators.required]],
    departamentoDestino: ['Guatemala', [Validators.required]]
  });

  // Listas de datos quemados para poblar los selects de la interfaz (contexto de Guatemala)
  public departamentosGuatemala: string[] = [
    'Guatemala', 'Quetzaltenango', 'Escuintla', 'Alta Verapaz', 
    'San Marcos', 'Huehuetenango', 'Chimaltenango', 'Petén'
  ];

  public institucionesDestino: string[] = [
    'IGSS', 'Hospital Público', 'Farmacia Privada'
  ];

  public registrarLote() {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    // Llamamos al servicio compartido para agregar el lote a la signal global
    this.omniService.agregarLote(this.ingresoForm.value);

    // Limpiamos el formulario tras un ingreso exitoso
    this.ingresoForm.reset({
      cantidad: 1,
      precioUnitario: 0.01,
      temperatura: '15°C - 25°C',
      destino: 'IGSS',
      departamentoDestino: 'Guatemala'
    });
  }
}