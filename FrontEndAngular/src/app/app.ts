import { Component, signal, computed, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { ModuloFarmacovigilanciaComponent } from './components/modulo-farmacovigilancia/modulo-farmacovigilancia.component';
import { ModuloInventarioComponent } from './components/modulo-inventario/modulo-inventario.component';
import { ModuloMapaComponent } from './components/modulo-mapa/modulo-mapa.component';

interface TabDef {
  id: 'farma' | 'ingreso' | 'inventario' | 'mapa' | 'analytics';
  label: string;
}

const ICON_PATHS: Record<TabDef['id'], string> = {
  farma: 'M12 3 L18 6 L18 11 C18 15 15 18 12 21 C9 18 6 15 6 11 L6 6 Z M12 9 L12 15 M9 12 L15 12',
  ingreso: 'M4 12 L8 12 L10 16 L14 16 L16 12 L20 12 M5 12 L6 5 L18 5 L19 12 M4 12 L4 18 C4 18.55 4.45 19 5 19 L19 19 C19.55 19 20 18.55 20 18 L20 12',
  inventario: 'M12 3 L20 7 L20 17 L12 21 L4 17 L4 7 Z M4 7 L12 11 L20 7 M12 11 L12 21',
  mapa: 'M12 21 C12 21 5 14.5 5 10 A7 7 0 0 1 19 10 C19 14.5 12 21 12 21 Z M12 12.5 A2.5 2.5 0 1 0 12 7.5 A2.5 2.5 0 0 0 12 12.5 Z',
  analytics: 'M4 20 L4 10 M10 20 L10 4 M16 20 L16 13 M2 20 L22 20',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ModuloFarmacovigilanciaComponent, ModuloInventarioComponent, ModuloMapaComponent], // aca agregan sus imports colegas de institucion
  
  template: `
    <div class="bg-fx" aria-hidden="true"><span class="pattern"></span></div>

    @if (showSplash()) {
      <div class="splash" [class.splash-exit]="entering()">
        <svg viewBox="0 0 64 64" width="72" height="72">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="var(--primary)" />
          <path d="M32 16v32M16 32h32" stroke="#fff" stroke-width="7" stroke-linecap="round" />
        </svg>
        <h1>OmniFarmacia</h1>
        <p>Gestión y trazabilidad de medicamentos &middot; DRCPFA</p>

        @if (!ready()) {
          <div class="progress-track"><div class="progress-fill" [style.width.%]="progress()"></div></div>
        } @else {
          <button class="enter-btn fade-in" (click)="enterApp()">Entrar a OmniFarmacia</button>
        }
      </div>
    }

    <main class="app-wrapper" [attr.data-theme]="tab()">
      <header class="navbar">
        <div class="brand">
          <svg viewBox="0 0 64 64" width="26" height="26">
            <rect x="4" y="4" width="56" height="56" rx="16" fill="var(--primary)" />
            <path d="M32 16v32M16 32h32" stroke="#fff" stroke-width="7" stroke-linecap="round" />
          </svg>
          <h2>OmniFarmacia</h2>
        </div>

        <nav class="tabs" #tabsNav>
          @for (t of tabDefs; track t.id) {
            <button type="button" [class.active]="tab() === t.id" (click)="selectTab(t.id, $event)">
              <svg class="tab-icon" viewBox="0 0 24 24" width="16" height="16">
                <path [attr.d]="icon(t.id)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ t.label }}
            </button>
          }
          <span class="tab-indicator" [style.left.px]="indicatorLeft()" [style.width.px]="indicatorWidth()"></span>
        </nav>
      </header>

<section class="content-area">
  @if (tab() === 'farma') {
    <app-modulo-farmacovigilancia class="fade-in" />
  } @else if (tab() === 'inventario') {
    <app-modulo-inventario class="fade-in" />
  } @else if (tab() === 'mapa') {
    <app-modulo-mapa class="fade-in" />
  } @else {
    <div class="placeholder fade-in">
      <svg class="placeholder-icon" viewBox="0 0 24 24" width="40" height="40">
        <path [attr.d]="icon(tab())" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h2>Módulo {{ activeLabel() }} en construcción</h2>
      <p>Espacio reservado para que el resto del equipo conecte su componente aquí.</p>
    </div>
  }
</section>
    </main>
  `,
  styles: [`
    :host { display: block; }

    .bg-fx { position: fixed; inset: 0; overflow: hidden; z-index: -1; pointer-events: none; }
    .pattern {
      position: absolute; inset: -10%;
      background-color: color-mix(in srgb, var(--primary) 30%, transparent);
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M28 8h8v20h20v8H36v20h-8V36H8v-8h20z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M28 8h8v20h20v8H36v20h-8V36H8v-8h20z'/%3E%3C/svg%3E");
      -webkit-mask-repeat: repeat; mask-repeat: repeat;
      -webkit-mask-size: 64px 64px; mask-size: 64px 64px;
      animation: drift 22s ease-in-out infinite;
    }

    .splash {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem;
      background: var(--bg-color); text-align: center; padding: 2rem;
      animation: slideIn 0.4s ease;
    }
    .splash-exit { animation: fadeOut 0.4s ease forwards; }
    .splash h1 { color: var(--primary); font-size: 2rem; margin-top: 0.5rem; }
    .splash p { color: var(--text-muted); margin-bottom: 1rem; }
    .progress-track { width: 220px; height: 5px; border-radius: 999px; background: var(--border); overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); transition: width 0.25s ease-out; }
    .enter-btn {
      padding: 0.75rem 1.75rem; border: none; border-radius: 999px;
      background: var(--primary); color: #fff; font-weight: 600; cursor: pointer;
      transition: transform 0.15s ease, background 0.2s ease;
    }
    .enter-btn:hover { background: var(--primary-hover); transform: scale(1.04); }
    .enter-btn:active { transform: scale(0.96); }

    @keyframes fadeOut { to { opacity: 0; } }

    .app-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
    .navbar {
      background: var(--surface); padding: 1rem 2rem; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow);
      position: sticky; top: 0; z-index: 10; flex-wrap: wrap; gap: 1rem;
    }
    .brand { display: flex; align-items: center; gap: 0.5rem; }
    .brand h2 { color: var(--primary); font-size: 1.25rem; transition: color 0.3s ease; }

    .tabs { position: relative; display: flex; gap: 0.25rem; }
    .tabs button {
      background: none; border: none; padding: 0.55rem 1.1rem; cursor: pointer; font-weight: 600;
      color: var(--text-muted); border-radius: var(--radius); display: flex; align-items: center; gap: 0.45rem;
      transition: color 0.2s ease, transform 0.15s ease;
    }
    .tab-icon { flex-shrink: 0; }
    .tabs button:hover { color: var(--primary); transform: scale(1.05); }
    .tabs button.active { color: var(--primary); }
    .tab-indicator {
      position: absolute; bottom: -2px; height: 3px; border-radius: 999px; background: var(--primary);
      transition: left 0.3s ease, width 0.3s ease, background 0.3s ease;
    }

    .content-area { padding: 2rem; flex: 1; }
    .placeholder {
      text-align: center; padding: 4rem 2rem; background: var(--surface); border-radius: var(--radius);
      border: 2px dashed var(--border); color: var(--text-muted);
    }
    .placeholder-icon { color: var(--primary); margin-bottom: 0.75rem; }
    .placeholder h2 { color: var(--primary); margin-bottom: 0.5rem; }

    @media (max-width: 720px) { .navbar { padding: 1rem; } }
  `]
})
export class App {
  @ViewChild('tabsNav') tabsNav?: ElementRef<HTMLElement>;

