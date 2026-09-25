Módulo de Mapa y Geolocalización

Descripción
Este módulo visualiza la distribución geográfica de los medicamentos en Guatemala mediante un mapa interactivo.

notas//Características
- Marcadores por Centro Médico: Muestra los hospitales y centros de salud (Guatemala, Quetzaltenango, Escuintla, Petén, Izabal, etc.).
- Trazabilidad en Tiempo Real: Carga y actualiza automáticamente los lotes de medicamentos desde `OmniService`.
- Alertas Sanitarias: Resalta en el mapa la ubicación de medicamentos en estado de alerta o inmovilizados.

Consideraciones Técnicas para los demas
- Utiliza la librería **Leaflet** para el renderizado del mapa.
- Las coordenadas de cada centro se gestionan en `modulo-mapa.component.ts`.

"@NOTAS: cambios en archivo app and index"

No instale ninguna librería pesada en el package.json.

Solo modifiqué el index.html agregando el enlace CSS externo de Leaflet para que el mapa renderice los íconos y la interfaz correctamente:
HTML
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
Componente integrado: En app.ts importé el <app-modulo-mapa> para que aparezca al hacer clic en la pestaña "Mapa".

Servicio compartido: El mapa consume los datos directamente del OmniService usando la propiedad departamentoDestino y destino.
"Cualquier duda al hacer el merge me avisan y lo revisamos juntas bellas :D"
