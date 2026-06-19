import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private mockDocuments: any[] = [
    {
      id: 1,
      name: 'Contrato de Arrendamiento.pdf',
      type: 'CONTRATO',
      status: 'FIRMADO',
      uploadDate: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Acta Constitutiva.docx',
      type: 'CORPORATIVO',
      status: 'BORRADOR',
      uploadDate: new Date().toISOString()
    }
  ];

  private idCounter = 3;

  constructor() { }

  getDocuments(): Observable<any[]> {
    return of([...this.mockDocuments]).pipe(delay(500));
  }

  createDocument(doc: any): Observable<any> {
    const newDoc = {
      ...doc,
      id: this.idCounter++,
      status: 'NUEVO',
      uploadDate: new Date().toISOString()
    };
    this.mockDocuments.unshift(newDoc);
    return of(newDoc).pipe(delay(800));
  }

  signDocument(id: number, signatureUrl: string): Observable<any> {
    const index = this.mockDocuments.findIndex(d => d.id == id);
    if (index !== -1) {
      this.mockDocuments[index].status = 'FIRMADO';
      this.mockDocuments[index].signatureUrl = signatureUrl;
    }
    return of(this.mockDocuments[index]).pipe(delay(800));
  }

  deleteDocument(id: number): Observable<any> {
    this.mockDocuments = this.mockDocuments.filter(d => d.id != id);
    return of('Documento eliminado').pipe(delay(500));
  }

  analyzeDocument(base64Data: string, fileName: string): Observable<any> {
    // Para Analizar Contrato: El componente espera un objeto con { analysis: string }
    // donde el string es un JSON válido.
    const jsonString = JSON.stringify({
      summary: `El documento "${fileName}" ha sido analizado por LexIA. Es un acuerdo legal estándar con obligaciones recíprocas, pero presenta ciertas cláusulas ambiguas.`,
      keyPoints: [
        'Se establecen penalidades por retraso.',
        'La jurisdicción se somete a los tribunales de Lima.',
        'Existe obligación de confidencialidad mutua.'
      ],
      risks: [
        'La cláusula 4 no especifica un límite máximo para la penalidad por mora.',
        'No se detalla el procedimiento exacto para la resolución del contrato en caso de fuerza mayor.'
      ],
      gaps: [
        'Falta especificar el plazo de preaviso para renovación automática.'
      ],
      recommendation: {
        status: 'negociar',
        text: 'Se recomienda negociar la cláusula 4 para establecer un tope a las penalidades y definir el preaviso de renovación.'
      }
    });

    return of({ analysis: jsonString }).pipe(delay(2500));
  }

  generateDocument(templateId: string, data: any): Observable<any> {
    let content = '';

    if (templateId === 'alquiler') {
      content = `
        <h1 style="text-align: center; color: #1e1b4b;">CONTRATO DE ARRENDAMIENTO DE INMUEBLE</h1>
        <p>Conste por el presente documento, el Contrato de Arrendamiento que celebran de una parte:</p>
        <ul>
          <li><strong>EL ARRENDADOR:</strong> ${data.arrendador || '[Nombre del Arrendador]'}, identificado con DNI N° ${data.dniArrendador || '[DNI]'}.</li>
          <li><strong>EL ARRENDATARIO:</strong> ${data.arrendatario || '[Nombre del Arrendatario]'}, identificado con DNI N° ${data.dniArrendatario || '[DNI]'}.</li>
        </ul>
        <h3>PRIMERA: DEL INMUEBLE</h3>
        <p>EL ARRENDADOR da en alquiler a EL ARRENDATARIO el inmueble ubicado en <strong>${data.direccion || '[Dirección]'}</strong>, el cual se encuentra en buenas condiciones de habitabilidad.</p>
        <h3>SEGUNDA: DE LA RENTA</h3>
        <p>La renta mensual pactada es de <strong>${data.renta || '[Monto]'}</strong>, que EL ARRENDATARIO pagará por adelantado.</p>
        <h3>TERCERA: DE LA DURACIÓN</h3>
        <p>El plazo de duración de este contrato es de un (1) año, computable a partir de la firma del presente documento.</p>
        <br/><br/>
        <p>Suscrito en la ciudad el ${new Date().toLocaleDateString()}.</p>
      `;
    } 
    else if (templateId === 'trabajo') {
      content = `
        <h1 style="text-align: center; color: #065f46;">CONTRATO DE TRABAJO A PLAZO FIJO</h1>
        <p>Entre la empresa <strong>${data.empresa || '[Empresa]'}</strong> (en adelante EL EMPLEADOR) y don/doña <strong>${data.trabajador || '[Trabajador]'}</strong> (en adelante EL TRABAJADOR).</p>
        <p><strong>PRIMERA:</strong> EL TRABAJADOR prestará sus servicios bajo subordinación, cumpliendo la jornada laboral establecida por EL EMPLEADOR.</p>
        <p><strong>SEGUNDA:</strong> EL EMPLEADOR abonará la remuneración acordada, depositándola en la cuenta sueldo del trabajador.</p>
      `;
    }
    else if (templateId === 'nda') {
      content = `
        <h1 style="text-align: center; color: #4c1d95;">ACUERDO DE CONFIDENCIALIDAD (NDA)</h1>
        <p>Entre <strong>${data.parteA || '[Parte Reveladora]'}</strong> y <strong>${data.parteB || '[Parte Receptora]'}</strong>.</p>
        <p><strong>PRIMERA:</strong> La Parte Receptora se compromete a mantener en estricta confidencialidad toda información comercial, técnica o financiera revelada por la Parte Reveladora.</p>
        <p><strong>SEGUNDA:</strong> La obligación de confidencialidad se mantendrá por un plazo de cinco (5) años tras la terminación de cualquier vínculo.</p>
      `;
    }
    else if (templateId === 'servicios') {
      content = `
        <h1 style="text-align: center; color: #92400e;">CONTRATO DE LOCACIÓN DE SERVICIOS</h1>
        <p>Conste por el presente documento, el Contrato de Locación de Servicios que celebran de una parte <strong>${data.cliente || '[Cliente]'}</strong> y de la otra <strong>${data.proveedor || '[Proveedor]'}</strong>.</p>
        <p><strong>PRIMERA:</strong> EL PROVEEDOR se obliga a prestar sus servicios de manera independiente, sin generar vínculo laboral.</p>
      `;
    }
    else if (templateId === 'otros') {
      content = `
        <h1 style="text-align: center; color: #831843;">CONTRATO: ${data.tema || '[Tema del Contrato]'}</h1>
        <p><em>Este contrato ha sido generado de manera automática y simulada por LexIA basado en su solicitud.</em></p>
        <p>Las partes intervinientes acuerdan suscribir el presente documento para formalizar los acuerdos relacionados con <strong>${data.tema || 'la materia en cuestión'}</strong>.</p>
        <p><strong>CLÁUSULA ÚNICA:</strong> Las partes se comprometen a actuar de buena fe en la ejecución de los acuerdos aquí mencionados, rigiéndose por el Código Civil aplicable.</p>
      `;
    }
    else if (templateId === 'constitucion') {
      content = `
        <h1 style="text-align: center; color: #1e293b;">MINUTA DE CONSTITUCIÓN DE SOCIEDAD</h1>
        <h2>SEÑOR NOTARIO PÚBLICO:</h2>
        <p>Sírvase extender en su registro de Escrituras Públicas, una de CONSTITUCIÓN DE SOCIEDAD que otorgan los siguientes socios:</p>
        <p><strong>${data.socios || '[Lista de Socios]'}</strong></p>
        
        <h3>PACTO SOCIAL</h3>
        <p><strong>PRIMERO:</strong> Por el presente Pacto Social, los otorgantes manifiestan su libre voluntad de constituir una sociedad bajo la denominación de <strong>${data.razonSocial || '[Razón Social]'} ${data.tipoSociedad || '[Tipo]'}</strong>.</p>
        <p><strong>SEGUNDO:</strong> El capital social de la empresa es de <strong>S/ ${data.capitalSocial || '[Capital]'}</strong>, el cual se encuentra íntegramente suscrito y pagado por los socios mediante depósitos bancarios.</p>
        <p><strong>TERCERO:</strong> El domicilio de la sociedad se fija en <strong>${data.domicilio || '[Domicilio]'}</strong>, pudiendo establecer sucursales en todo el país.</p>
        
        <h3>ESTATUTO SOCIAL</h3>
        <p><strong>ARTÍCULO 1 - OBJETO SOCIAL:</strong> La sociedad tiene por objeto dedicarse a: <strong>${data.objetoSocial || '[Objeto Social]'}</strong>. Asimismo, podrá realizar todos los actos conexos necesarios para el cumplimiento de sus fines.</p>
        <p><strong>ARTÍCULO 2:</strong> La duración de la sociedad es indeterminada, iniciando sus actividades en la fecha de inscripción en los Registros Públicos.</p>
        ${data.clausulasExtras ? `<br/><h3>CLÁUSULAS ADICIONALES:</h3><p>${data.clausulasExtras}</p>` : ''}
      `;
    }

    return of({ content }).pipe(delay(2000));
  }
}