  tabDefs: TabDef[] = [
    { id: 'farma', label: 'Farmacovigilancia' },
    { id: 'ingreso', label: 'Ingreso' },
    { id: 'inventario', label: 'Inventario FEFO' },
    { id: 'mapa', label: 'Mapa' },
    { id: 'analytics', label: 'Analytics' },
  ];

  tab = signal<TabDef['id']>('farma');
  activeLabel = computed(() => this.tabDefs.find(t => t.id === this.tab())?.label ?? '');

  icon(id: TabDef['id']): string {
    return ICON_PATHS[id];
  }

  showSplash = signal(true);
  entering = signal(false);
  progress = signal(0);
  ready = computed(() => this.progress() >= 100);

  indicatorLeft = signal(0);
  indicatorWidth = signal(0);

  constructor() {
    afterNextRender(() => {
      this.simulateLoading();
      const active = this.tabsNav?.nativeElement.querySelector('button.active') as HTMLElement | null;
      if (active) this.updateIndicator(active);
    });
  }

  private simulateLoading() {
    const step = () => {
      const next = Math.min(100, this.progress() + Math.round(6 + Math.random() * 12));
      this.progress.set(next);
      if (next < 100) setTimeout(step, 120);
    };
    setTimeout(step, 200);
  }

  enterApp() {
    this.entering.set(true);
    setTimeout(() => this.showSplash.set(false), 400);
  }

  selectTab(id: TabDef['id'], event: MouseEvent) {
    this.tab.set(id);
    this.updateIndicator(event.currentTarget as HTMLElement);
  }

  private updateIndicator(btn: HTMLElement) {
    const nav = this.tabsNav?.nativeElement;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    this.indicatorLeft.set(btnRect.left - navRect.left);
    this.indicatorWidth.set(btnRect.width);
  }
}
