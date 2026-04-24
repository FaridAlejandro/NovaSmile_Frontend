/**
 * Nova Smile PRO — Módulo Odontólogo
 * - Odontograma interactivo con 5 superficies por diente
 * - Historia y Planes: evaluación clínica + diagnóstico + timeline
 * - Agenda lateral
 * - Pacientes sincronizados con localStorage (mismos datos del Admin)
 */
import React, { useState, useEffect } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Calcula edad a partir de fecha de nacimiento ISO (YYYY-MM-DD) */
function calcEdad(fnac) {
  if (!fnac) return '—';
  const hoy = new Date();
  const nac = new Date(fnac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Convierte campo alergias en array de alertas para mostrar badges */
function getAlertas(pac) {
  const alerts = [];
  if (pac.alergias && pac.alergias.toLowerCase() !== 'ninguna' && pac.alergias.trim() !== '') {
    pac.alergias.split(',').forEach(a => { if (a.trim()) alerts.push(a.trim()); });
  }
  return alerts;
}

/** Lee pacientes desde localStorage (guardados por AdminPage) */
function leerPacientes() {
  try {
    return JSON.parse(localStorage.getItem('ns_pacientes')) || PACIENTES_FALLBACK;
  } catch { return PACIENTES_FALLBACK; }
}

/** Lee citas desde localStorage (guardadas por RecepcionPage) */
function leerCitasHoy() {
  try {
    const citas = JSON.parse(localStorage.getItem('ns_citas')) || [];
    const hoy = new Date().toISOString().slice(0, 10);
    // Mostrar citas de hoy O todas si no hay de hoy (demo)
    const citasHoy = citas.filter(c => c.fecha === hoy);
    return citasHoy.length > 0 ? citasHoy : citas.slice(0, 3);
  } catch { return AGENDA_FALLBACK; }
}

// ── Datos de respaldo si localStorage está vacío ──────────────────────────────
const PACIENTES_FALLBACK = [
  { doc: '80543221', nombre: 'Carlos Ruiz',   tel: '3104567890', correo: 'carlos@correo.com', fnac: '1992-06-15', eps: 'Sura',      alergias: 'Hipertenso, Fumador ocasional', fechaReg: '2026-01-10', estado: 'Activo' },
  { doc: '44556677', nombre: 'Ana Beltrán',   tel: '3209876543', correo: 'ana@correo.com',    fnac: '1996-03-22', eps: 'Sanitas',   alergias: 'Penicilina',                   fechaReg: '2026-02-05', estado: 'Activo' },
  { doc: '1116818960',nombre:'Alix Guerrero', tel: '3132548800', correo: 'alix@correo.com',   fnac: '1990-05-12', eps: 'Nueva EPS', alergias: 'Ninguna',                      fechaReg: '2026-01-15', estado: 'Activo' },
];

const AGENDA_FALLBACK = [
  { id: 1, pacienteDoc: '80543221', paciente: 'Carlos Ruiz', servicio: 'Control Endodoncia', hora: '09:00', estado: 'Espera', fecha: new Date().toISOString().slice(0,10) },
  { id: 2, pacienteDoc: '44556677', paciente: 'Ana Beltrán',  servicio: 'Evaluación inicial', hora: '10:30', estado: 'Espera', fecha: new Date().toISOString().slice(0,10) },
];

// ── Historial clínico (en sesión — en producción vendría del backend) ──────────
const HISTORIAL_INIT = {
  '80543221': [
    { id: 1, fecha: '10/3/2026', diag: 'Caries',            trata: 'Obturación con resina',         piezas: '16, 17', estado: 'pending', proxcita: '15/4/2026' },
    { id: 2, fecha: '23/2/2026', diag: 'Control endodoncia', trata: 'Verificación post-tratamiento', piezas: '36',     estado: 'done',    proxcita: '10/3/2026' },
  ],
  '44556677': [],
};

// ── Odontograma: piezas dentales adulto (numeración FDI) ─────────────────────
const FILA_SUP_DER = [18,17,16,15,14,13,12,11];
const FILA_SUP_IZQ = [21,22,23,24,25,26,27,28];
const FILA_INF_IZQ = [48,47,46,45,44,43,42,41];
const FILA_INF_DER = [31,32,33,34,35,36,37,38];

const ESTADOS_DIENTE = {
  sano:    { bg:'#ffffff', border:'#adb5bd', symbol: null },
  caries:  { bg:'#ff4d4d', border:'#c0392b', symbol: null },
  tratado: { bg:'#4d94ff', border:'#1a56db', symbol: null },
  ausente: { bg:'#212529', border:'#000',    symbol: '×'  },
};

const ALERTA_BG = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6'];

const AGENDA_COLORS = {
  Espera:   { bg:'#fff8e1', border:'#f59e0b', badge:'#f59e0b' },
  Atendido: { bg:'#e8f5e9', border:'#22c55e', badge:'#22c55e' },
};

const ESTADO_PLAN_LABEL = { pending:'Pendiente', progress:'En proceso', done:'Completado' };
const ESTADO_PLAN_COLOR = {
  pending:  { bg:'#fef9c3', color:'#854d0e' },
  progress: { bg:'#dbeafe', color:'#1e40af' },
  done:     { bg:'#dcfce7', color:'#15803d' },
};

// ── Superficie individual (flecha direccional) ────────────────────────────────
// Superficies: v=vestibular(arriba), l=lingual(abajo), m=mesial(izq), d=distal(der), o=oclusal(centro)
const SUP_STYLE = {
  v: { // Vestibular — triángulo arriba
    clip: 'polygon(0% 0%, 100% 0%, 50% 50%)',
    top:0, left:0, right:0, height:'40%',
  },
  l: { // Lingual — triángulo abajo
    clip: 'polygon(0% 100%, 100% 100%, 50% 50%)',
    bottom:0, left:0, right:0, height:'40%',
  },
  m: { // Mesial — triángulo izquierda
    clip: 'polygon(0% 0%, 50% 50%, 0% 100%)',
    top:0, left:0, bottom:0, width:'40%',
  },
  d: { // Distal — triángulo derecha
    clip: 'polygon(100% 0%, 50% 50%, 100% 100%)',
    top:0, right:0, bottom:0, width:'40%',
  },
  o: { // Oclusal — centro
    top:'30%', left:'30%', right:'30%', bottom:'30%',
  },
};

// Colores por estado para superficies
const SUP_COLORS = {
  sano:    { fill:'#ffffff', active:'#e0f2fe', border:'#adb5bd' },
  caries:  { fill:'#ff4d4d', active:'#ff4d4d', border:'#c0392b' },
  tratado: { fill:'#4d94ff', active:'#4d94ff', border:'#1a56db' },
};

// Iconos de flecha SVG por superficie
function FlechaSup({ tipo, size = 8 }) {
  const paths = {
    v: 'M5,8 L10,2 L15,8',   // ↑ arriba
    l: 'M5,2 L10,8 L15,2',   // ↓ abajo
    m: 'M8,5 L2,10 L8,15',   // ← izquierda
    d: 'M2,5 L8,10 L2,15',   // → derecha
  };
  if (!paths[tipo]) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', opacity:.5 }}>
      <polyline points={paths[tipo].replace(/[A-Z]/g,'').split(' ').join(' ')}
        stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// ── Diente individual con 5 superficies ───────────────────────────────────────
function Diente({ num, superficies, marca, onClickSup, ausente, onToggleAusente }) {
  // Si el modo activo es 'ausente', el click en el cuadro también lo marca
  const handleClick = (s) => {
    if (marca === 'ausente') { onToggleAusente(); return; }
    onClickSup(s);
  };

  return (
    <div style={{ textAlign:'center', userSelect:'none', width:36 }}>
      {/* Número del diente */}
      <div
        title={ausente ? 'Quitar ausente' : 'Marcar ausente'}
        onClick={onToggleAusente}
        style={{
          fontSize:'.6rem', color: ausente ? '#dc3545' : '#6c757d',
          marginBottom:2, lineHeight:1, cursor:'pointer',
          fontWeight: ausente ? 700 : 400,
        }}
      >
        {num}
      </div>

      {/* Cuadro dental con 5 superficies */}
      <div style={{
        width:30, height:30, margin:'0 auto', position:'relative',
        border: `2px solid ${ausente ? '#dc3545' : '#adb5bd'}`,
        borderRadius:3, overflow:'hidden',
        background: ausente ? '#212529' : '#f8f9fa',
        cursor: marca === 'ausente' ? 'pointer' : 'default',
      }}
        onClick={marca === 'ausente' ? onToggleAusente : undefined}
      >
        {ausente ? (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:900, fontSize:13, lineHeight:1,
          }}>×</div>
        ) : (
          ['v','l','m','d','o'].map(s => {
            const st = SUP_STYLE[s];
            const estadoSup = superficies[s] || 'sano';
            const col = SUP_COLORS[estadoSup] || SUP_COLORS.sano;
            return (
              <div
                key={s}
                onClick={() => onClickSup(s)}
                title={`Superficie ${s.toUpperCase()} — ${estadoSup}`}
                style={{
                  position:'absolute',
                  clipPath: st.clip ? st.clip : undefined,
                  background: col.fill,
                  border: s === 'o' ? `1px solid ${col.border}` : undefined,
                  top:    st.top    ?? undefined,
                  left:   st.left   ?? undefined,
                  right:  st.right  ?? undefined,
                  bottom: st.bottom ?? undefined,
                  width:  st.width  ?? (s==='o' ? undefined : '100%'),
                  height: st.height ?? (s==='o' ? undefined : '100%'),
                  cursor:'pointer',
                  transition:'background .1s',
                  boxSizing:'border-box',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Botón de estado del odontograma ──────────────────────────────────────────
function EstadoBtn({ id, label, dot, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, width:'100%',
      padding:'8px 12px', marginBottom:5, borderRadius:8, cursor:'pointer',
      fontSize:'.83rem', fontWeight: active ? 700 : 500,
      background: active && id==='sano' ? '#495057'
               : active && id==='ausente' ? '#212529'
               : active ? 'white' : 'white',
      color: (active && (id==='sano'||id==='ausente')) ? 'white' : '#374151',
      border:`1.5px solid ${active ? (dot||(id==='sano'?'#495057':'#212529')) : '#dee2e6'}`,
      transition:'all .12s',
    }}>
      {dot && <span style={{ width:12,height:12,borderRadius:'50%',background:dot,display:'inline-block',flexShrink:0 }}/>}
      {icon && !dot && <i className={`bi ${icon}`} style={{fontSize:'.85rem'}}/>}
      {label}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OdontologoPage({ session, onLogout }) {
  // ── Datos sincronizados desde localStorage ───────────────────────────────
  const [pacientesDB, setPacientesDB] = useState(() => leerPacientes());
  const [agendaDB,    setAgendaDB]    = useState(() => {
    const citas = leerCitasHoy();
    // Adaptar formato de citas al formato de agenda del odontólogo
    return citas.map((c, i) => ({
      id:          c.id || i + 1,
      pacienteDoc: c.doc || c.pacienteDoc || '',
      paciente:    c.paciente || c.nombre || '',
      servicio:    c.tratamiento || c.servicio || 'Consulta',
      hora:        c.hora || '08:00',
      estado:      c.estado === 'Confirmada' ? 'Espera' : c.estado === 'Cancelada' ? 'Cancelada' : 'Espera',
      fecha:       c.fecha || '',
    }));
  });

  // Si la agenda queda vacía, usar el fallback
  const agenda = agendaDB.length > 0 ? agendaDB : AGENDA_FALLBACK;

  // Primer paciente de la agenda
  const primerDoc = agenda[0]?.pacienteDoc || agenda[0]?.pacienteId || '';
  const primerPac = pacientesDB.find(p => p.doc === primerDoc) || pacientesDB[0] || PACIENTES_FALLBACK[0];

  const [citaActiva, setCitaActiva] = useState(agenda[0]);
  const [paciente,   setPaciente]   = useState(primerPac);
  const [tab,        setTab]        = useState('odontograma');
  const [marca,      setMarca]      = useState('caries');
  // dientes: { [num]: { v, l, m, d, o, ausente } }
  const [dientes,    setDientes]    = useState({});
  const [agendaState,setAgendaState]= useState(agenda);
  const [historial,  setHistorial]  = useState(HISTORIAL_INIT);
  const [toast,      setToast]      = useState(null);

  // Evaluación clínica (por paciente)
  const [motivo,     setMotivo]     = useState('');
  const [presion,    setPresion]    = useState('');
  const [temp,       setTemp]       = useState('');

  // Formulario de nuevo diagnóstico
  const [diag,       setDiag]       = useState('');
  const [trata,      setTrata]      = useState('');
  const [piezas,     setPiezas]     = useState('');
  const [estadoPlan, setEstadoPlan] = useState('pending');
  const [proxCita,   setProxCita]   = useState('');
  const [filtroHist, setFiltroHist] = useState('todos');
  const [busqHist,   setBusqHist]   = useState('');

  const showToast = (msg, tipo='success') => {
    setToast({msg,tipo}); setTimeout(()=>setToast(null),2500);
  };

  const seleccionarCita = (cita) => {
    setCitaActiva(cita);
    // Buscar el paciente por documento en la BD real
    const docBuscar = cita.pacienteDoc || cita.pacienteId || '';
    const p = pacientesDB.find(x => x.doc === docBuscar);
    if (p) {
      setPaciente(p);
    } else {
      // Si no se encuentra por doc, buscar por nombre
      const porNombre = pacientesDB.find(x => x.nombre === cita.paciente);
      if (porNombre) setPaciente(porNombre);
    }
    setDientes({});
    setMotivo(''); setPresion(''); setTemp('');
    setDiag(''); setTrata(''); setPiezas('');
    setEstadoPlan('pending'); setProxCita('');
    setFiltroHist('todos'); setBusqHist('');
  };

  // Marcar una superficie específica de un diente
  const marcarSuperficie = (num, sup) => {
    setDientes(prev => {
      const tooth = prev[num] || { v:null, l:null, m:null, d:null, o:null, ausente:false };
      if (tooth.ausente) return prev; // No editar diente ausente
      const estadoActual = tooth[sup];
      // Toggle: si ya tiene ese estado, lo quita (sano)
      const nuevoEstado = estadoActual === marca ? null : marca;
      return { ...prev, [num]: { ...tooth, [sup]: nuevoEstado } };
    });
  };

  // Toggle ausente en número del diente
  const toggleAusente = (num) => {
    setDientes(prev => {
      const tooth = prev[num] || { v:null, l:null, m:null, d:null, o:null, ausente:false };
      const ausente = !tooth.ausente;
      return { ...prev, [num]: { v:null, l:null, m:null, d:null, o:null, ausente } };
    });
  };

  // Superficies de un diente (objeto {v,l,m,d,o})
  const getSups = (num) => {
    const t = dientes[num] || {};
    return { v: t.v||null, l: t.l||null, m: t.m||null, d: t.d||null, o: t.o||null };
  };
  const isAusente = (num) => !!(dientes[num]?.ausente);

  const limpiarTodo = () => { setDientes({}); showToast('Odontograma limpiado.'); };

  const finalizarCita = () => {
    setAgendaState(prev=>prev.map(c=>c.id===citaActiva.id?{...c,estado:'Atendido'}:c));
    showToast(`Cita de ${citaActiva.paciente} finalizada.`);
  };

  const registrarDiagnostico = () => {
    if(!diag.trim() || !trata.trim()) {
      showToast('Completa diagnóstico y plan de tratamiento.','danger'); return;
    }
    const nueva = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-CO'),
      diag: diag.trim(),
      trata: trata.trim(),
      piezas: piezas.trim(),
      estado: estadoPlan,
      proxcita: proxCita || 'Por definir',
    };
    setHistorial(prev=>({
      ...prev,
      [paciente.doc]: [nueva, ...(prev[paciente.doc]||[])],
    }));
    setDiag(''); setTrata(''); setPiezas(''); setEstadoPlan('pending'); setProxCita('');
    showToast('Diagnóstico registrado en historial.');
  };

  const cambiarEstadoPlan = (pacId, planId, nuevoEstado) => {
    setHistorial(prev=>({
      ...prev,
      [pacId]: prev[pacId].map(p=>p.id===planId?{...p,estado:nuevoEstado}:p),
    }));
  };

  const eliminarPlan = (pacId, planId) => {
    setHistorial(prev=>({
      ...prev,
      [pacId]: prev[pacId].filter(p=>p.id!==planId),
    }));
    showToast('Entrada eliminada.','danger');
  };

  const planesActuales = historial[paciente?.id] || [];
  const planesFiltrados = planesActuales.filter(p=>{
    const matchFiltro = filtroHist==='todos' || p.estado===filtroHist;
    const matchBusq   = !busqHist || p.diag.toLowerCase().includes(busqHist.toLowerCase());
    return matchFiltro && matchBusq;
  });

  const totalPlanes    = planesActuales.length;
  const pendientes     = planesActuales.filter(p=>p.estado==='pending').length;
  const enProceso      = planesActuales.filter(p=>p.estado==='progress').length;
  const completados    = planesActuales.filter(p=>p.estado==='done').length;

  // Resumen: contar superficies por estado
  const resumen = Object.values(dientes).reduce((acc, tooth) => {
    if (!tooth) return acc;
    if (tooth.ausente) { acc.ausente = (acc.ausente || 0) + 1; return acc; }
    ['v','l','m','d','o'].forEach(s => {
      if (tooth[s]) acc[tooth[s]] = (acc[tooth[s]] || 0) + 1;
    });
    return acc;
  }, {});

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background:'#f0f2f5', minHeight:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:16,right:16,zIndex:2000,
          background:toast.tipo==='danger'?'#ef4444':'#22c55e',
          color:'white',borderRadius:10,padding:'12px 20px',fontWeight:600,fontSize:'.85rem',
          boxShadow:'0 4px 16px rgba(0,0,0,.2)',display:'flex',alignItems:'center',gap:8,
        }}>
          <i className={`bi ${toast.tipo==='danger'?'bi-x-circle':'bi-check-circle'}`}/> {toast.msg}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{
        background:'#111827', height:52, padding:'0 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:'0 2px 8px rgba(0,0,0,.35)', position:'sticky', top:0, zIndex:100,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <i className="bi bi-shield-plus" style={{color:'#0dcaf0',fontSize:'1.2rem'}}/>
          <span style={{color:'#0dcaf0',fontWeight:800,fontSize:'.95rem',letterSpacing:'.06em'}}>NOVA SMILE PRO</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{textAlign:'right',lineHeight:1.3}}>
            <div style={{color:'white',fontWeight:700,fontSize:'.88rem'}}>Dr. <strong>{session.usuario}</strong></div>
            <div style={{color:'#0dcaf0',fontSize:'.7rem'}}>Consultorio 1</div>
          </div>
          <button onClick={onLogout} style={{
            background:'transparent', border:'1px solid #374151', color:'white',
            borderRadius:8, padding:'5px 14px', cursor:'pointer', fontSize:'.8rem',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <i className="bi bi-person-circle" style={{color:'#0dcaf0'}}/> Mi Cuenta
          </button>
        </div>
      </nav>

      <div style={{display:'flex', height:'calc(100vh - 52px)'}}>

        {/* ── ÁREA PRINCIPAL ── */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 16px 16px 20px'}}>

          {/* Tarjeta paciente */}
          {paciente && (
            <div style={{
              background:'white', borderRadius:10, marginBottom:12,
              border:'1px solid #e5e7eb', borderLeft:'5px solid #0dcaf0',
              padding:'14px 20px', display:'flex', alignItems:'center', gap:24,
              boxShadow:'0 1px 4px rgba(0,0,0,.06)', flexWrap:'wrap',
            }}>
              <div style={{minWidth:130}}>
                <div style={{fontSize:'.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em'}}>Paciente</div>
                <div style={{fontWeight:700,fontSize:'1.05rem',color:'#0d6efd'}}>{paciente.nombre}</div>
                <div style={{fontSize:'.72rem',color:'#9ca3af'}}>Doc: {paciente.doc}</div>
              </div>
              <div style={{minWidth:160}}>
                <div style={{fontSize:'.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em'}}>Datos</div>
                <div style={{fontWeight:600,fontSize:'.88rem'}}>{calcEdad(paciente.fnac)} años · {paciente.eps || 'Particular'}</div>
                <div style={{fontSize:'.72rem',color:'#9ca3af'}}>Tel: {paciente.tel}</div>
              </div>
              <div style={{minWidth:160}}>
                <div style={{fontSize:'.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em'}}>Correo</div>
                <div style={{fontSize:'.82rem',color:'#374151'}}>{paciente.correo || '—'}</div>
                <div style={{fontSize:'.72rem',color:'#9ca3af'}}>Reg: {paciente.fechaReg || '—'}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:5}}>Alertas Médicas</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {getAlertas(paciente).length===0
                    ? <span style={{color:'#9ca3af',fontSize:'.75rem'}}>Sin alertas</span>
                    : getAlertas(paciente).map((a,i)=>(
                      <span key={a} style={{background:ALERTA_BG[i%ALERTA_BG.length],color:'white',borderRadius:20,padding:'2px 10px',fontSize:'.72rem',fontWeight:600}}>{a}</span>
                    ))
                  }
                </div>
              </div>
              <button onClick={finalizarCita} style={{
                background:'#22c55e', border:'none', color:'white', borderRadius:8,
                padding:'9px 18px', fontWeight:700, fontSize:'.83rem', cursor:'pointer',
                whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6,
                boxShadow:'0 2px 8px rgba(34,197,94,.3)',
              }}>
                <i className="bi bi-check-circle-fill"/> FINALIZAR CITA
              </button>
            </div>
          )}

          {/* Card clínica con tabs */}
          <div style={{background:'white',borderRadius:10,border:'1px solid #e5e7eb',boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>

            {/* Tabs */}
            <div style={{display:'flex',borderBottom:'1px solid #e5e7eb',padding:'0 16px',gap:4}}>
              {[
                {id:'odontograma', icon:'bi-grid-3x3',     label:'Odontograma'},
                {id:'historia',    icon:'bi-file-medical', label:'Historia y Planes'},
                {id:'anexos',      icon:'bi-paperclip',    label:'Anexos'},
              ].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  background:'transparent', border:'none', cursor:'pointer',
                  padding:'11px 14px', fontSize:'.84rem', fontWeight:600,
                  color:tab===t.id?'#0d6efd':'#6c757d',
                  borderBottom:tab===t.id?'2px solid #0d6efd':'2px solid transparent',
                  display:'flex', alignItems:'center', gap:5, marginBottom:-1,
                }}>
                  <i className={`bi ${t.icon}`}/> {t.label}
                </button>
              ))}
            </div>

            {/* ══ ODONTOGRAMA ══════════════════════════════════════════════ */}
            {tab==='odontograma' && (
              <div style={{padding:16, display:'flex', gap:20}}>

                {/* Panel de estados */}
                <div style={{width:180, flexShrink:0}}>
                  <div style={{fontSize:'.68rem',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>
                    Estado a marcar:
                  </div>
                  <EstadoBtn id="sano"    label="Sano / Limpiar" icon="bi-eraser-fill" active={marca==='sano'}    onClick={()=>setMarca('sano')}/>
                  <EstadoBtn id="caries"  label="Caries (Rojo)"  dot="#ff4d4d"         active={marca==='caries'}  onClick={()=>setMarca('caries')}/>
                  <EstadoBtn id="tratado" label="Tratado (Azul)" dot="#4d94ff"         active={marca==='tratado'} onClick={()=>setMarca('tratado')}/>
                  <EstadoBtn id="ausente" label="Ausente"        icon="bi-x-circle"    active={marca==='ausente'} onClick={()=>setMarca('ausente')}/>
                  <div style={{fontSize:'.65rem',color:'#9ca3af',marginTop:6,marginBottom:4,paddingLeft:4}}>
                    <i className="bi bi-info-circle me-1"/>Con <strong>Ausente</strong> activo, haz clic en el cuadro del diente para marcarlo.
                  </div>

                  <button onClick={limpiarTodo} style={{
                    display:'flex', alignItems:'center', gap:6, width:'100%',
                    padding:'8px 12px', marginTop:8, borderRadius:8,
                    cursor:'pointer', fontSize:'.83rem', background:'white',
                    color:'#dc3545', border:'1.5px solid #dc3545', fontWeight:600,
                  }}>
                    <i className="bi bi-trash"/> Limpiar Todo
                  </button>

                  {Object.keys(resumen).length>0 && (
                    <div style={{marginTop:14,padding:'8px 10px',background:'#f8fafc',borderRadius:8,border:'1px solid #e5e7eb'}}>
                      <div style={{fontSize:'.65rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',marginBottom:6}}>Resumen</div>
                      {Object.entries(resumen).map(([est,cnt])=>(
                        <div key={est} style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <span style={{width:10,height:10,borderRadius:2,background:ESTADOS_DIENTE[est]?.bg,border:`1.5px solid ${ESTADOS_DIENTE[est]?.border}`,display:'inline-block'}}/>
                            <span style={{fontSize:'.73rem',color:'#374151'}}>{ESTADOS_DIENTE[est]?.label||est}</span>
                          </div>
                          <span style={{fontWeight:700,fontSize:'.78rem'}}>{cnt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p style={{fontSize:'.65rem',color:'#9ca3af',marginTop:10,lineHeight:1.5}}>
                    <i className="bi bi-info-circle me-1"/>
                    Los cambios se guardan automáticamente.
                  </p>
                </div>

                {/* Grilla dental — layout igual al HTML original */}
                <div style={{flex:1}}>
                  <div style={{background:'#f8fafc',borderRadius:10,border:'1px solid #e5e7eb',padding:'16px 12px'}}>

                    {/* === MAXILAR SUPERIOR === */}
                    {/* Cuadrante 1 (der) + Cuadrante 2 (izq) */}
                    <div style={{display:'flex',justifyContent:'center',gap:4,marginBottom:10}}>
                      {FILA_SUP_DER.map(n=>(
                        <Diente key={n} num={n}
                          superficies={getSups(n)}
                          ausente={isAusente(n)}
                          marca={marca}
                          onClickSup={s=>marcarSuperficie(n,s)}
                          onToggleAusente={()=>toggleAusente(n)}
                        />
                      ))}
                      <div style={{width:1,background:'#dee2e6',margin:'0 4px'}}/>
                      {FILA_SUP_IZQ.map(n=>(
                        <Diente key={n} num={n}
                          superficies={getSups(n)}
                          ausente={isAusente(n)}
                          marca={marca}
                          onClickSup={s=>marcarSuperficie(n,s)}
                          onToggleAusente={()=>toggleAusente(n)}
                        />
                      ))}
                    </div>

                    {/* Separador maxilar/mandíbula */}
                    <div style={{borderTop:'1.5px dashed #adb5bd',margin:'4px 20px 10px'}}/>

                    {/* === MANDÍBULA INFERIOR === */}
                    {/* Cuadrante 4 (der) + Cuadrante 3 (izq) */}
                    <div style={{display:'flex',justifyContent:'center',gap:4}}>
                      {FILA_INF_IZQ.map(n=>(
                        <Diente key={n} num={n}
                          superficies={getSups(n)}
                          ausente={isAusente(n)}
                          marca={marca}
                          onClickSup={s=>marcarSuperficie(n,s)}
                          onToggleAusente={()=>toggleAusente(n)}
                        />
                      ))}
                      <div style={{width:1,background:'#dee2e6',margin:'0 4px'}}/>
                      {FILA_INF_DER.map(n=>(
                        <Diente key={n} num={n}
                          superficies={getSups(n)}
                          ausente={isAusente(n)}
                          marca={marca}
                          onClickSup={s=>marcarSuperficie(n,s)}
                          onToggleAusente={()=>toggleAusente(n)}
                        />
                      ))}
                    </div>

                    {/* Leyenda */}
                    <div style={{display:'flex',justifyContent:'center',gap:14,marginTop:14,flexWrap:'wrap'}}>
                      {[
                        {key:'sano',    label:'Sano',    bg:'#ffffff', border:'#adb5bd'},
                        {key:'caries',  label:'Caries',  bg:'#ff4d4d', border:'#c0392b'},
                        {key:'tratado', label:'Tratado', bg:'#4d94ff', border:'#1a56db'},
                        {key:'ausente', label:'Ausente', bg:'#212529', border:'#000'},
                      ].map(v=>(
                        <div key={v.key} style={{display:'flex',alignItems:'center',gap:4,fontSize:'.68rem',color:'#6b7280'}}>
                          <span style={{width:11,height:11,borderRadius:2,background:v.bg,border:`1.5px solid ${v.border}`,display:'inline-block'}}/>
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ HISTORIA Y PLANES ════════════════════════════════════════ */}
            {tab==='historia' && (
              <div style={{padding:16, display:'flex', gap:16}}>

                {/* COLUMNA IZQUIERDA: Evaluación + Diagnóstico */}
                <div style={{width:300, flexShrink:0}}>

                  {/* Evaluación clínica */}
                  <div style={{
                    background:'#f8fafc', borderRadius:10, padding:14,
                    border:'1px solid #e5e7eb', marginBottom:14,
                  }}>
                    <div style={{fontWeight:700,fontSize:'.85rem',color:'#374151',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                      <i className="bi bi-clipboard2-pulse text-primary"/> Evaluación Clínica
                    </div>

                    <div style={{marginBottom:10}}>
                      <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Motivo de Consulta:</label>
                      <textarea
                        rows={3}
                        className="form-control form-control-sm"
                        placeholder="Describa el motivo..."
                        value={motivo}
                        onChange={e=>setMotivo(e.target.value)}
                        style={{resize:'vertical',fontSize:'.82rem'}}
                      />
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <div>
                        <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Presión Arterial:</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="120/80"
                          value={presion}
                          onChange={e=>setPresion(e.target.value)}
                          style={{fontSize:'.82rem'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Temperatura:</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="36.5"
                          value={temp}
                          onChange={e=>setTemp(e.target.value)}
                          style={{fontSize:'.82rem'}}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nuevo Diagnóstico */}
                  <div style={{
                    background:'#f8fafc', borderRadius:10, padding:14,
                    border:'1px solid #e5e7eb',
                  }}>
                    <div style={{fontWeight:700,fontSize:'.85rem',color:'#374151',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                      <i className="bi bi-plus-circle-fill text-success"/> Nuevo Diagnóstico
                    </div>

                    <div style={{marginBottom:8}}>
                      <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Diagnóstico (CIE-10 o descripción):</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Ej: Pulpitis irreversible, K04.0"
                        value={diag}
                        onChange={e=>setDiag(e.target.value)}
                        style={{fontSize:'.82rem'}}
                      />
                    </div>

                    <div style={{marginBottom:8}}>
                      <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Piezas dentales afectadas:</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Ej: 16, 17, 26"
                        value={piezas}
                        onChange={e=>setPiezas(e.target.value)}
                        style={{fontSize:'.82rem'}}
                      />
                    </div>

                    <div style={{marginBottom:8}}>
                      <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Plan de Tratamiento:</label>
                      <textarea
                        rows={3}
                        className="form-control form-control-sm"
                        placeholder="Detalle el procedimiento..."
                        value={trata}
                        onChange={e=>setTrata(e.target.value)}
                        style={{resize:'vertical',fontSize:'.82rem'}}
                      />
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                      <div>
                        <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Estado:</label>
                        <select
                          className="form-select form-select-sm"
                          value={estadoPlan}
                          onChange={e=>setEstadoPlan(e.target.value)}
                          style={{fontSize:'.82rem'}}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="progress">En proceso</option>
                          <option value="done">Completado</option>
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:'.75rem',fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Próxima cita:</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={proxCita}
                          onChange={e=>setProxCita(e.target.value)}
                          style={{fontSize:'.82rem'}}
                        />
                      </div>
                    </div>

                    <button
                      onClick={registrarDiagnostico}
                      className="btn btn-primary w-100"
                      style={{fontSize:'.83rem',fontWeight:700}}
                    >
                      <i className="bi bi-save me-1"/> REGISTRAR EN HISTORIAL
                    </button>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Timeline de historial */}
                <div style={{flex:1}}>

                  {/* Métricas del historial */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
                    {[
                      {val:totalPlanes,  label:'TOTAL PLANES',  color:'#0d6efd'},
                      {val:pendientes,   label:'PENDIENTES',    color:'#f59e0b'},
                      {val:enProceso,    label:'EN PROCESO',    color:'#3b82f6'},
                      {val:completados,  label:'COMPLETADOS',   color:'#22c55e'},
                    ].map(m=>(
                      <div key={m.label} style={{
                        background:'white',border:'1px solid #e5e7eb',borderRadius:8,
                        padding:'8px 10px',textAlign:'center',
                      }}>
                        <div style={{fontSize:'1.3rem',fontWeight:800,color:m.color}}>{m.val}</div>
                        <div style={{fontSize:'.6rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em'}}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Filtros */}
                  <div style={{display:'flex',gap:6,marginBottom:10,alignItems:'center',flexWrap:'wrap'}}>
                    {[
                      {id:'todos',    label:'Todos'},
                      {id:'pending',  label:'Pendientes'},
                      {id:'progress', label:'En proceso'},
                      {id:'done',     label:'Completados'},
                    ].map(f=>(
                      <button key={f.id} onClick={()=>setFiltroHist(f.id)} style={{
                        padding:'4px 12px', borderRadius:20, border:'1.5px solid',
                        cursor:'pointer', fontSize:'.78rem', fontWeight:600,
                        background: filtroHist===f.id ? '#0d6efd' : 'white',
                        color: filtroHist===f.id ? 'white' : '#374151',
                        borderColor: filtroHist===f.id ? '#0d6efd' : '#dee2e6',
                      }}>{f.label}</button>
                    ))}
                    <div style={{marginLeft:'auto',position:'relative'}}>
                      <i className="bi bi-search" style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:'.75rem'}}/>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Buscar..."
                        value={busqHist}
                        onChange={e=>setBusqHist(e.target.value)}
                        style={{paddingLeft:26,minWidth:130,fontSize:'.8rem'}}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div style={{fontSize:'.8rem',color:'#9ca3af',marginBottom:8}}>
                    Historial ({planesFiltrados.length} {planesFiltrados.length===1?'entrada':'entradas'})
                  </div>

                  {planesFiltrados.length===0
                    ? (
                      <div style={{textAlign:'center',padding:'30px 0',color:'#9ca3af'}}>
                        <i className="bi bi-inbox" style={{fontSize:'2rem',display:'block',marginBottom:8}}/>
                        Sin registros en el historial.
                      </div>
                    )
                    : planesFiltrados.map((plan)=>{
                      const ec = ESTADO_PLAN_COLOR[plan.estado]||{bg:'#f3f4f6',color:'#374151'};
                      return (
                        <div key={plan.id} style={{
                          background:'white', border:'1px solid #e5e7eb', borderRadius:10,
                          padding:'12px 14px', marginBottom:10, position:'relative',
                        }}>
                          {/* Punto de timeline */}
                          <div style={{
                            position:'absolute',left:-6,top:18,width:12,height:12,borderRadius:'50%',
                            background: plan.estado==='done'?'#22c55e':plan.estado==='progress'?'#3b82f6':'#f59e0b',
                            border:'2px solid white',boxShadow:'0 0 0 2px #e5e7eb',
                          }}/>

                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                            <div>
                              <div style={{fontSize:'.7rem',color:'#9ca3af',marginBottom:2}}>
                                {plan.fecha}
                                {plan.proxcita && plan.proxcita!=='Por definir' && (
                                  <span style={{marginLeft:8,color:'#6b7280'}}>▸ {plan.proxcita}</span>
                                )}
                              </div>
                              <div style={{fontWeight:700,fontSize:'.9rem',color:'#111827'}}>{plan.diag}</div>
                              {plan.piezas && (
                                <div style={{fontSize:'.75rem',color:'#6c757d',marginTop:1}}>Piezas: {plan.piezas}</div>
                              )}
                              <div style={{fontSize:'.78rem',color:'#6c757d',marginTop:3}}>{plan.trata}</div>
                            </div>
                          </div>

                          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                            {/* Selector de estado */}
                            <select
                              className="form-select form-select-sm"
                              value={plan.estado}
                              onChange={e=>cambiarEstadoPlan(paciente.doc, plan.id, e.target.value)}
                              style={{
                                width:'auto',fontSize:'.75rem',fontWeight:700,
                                background:ec.bg, color:ec.color,
                                border:`1px solid ${ec.color}40`,
                              }}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="progress">En proceso</option>
                              <option value="done">Completado</option>
                            </select>
                            <button
                              onClick={()=>eliminarPlan(paciente.doc, plan.id)}
                              style={{
                                background:'none',border:'1px solid #dee2e6',borderRadius:6,
                                padding:'3px 10px',cursor:'pointer',fontSize:'.75rem',
                                color:'#ef4444',display:'flex',alignItems:'center',gap:4,
                              }}
                            >
                              <i className="bi bi-trash"/> Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}

            {/* ══ ANEXOS ════════════════════════════════════════════════════ */}
            {tab==='anexos' && (
              <div style={{padding:20,textAlign:'center',color:'#9ca3af'}}>
                <i className="bi bi-paperclip" style={{fontSize:'2.5rem',display:'block',marginBottom:8}}/>
                <p>No hay anexos cargados para este paciente.</p>
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-upload me-1"/> Subir archivo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── AGENDA LATERAL ── */}
        <div style={{width:280,background:'white',borderLeft:'1px solid #e5e7eb',overflowY:'auto',padding:'16px 14px',flexShrink:0}}>
          <h5 style={{fontWeight:700,color:'#111827',marginBottom:16,fontSize:'1rem'}}>Agenda de Hoy</h5>
          {agendaState.map(cita=>{
            const cfg = AGENDA_COLORS[cita.estado]||{bg:'#f9fafb',border:'#e5e7eb',badge:'#6b7280'};
            const activa = citaActiva?.id===cita.id;
            return (
              <div key={cita.id} onClick={()=>seleccionarCita(cita)} style={{
                background: activa?'#e0f7fc':cfg.bg,
                border:`1px solid ${activa?'#0dcaf0':cfg.border}`,
                borderLeft:`4px solid ${activa?'#0dcaf0':cfg.badge}`,
                borderRadius:10, padding:'11px 12px', marginBottom:10,
                cursor:'pointer', transition:'all .15s',
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{background:cfg.badge,color:'white',fontSize:'.62rem',fontWeight:700,padding:'2px 8px',borderRadius:20}}>
                    {cita.estado}
                  </span>
                  <span style={{fontWeight:700,color:'#374151',fontSize:'.86rem'}}>{cita.hora}</span>
                </div>
                <div style={{fontWeight:700,fontSize:'.92rem',color:'#111827'}}>{cita.paciente}</div>
                <div style={{fontSize:'.74rem',color:'#6c757d',marginTop:2}}>{cita.servicio}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
