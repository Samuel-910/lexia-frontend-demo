import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RagService } from '../../services/rag.service';
import { AlertService } from '../../core/services/alert.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchGenericComponent } from '../../shared/components/search-generic/search-generic';

interface LawStructureItem {
  section: string;
  content: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-laws',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, SearchGenericComponent],
  templateUrl: './laws.component.html',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  `]
})
export class LawsComponent implements OnInit {
  documents: string[] = [];
  filteredDocuments: string[] = [];
  searchTerm = '';
  loading = false;

  // Selected Law Structure State
  selectedLaw: string | null = null;
  structure: LawStructureItem[] = [];
  filteredStructure: LawStructureItem[] = [];
  structureSearchTerm = '';
  loadingStructure = false;

  // Pagination State (0-indexed for PaginationComponent)
  currentPage = 0;
  pageSize = 20; // Artículos por página
  totalPages = 0;
  pagedStructure: LawStructureItem[] = [];

  // Opciones de búsqueda para SearchGenericComponent
  searchOptions = [
    { label: 'Todo', value: 'ALL' },
    { label: 'Solo Artículos', value: 'ART' },
    { label: 'Solo Contenido', value: 'CONTENT' }
  ];

  // Metadata para enriquecer visualmente los documentos peruanos
  private documentMetadata: { [key: string]: { title: string, category: string, desc: string, icon: string } } = {
    '1_DECRETO_SUPREMO_003_27_03_1997.pdf': {
      title: 'Ley de Productividad y Competitividad Laboral',
      category: 'Derecho Laboral',
      desc: 'Regula las relaciones laborales individuales de la actividad privada en el Perú, incluyendo contratos de trabajo, causales de despido, e indemnizaciones.',
      icon: 'fas fa-briefcase text-emerald-500'
    },
    '2. Codigo-Civil-MINJUS-BCP_N°3.pdf': {
      title: 'Código Civil (Edición Oficial MINJUS)',
      category: 'Derecho Civil',
      desc: 'El cuerpo normativo civil central de Perú. Regula los derechos de las personas, obligaciones, contratos, sucesiones, actos jurídicos y familia.',
      icon: 'fas fa-book text-blue-500'
    },
    '2. código civil diario .pdf': {
      title: 'Código Civil (Edición Diario El Peruano)',
      category: 'Derecho Civil',
      desc: 'Edición oficial del cuerpo de leyes que norma el derecho privado general en el Perú, orientada a transacciones y propiedad.',
      icon: 'fas fa-book-open text-cyan-500'
    },
    '21621-sep-14-1976.pdf': {
      title: 'Ley de la Empresa Individual de Resp. Limitada (E.I.R.L.)',
      category: 'Derecho Societario',
      desc: 'Decreto Ley Nº 21621. Establece las reglas de constitución, funcionamiento y disolución de la Empresa Individual de Responsabilidad Limitada.',
      icon: 'fas fa-user-tie text-indigo-500'
    },
    '26887-dec-5-1997.pdf': {
      title: 'Ley General de Sociedades (LGS)',
      category: 'Derecho Societario',
      desc: 'Norma principal para la constitución de personas jurídicas societarias (S.A., S.A.C., S.R.L.), juntas de socios y liquidación de empresas.',
      icon: 'fas fa-building text-purple-500'
    },
    '29733.pdf': {
      title: 'Ley de Protección de Datos Personales (LPDP)',
      category: 'Cumplimiento / Privacidad',
      desc: 'Garantiza el derecho fundamental a la protección de datos personales en el Perú, normando su tratamiento en bancos de datos y canales digitales.',
      icon: 'fas fa-shield-halved text-teal-500'
    },
    '3. Código Procesal Civil — D. Leg. N.º 768.pdf': {
      title: 'Código Procesal Civil',
      category: 'Derecho Procesal',
      desc: 'Establece los trámites y procedimientos judiciales para la resolución de conflictos civiles en el territorio nacional.',
      icon: 'fas fa-gavel text-amber-500'
    },
    'DS055_1999EF.pdf': {
      title: 'Texto Único Ordenado de la Ley del IGV e ISC',
      category: 'Derecho Tributario',
      desc: 'Establece el marco normativo para la aplicación del Impuesto General a las Ventas y el Impuesto Selectivo al Consumo en transacciones mercantiles.',
      icon: 'fas fa-percent text-red-500'
    },
    'Decreto Supremo N° 179-2004-EF.pdf.pdf': {
      title: 'Texto Único Ordenado de la Ley del Impuesto a la Renta',
      category: 'Derecho Tributario',
      desc: 'Ley del Impuesto a la Renta de Perú, aplicable a personas y empresas sobre sus ganancias y rentas anuales.',
      icon: 'fas fa-coins text-yellow-500'
    },
    'REGLAMENTO DE INSCRIPCIONES DEL REGISTRO DE PERSONAS JURÍDICAS N°038-2013-SUNARP-SN.pdf': {
      title: 'Reglamento de Inscripciones de Personas Jurídicas',
      category: 'Derecho Registral',
      desc: 'Reglamento de la SUNARP que establece las pautas y requisitos de inscripción registral para sociedades mercantiles y civiles.',
      icon: 'fas fa-file-signature text-orange-500'
    },
    'constitucion.pdf': {
      title: 'Constitución Política del Perú de 1993',
      category: 'Derecho Constitucional',
      desc: 'La carta magna de la República del Perú. Base jerárquica de todo el ordenamiento jurídico, derechos fundamentales y régimen económico.',
      icon: 'fas fa-landmark text-rose-500'
    },
    'mesicic4_per_cod_civil.pdf': {
      title: 'Código Civil (Compilación MESICIC - OEA)',
      category: 'Derecho Civil',
      desc: 'Versión del Código Civil peruano alojada y certificada por el mecanismo de seguimiento de la convención interamericana contra la corrupción.',
      icon: 'fas fa-globe text-violet-500'
    },
    'textoCompleto-TUO-CT.pdf': {
      title: 'Texto Único Ordenado del Código Tributario',
      category: 'Derecho Tributario',
      desc: 'Norma rectora de los principios generales del sistema tributario peruano, procesos de fiscalización de SUNAT y reclamaciones.',
      icon: 'fas fa-scale-balanced text-rose-600'
    },
    'obtenerDocumento (1).pdf': {
      title: 'Ley General de Sociedades (Ley N° 26887)',
      category: 'Derecho Societario',
      desc: 'Regula las diversas formas de sociedades comerciales en el Perú (S.A., S.A.C., S.R.L., etc.), incluyendo su constitución, estatutos, domicilio, duración y disolución.',
      icon: 'fas fa-building text-purple-500'
    },
    'obtenerDocumento (2).pdf': {
      title: 'Ley del Impuesto General a las Ventas (IGV)',
      category: 'Derecho Tributario',
      desc: 'Establece las normas impositivas aplicables a la venta de bienes muebles, prestación de servicios y contratos de construcción en el Perú.',
      icon: 'fas fa-file-invoice-dollar text-red-500'
    }
  };

  constructor(
    private ragService: RagService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadLaws();
  }

  loadLaws() {
    this.loading = true;
    this.ragService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.filterDocuments();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading laws', err);
        this.alertService.error('Error', 'No se pudieron cargar las leyes de la biblioteca.');
        this.loading = false;
      }
    });
  }

  filterDocuments() {
    if (!this.searchTerm.trim()) {
      this.filteredDocuments = [...this.documents];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDocuments = this.documents.filter(doc => {
        const title = this.getDocTitle(doc).toLowerCase();
        const cat = this.getDocCategory(doc).toLowerCase();
        const desc = this.getDocDesc(doc).toLowerCase();
        return title.includes(term) || cat.includes(term) || desc.includes(term) || doc.toLowerCase().includes(term);
      });
    }
  }

  selectLaw(docName: string) {
    this.selectedLaw = docName;
    this.loadingStructure = true;
    this.structure = [];
    this.filteredStructure = [];
    this.pagedStructure = [];
    this.structureSearchTerm = '';
    this.currentPage = 0; // 0-indexed

    this.ragService.getDocumentStructure(docName).subscribe({
      next: (data) => {
        this.structure = data.map((item, idx) => ({
          ...item,
          isExpanded: idx === 0 // Expandir el primer artículo por defecto
        }));
        this.filterStructure();
        this.loadingStructure = false;
      },
      error: (err) => {
        console.error('Error loading law structure', err);
        this.alertService.error('Error', 'No se pudo cargar la estructura interna de esta ley.');
        this.loadingStructure = false;
      }
    });
  }

  filterStructure() {
    this.currentPage = 0; // Reiniciar a página 1 (0-indexed)
    if (!this.structureSearchTerm.trim()) {
      this.filteredStructure = [...this.structure];
    } else {
      const term = this.structureSearchTerm.toLowerCase();
      this.filteredStructure = this.structure.filter(item => 
        item.section.toLowerCase().includes(term) || item.content.toLowerCase().includes(term)
      );
    }
    this.updatePagedStructure();
  }

  onArticleSearch(event: { q: string, type: string }) {
    this.structureSearchTerm = event.q;
    this.currentPage = 0;

    if (!event.q.trim()) {
      this.filteredStructure = [...this.structure];
    } else {
      const term = event.q.toLowerCase();
      this.filteredStructure = this.structure.filter(item => {
        if (event.type === 'ART') {
          return item.section.toLowerCase().includes(term);
        } else if (event.type === 'CONTENT') {
          return item.content.toLowerCase().includes(term);
        } else {
          return item.section.toLowerCase().includes(term) || item.content.toLowerCase().includes(term);
        }
      });
    }
    this.updatePagedStructure();
  }

  updatePagedStructure() {
    this.totalPages = Math.ceil(this.filteredStructure.length / this.pageSize);
    
    if (this.currentPage < 0) this.currentPage = 0;
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }
    
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredStructure.length);
    
    this.pagedStructure = this.filteredStructure.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagedStructure();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.updatePagedStructure();
  }

  closeLawView() {
    this.selectedLaw = null;
    this.structure = [];
    this.filteredStructure = [];
    this.pagedStructure = [];
    this.currentPage = 0;
  }

  toggleArticle(article: LawStructureItem) {
    article.isExpanded = !article.isExpanded;
  }

  // Helpers para metadata amigable
  getDocTitle(doc: string): string {
    return this.documentMetadata[doc]?.title || doc.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  }

  getDocCategory(doc: string): string {
    return this.documentMetadata[doc]?.category || 'Legislación General';
  }

  getDocDesc(doc: string): string {
    return this.documentMetadata[doc]?.desc || 'Documento normativo de la legislación peruana integrado en LexIA para resolver consultas legales.';
  }

  getDocIcon(doc: string): string {
    return this.documentMetadata[doc]?.icon || 'fas fa-file-contract text-slate-500';
  }
}
