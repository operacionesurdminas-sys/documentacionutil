/*
 Estructura de datos (sin fechas):
 - Sección
   - Subsección
     - Archivos: { title, driveId?, viewUrl?, downloadUrl? }
 Si pasas driveId, se generan automáticamente Ver/Descargar.
*/
const DATA = {
  "ACTAS VARIAS": {
    "ACTAS POR DELITO": [
      { title: "Acta de Inspeccion Ocular", driveId: "1VesvElp7bm0JXCeEJ5h2VH7kX_oO_dKf" },
      { title: "Croquis Ilustrativo", driveId: "1mN9eSlT5_19rYdpd1atne_31eE8B-7Nv" },
      { title: "Acta de Secuestro", driveId: "12IliAH71lzQgeI5WT7CPWRpPLThk3obj" },
      { title: "Acta de Aprehension", driveId: "1Dilf0diKjgUJato3hInhlzhyIyweNx-E" },
      
    ],
    "ACTAS DE CÓDIGO DE CONVIVENCIA CIUDADANA": [
      { title: "Acta de inicio con aprehendido", driveId: "1IULRhkSfNzCyCwhJAlgeYvvd4-eSQDSv" },
      { title: "Acta de inicio sin aprehendido", driveId: "1y3VkgdLZZKI8x_Q8qi1sjOEvwCd3aM3C" }
    ],
    "OTRAS ACTAS": [
      { title: "Planilla Secuestro de Motocicletas", driveId: "EEEEEEEEEEEE" },
      { title: "Recibo de pertenencias", driveId: "EEEEEEEEEEEE" },
      { title: "Planilla de Control Vehicular", driveId: "EEEEEEEEEEEE" },
       { title: "Acta de incautacion de armamento", driveId: "EEEEEEEEEEEE" }
    ],

    "ANEXOS": [
      { title: "Anexo de armas no letales", driveId: "EEEEEEEEEEEE" },
    ]
  },
  "LEYES Y PROTOCOLOS": {
    "LEYES": [
      { title: "Ley 10326  - C.C.C", driveId: "FFFFFFFFFFFF" },
      { title: "Codigo Penal", driveId: "FFFFFFFFFFFF" },
      { title: "Ley 10371 - Control Disciplinario", driveId: "FFFFFFFFFFFF" },
    ],
    "PROTOCOLOS": [
      { title: "Protocolo de Armas Blancas", driveId: "1uer9oF472nayXthN3FwRvDhdZSnenBSA" },
      { title: "Protocolo de Uso Racional de la Fuerza", driveId: "1ZLwgWgdktme07lV8BaoxoZ-7BjIQUajI" },
      { title: "Protocolo de Salud Mental", driveId: "GGGGGGGGGGGG" },

    ]
  }

};

// ---------- Utilidades ----------
const container = document.getElementById('sections');
const STORAGE_KEY = "docutil_open_v3";
const openState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const setOpen = (k, v) => { openState[k] = v; localStorage.setItem(STORAGE_KEY, JSON.stringify(openState)); };

function bi(icon){ return `<i class="bi ${icon}" aria-hidden="true"></i>`; }
function chevron(){ return `<span class="chevron"><i class="bi bi-caret-right-fill"></i></span>`; }

function driveLinks({ driveId, viewUrl, downloadUrl }){
  if (driveId){
    return {
      view: `https://drive.google.com/file/d/${driveId}/preview`,
      download: `https://drive.google.com/uc?export=download&id=${driveId}`,
    };
  }
  return { view: viewUrl || '#', download: downloadUrl || viewUrl || '#' };
}

function countFiles(node){
  let c = 0;
  Object.values(node || {}).forEach(v => {
    if (Array.isArray(v)) c += v.length;
    else if (typeof v === 'object' && v) c += countFiles(v);
  });
  return c;
}

// ---------- Componentes ----------
function makeAccordion(title, key, metaText){
  const wrap = document.createElement('section');
  wrap.className = 'card';

  const btn = document.createElement('button');
  btn.className = 'accordion-btn';
  const expanded = !!openState[key];
  btn.setAttribute('aria-expanded', String(expanded));
  btn.innerHTML = `${chevron()} <span>${title}</span> <span class="meta">${metaText || ''}</span>`;

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.setAttribute('aria-hidden', String(!expanded));

  const inner = document.createElement('div');
  inner.className = 'panel-inner';

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.setAttribute('aria-hidden', String(isOpen));
    setOpen(key, !isOpen);
  });

  wrap.appendChild(btn);
  panel.appendChild(inner);
  wrap.appendChild(panel);
  return { wrap, inner };
}

function renderFileRow(file){
  const row = document.createElement('div');
  row.className = 'file-row';

  const title = document.createElement('div');
  title.textContent = file.title || 'Archivo';
  row.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'file-actions';

  const links = driveLinks(file);
  const view = document.createElement('a');
  view.className = 'btn view';
  view.href = links.view;
  view.target = '_blank';
  view.rel = 'noopener';
  view.innerHTML = `${bi('bi-eye')} Ver`;

  const down = document.createElement('a');
  down.className = 'btn download';
  down.href = links.download;
  down.target = '_blank';
  down.rel = 'noopener';
  down.innerHTML = `${bi('bi-download')} Descargar`;

  actions.appendChild(view);
  actions.appendChild(down);
  row.appendChild(actions);
  return row;
}

function renderSubsection(title, files, parentKey){
  const total = Array.isArray(files) ? files.length : countFiles(files);
  const { wrap, inner } = makeAccordion(title, `${parentKey}::${title}`, `${total} archivo${total!==1?'s':''}`);

  const list = document.createElement('div');
  list.className = 'list';

  (files || []).forEach(f => list.appendChild(renderFileRow(f)));
  inner.appendChild(list);
  return wrap;
}

function renderSection(title, sectionObj){
  const total = countFiles(sectionObj);
  const { wrap, inner } = makeAccordion(title, title, `${total} archivo${total!==1?'s':''}`);

  const subs = Object.keys(sectionObj);
  const ul = document.createElement('ul');
  ul.className = 'list';

  subs.forEach(sub => {
    const subCard = renderSubsection(sub, sectionObj[sub], title);
    ul.appendChild(subCard);
  });

  inner.appendChild(ul);
  return wrap;
}

// ---------- Render ----------
Object.entries(DATA).forEach(([title, obj]) => {
  container.appendChild(renderSection(title, obj));
});
document.getElementById('year').textContent = new Date().getFullYear();
