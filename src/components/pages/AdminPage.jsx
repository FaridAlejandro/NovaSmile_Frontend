/**
 * Nova Smile — Módulo Administrador
 * CRUD completo: Personal y Pacientes con modales de agregar/editar/eliminar
 */
import React, { useState, useEffect } from 'react';

// ── Datos iniciales ───────────────────────────────────────────────────────────
const PERSONAL_INIT = [
  { doc: '10203040', nombre: 'Farid Torres',     rol: 'Odontólogo',    email: 'farid@novasmile.com',  tel: '3176600780', esp: 'Endodoncia', estado: 'Activo' },
  { doc: '50607080', nombre: 'Elizabeth Gelves', rol: 'Recepcionista', email: 'eli@novasmile.com',    tel: '3001234567', esp: '',           estado: 'Activo' },
  { doc: '99001122', nombre: 'Laura Martínez',   rol: 'Administrador', email: 'laura@novasmile.com',  tel: '3105556677', esp: '',           estado: 'Activo' },
];
const PACIENTES_INIT = [
  { doc: '1116818960', nombre: 'Alix Guerrero',    tel: '3132548800', correo: 'alix@correo.com',   fnac: '1990-05-12', eps: 'Nueva EPS', alergias: 'Ninguna',   fechaReg: '14/1/2026',  estado: 'Activo' },
  { doc: '1651234567', nombre: 'Andrés Morales',   tel: '3147440000', correo: 'andres@correo.com', fnac: '1985-09-23', eps: 'Sura',      alergias: 'Penicilina', fechaReg: '19/2/2026', estado: 'Activo' },
  { doc: '109428140',  nombre: 'María Villarreal', tel: '3172147580', correo: 'maria@correo.com',  fnac: '1993-03-07', eps: 'Sanitas',   alergias: 'Ninguna',   fechaReg: '28/2/2026',  estado: 'Activo' },
];

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { id: 'personal',  icon: 'bi-person-badge',  label: 'Personal' },
  { id: 'pacientes', icon: 'bi-people',        label: 'Pacientes' },
  { id: 'config',    icon: 'bi-building',      label: 'Config. Clínica' },
  { id: 'auditoria', icon: 'bi-card-list',     label: 'Auditoría' },
  { id: 'bd',        icon: 'bi-database',      label: 'Base de Datos' },
];

const ROLES = ['Odontólogo','Recepcionista','Administrador','Auxiliar'];
const ESTADOS = ['Activo','Inactivo'];
const ROL_COLORS = { Odontólogo:'#0d6efd', Recepcionista:'#f59e0b', Administrador:'#8b5cf6', Auxiliar:'#22c55e' };

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Overlay({ onClose }) {
  return <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:1000 }} />;
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        background:'white', borderRadius:16, padding:28, width:520, maxWidth:'95vw',
        zIndex:1001, boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'90vh', overflowY:'auto',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h5 style={{ margin:0, fontWeight:700, color:'#111827' }}>{title}</h5>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3rem', color:'#6b7280', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <>
      <Overlay onClose={onCancel} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        background:'white', borderRadius:16, padding:28, width:360, zIndex:1001,
        boxShadow:'0 20px 60px rgba(0,0,0,.25)',
      }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color:'#f59e0b', fontSize:'2.5rem', display:'block', marginBottom:12 }} />
          <p style={{ color:'#374151', fontSize:'.95rem', margin:0 }}>{message}</p>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={onCancel} style={{ padding:'8px 24px', borderRadius:8, border:'1px solid #e5e7eb', background:'white', cursor:'pointer', fontWeight:600, color:'#374151' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ padding:'8px 24px', borderRadius:8, border:'none', background:'#ef4444', color:'white', cursor:'pointer', fontWeight:700 }}>Eliminar</button>
        </div>
      </div>
    </>
  );
}

function Avatar({ nombre, color='#6366f1' }) {
  const ini = (nombre||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
  return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:color,display:'flex',
      alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'.75rem',flexShrink:0 }}>
      {ini}
    </div>
  );
}

// ── Gráficos SVG ─────────────────────────────────────────────────────────────
function LineChart({ data }) {
  const w=580,h=200,pad={top:20,right:20,bottom:30,left:40};
  const maxV=Math.max(...data);
  const xStep=(w-pad.left-pad.right)/(data.length-1);
  const yS=v=>pad.top+(h-pad.top-pad.bottom)*(1-v/maxV);
  const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const pts=data.map((v,i)=>[pad.left+i*xStep,yS(v)]);
  const path=pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area=path+` L${pts[pts.length-1][0]},${h-pad.bottom} L${pad.left},${h-pad.bottom} Z`;
  const ticks=[0,100,200,300,400].filter(v=>v<=maxV+50);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
      {ticks.map(v=>(
        <g key={v}>
          <line x1={pad.left} y1={yS(v)} x2={w-pad.right} y2={yS(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4"/>
          <text x={pad.left-6} y={yS(v)+4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      <path d={area} fill="#0d6efd" fillOpacity="0.08"/>
      <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#0d6efd"/>)}
      {months.map((m,i)=><text key={m} x={pad.left+i*xStep} y={h-pad.bottom+16} textAnchor="middle" fontSize="10" fill="#9ca3af">{m}</text>)}
    </svg>
  );
}

function DonutChart() {
  const data=[
    {label:'Limpieza',value:35,color:'#0d6efd'},{label:'Ortodoncia',value:20,color:'#22c55e'},
    {label:'Endodoncia',value:25,color:'#f59e0b'},{label:'Cirugía',value:12,color:'#ef4444'},
    {label:'Blanqueamiento',value:8,color:'#8b5cf6'},
  ];
  const total=data.reduce((a,d)=>a+d.value,0);
  const cx=100,cy=100,r=75,inner=42;
  let angle=-Math.PI/2;
  const slices=data.map(d=>{
    const sweep=(d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
    const x2=cx+r*Math.cos(angle+sweep),y2=cy+r*Math.sin(angle+sweep);
    const xi1=cx+inner*Math.cos(angle),yi1=cy+inner*Math.sin(angle);
    const xi2=cx+inner*Math.cos(angle+sweep),yi2=cy+inner*Math.sin(angle+sweep);
    const large=sweep>Math.PI?1:0;
    const path=`M${xi1},${yi1} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large} 0 ${xi1},${yi1} Z`;
    angle+=sweep;
    return {...d,path};
  });
  return (
    <div>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map(s=><path key={s.label} d={s.path} fill={s.color}/>)}
        <circle cx={cx} cy={cy} r={inner-2} fill="white"/>
      </svg>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px 14px',marginTop:8}}>
        {data.map(d=>(
          <div key={d.label} style={{display:'flex',alignItems:'center',gap:5,fontSize:'.75rem',color:'#374151'}}>
            <span style={{width:10,height:10,borderRadius:2,background:d.color,display:'inline-block'}}/>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Formulario Personal ───────────────────────────────────────────────────────
const PERSONAL_EMPTY = { doc:'', nombre:'', rol:'Odontólogo', email:'', tel:'', esp:'', estado:'Activo' };

function FormPersonal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || PERSONAL_EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e={};
    if(!form.doc.trim())    e.doc='Requerido';
    if(!form.nombre.trim()) e.nombre='Requerido';
    if(!form.email.trim())  e.email='Requerido';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = (ev) => { ev.preventDefault(); if(validate()) onSave(form); };

  const inp = (label,key,type='text',opts={}) => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:'.75rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:4}}>{label}</label>
      {opts.select
        ? <select className="form-select form-select-sm" value={form[key]} onChange={e=>set(key,e.target.value)}>
            {opts.options.map(o=><option key={o}>{o}</option>)}
          </select>
        : <input type={type} className={`form-control form-control-sm${errors[key]?' border-danger':''}`}
            value={form[key]} onChange={e=>set(key,e.target.value)}/>
      }
      {errors[key] && <div style={{color:'#ef4444',fontSize:'.72rem',marginTop:3}}>{errors[key]}</div>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
        {inp('N° Documento','doc')}
        {inp('Nombre completo','nombre')}
        {inp('Rol','rol','text',{select:true,options:ROLES})}
        {inp('Estado','estado','text',{select:true,options:ESTADOS})}
        {inp('Email','email','email')}
        {inp('Teléfono','tel','tel')}
        {inp('Especialidad','esp')}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
        <button type="button" onClick={onClose} style={{padding:'8px 20px',borderRadius:8,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontWeight:600}}>Cancelar</button>
        <button type="submit" style={{padding:'8px 20px',borderRadius:8,border:'none',background:'#0d6efd',color:'white',cursor:'pointer',fontWeight:700}}>
          <i className="bi bi-save me-1"/>Guardar
        </button>
      </div>
    </form>
  );
}

// ── Formulario Pacientes ──────────────────────────────────────────────────────
const PACIENTE_EMPTY = { doc:'', nombre:'', tel:'', correo:'', fnac:'', eps:'', alergias:'', estado:'Activo' };

function FormPaciente({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || PACIENTE_EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e={};
    if(!form.doc.trim())    e.doc='Requerido';
    if(!form.nombre.trim()) e.nombre='Requerido';
    if(!form.tel.trim())    e.tel='Requerido';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = (ev) => { ev.preventDefault(); if(validate()) onSave(form); };

  const inp = (label,key,type='text',opts={}) => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:'.75rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:4}}>{label}</label>
      {opts.select
        ? <select className="form-select form-select-sm" value={form[key]} onChange={e=>set(key,e.target.value)}>
            {opts.options.map(o=><option key={o}>{o}</option>)}
          </select>
        : <input type={type} className={`form-control form-control-sm${errors[key]?' border-danger':''}`}
            value={form[key]} onChange={e=>set(key,e.target.value)}/>
      }
      {errors[key] && <div style={{color:'#ef4444',fontSize:'.72rem',marginTop:3}}>{errors[key]}</div>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
        {inp('N° Documento','doc')}
        {inp('Nombre completo','nombre')}
        {inp('Teléfono','tel','tel')}
        {inp('Correo','correo','email')}
        {inp('Fecha de nacimiento','fnac','date')}
        {inp('EPS','eps')}
        {inp('Alergias','alergias')}
        {inp('Estado','estado','text',{select:true,options:ESTADOS})}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
        <button type="button" onClick={onClose} style={{padding:'8px 20px',borderRadius:8,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontWeight:600}}>Cancelar</button>
        <button type="submit" style={{padding:'8px 20px',borderRadius:8,border:'none',background:'#0d6efd',color:'white',cursor:'pointer',fontWeight:700}}>
          <i className="bi bi-save me-1"/>Guardar
        </button>
      </div>
    </form>
  );
}

// ── Botones de acción ─────────────────────────────────────────────────────────
function AccionBtn({ icon, color, title, onClick }) {
  return (
    <button onClick={onClick} title={title} style={{
      width:32,height:32,borderRadius:8,border:`1.5px solid ${color}20`,
      background:'white',color:color,cursor:'pointer',display:'inline-flex',
      alignItems:'center',justifyContent:'center',fontSize:'.85rem',
      transition:'all .15s',
    }}
    onMouseEnter={e=>{e.currentTarget.style.background=color;e.currentTarget.style.color='white';}}
    onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color=color;}}
    >
      <i className={`bi ${icon}`}/>
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminPage({ session, onLogout }) {
  const [tab, setTab]           = useState('dashboard');
  const [personal, setPersonal] = useState(JSON.parse(localStorage.getItem('ns_personal'))   || PERSONAL_INIT);
  const [pacientes, setPacientes] = useState(JSON.parse(localStorage.getItem('ns_pacientes')) || PACIENTES_INIT);
  const [busqPers, setBusqPers]   = useState('');
  const [busqPac,  setBusqPac]    = useState('');
  const [filRol,   setFilRol]     = useState('Todos los roles');
  const [filEst,   setFilEst]     = useState('Todos los estados');
  const [modal, setModal]         = useState(null); // { type:'personal'|'paciente', mode:'add'|'edit', data? }
  const [confirm, setConfirm]     = useState(null); // { type, doc }
  const [toast, setToast]         = useState(null);
  const [time, setTime]           = useState('');

  const logs = JSON.parse(localStorage.getItem('ns_access_log') || '[]');

  useEffect(() => {
    const fmt=()=>setTime(new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
    fmt(); const t=setInterval(fmt,1000); return ()=>clearInterval(t);
  }, []);

  // Persistencia
  useEffect(()=>{ localStorage.setItem('ns_personal',JSON.stringify(personal)); }, [personal]);
  useEffect(()=>{ localStorage.setItem('ns_pacientes',JSON.stringify(pacientes)); }, [pacientes]);

  const showToast = (msg, tipo='success') => {
    setToast({msg,tipo});
    setTimeout(()=>setToast(null),3000);
  };

  // ── CRUD Personal ──
  const savePersonal = (form) => {
    if(modal.mode==='add') {
      if(personal.find(p=>p.doc===form.doc)) { showToast('Ya existe un funcionario con ese documento.','danger'); return; }
      setPersonal(prev=>[...prev,form]);
      showToast('Funcionario agregado correctamente.');
    } else {
      setPersonal(prev=>prev.map(p=>p.doc===form.doc?form:p));
      showToast('Funcionario actualizado.');
    }
    setModal(null);
  };

  const deletePersonal = (doc) => {
    setPersonal(prev=>prev.filter(p=>p.doc!==doc));
    setConfirm(null);
    showToast('Funcionario eliminado.','danger');
  };

  // ── CRUD Pacientes ──
  const savePaciente = (form) => {
    if(modal.mode==='add') {
      if(pacientes.find(p=>p.doc===form.doc)) { showToast('Ya existe un paciente con ese documento.','danger'); return; }
      const hoy=new Date();
      form.fechaReg=`${hoy.getDate()}/${hoy.getMonth()+1}/${hoy.getFullYear()}`;
      setPacientes(prev=>[...prev,form]);
      showToast('Paciente registrado correctamente.');
    } else {
      setPacientes(prev=>prev.map(p=>p.doc===form.doc?form:p));
      showToast('Paciente actualizado.');
    }
    setModal(null);
  };

  const deletePaciente = (doc) => {
    setPacientes(prev=>prev.filter(p=>p.doc!==doc));
    setConfirm(null);
    showToast('Paciente eliminado.','danger');
  };

  // Filtros
  const persFiltrado = personal.filter(p=>{
    const matchRol = filRol==='Todos los roles' || p.rol===filRol;
    const matchEst = filEst==='Todos los estados' || p.estado===filEst;
    const matchBusq = !busqPers || p.nombre.toLowerCase().includes(busqPers.toLowerCase()) || p.doc.includes(busqPers);
    return matchRol && matchEst && matchBusq;
  });

  const pacFiltrado = pacientes.filter(p=>{
    return !busqPac || p.nombre.toLowerCase().includes(busqPac.toLowerCase()) || p.doc.includes(busqPac);
  });

  const hoy = new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // ── Estilos comunes ──
  const sideBtn = (id) => ({
    display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',
    borderRadius:8,border:'none',cursor:'pointer',marginBottom:2,fontSize:'.83rem',
    fontWeight:tab===id?700:400,background:tab===id?'#0d6efd':'transparent',
    color:tab===id?'white':'#9ca3af',transition:'all .15s',
  });

  const thStyle = { padding:'10px 14px',fontSize:'.68rem',textTransform:'uppercase',
    letterSpacing:'.06em',color:'#9ca3af',fontWeight:600,background:'#f9fafb',
    borderBottom:'1px solid #e5e7eb' };

  const tdStyle = { padding:'12px 14px',fontSize:'.84rem',color:'#374151',
    borderBottom:'1px solid #f3f4f6',verticalAlign:'middle' };

  return (
    <div style={{display:'flex',height:'100vh',fontFamily:"'Segoe UI',system-ui,sans-serif",background:'#f3f4f6'}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:220,background:'#111827',display:'flex',flexDirection:'column',flexShrink:0,boxShadow:'2px 0 8px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 20px',borderBottom:'1px solid #1f2937'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <i className="bi bi-shield-plus" style={{color:'#0dcaf0',fontSize:'1.1rem'}}/>
            <span style={{color:'white',fontWeight:800,fontSize:'.9rem',letterSpacing:'.05em'}}>NOVA SMILE</span>
            <span style={{background:'#0d6efd',color:'white',fontSize:'.55rem',fontWeight:700,padding:'1px 6px',borderRadius:4}}>ADMIN</span>
          </div>
        </div>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #1f2937'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className="bi bi-person-fill" style={{color:'#9ca3af',fontSize:'.9rem'}}/>
            </div>
            <div>
              <div style={{color:'white',fontSize:'.82rem',fontWeight:600}}>Administrador</div>
              <div style={{color:'#9ca3af',fontSize:'.7rem'}}>{session.usuario}</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:'12px'}}>
          {NAV_ITEMS.map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)} style={sideBtn(item.id)}>
              <i className={`bi ${item.icon}`} style={{fontSize:'.95rem'}}/>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px',borderTop:'1px solid #1f2937'}}>
          <button onClick={onLogout} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',cursor:'pointer',fontSize:'.83rem',background:'transparent',color:'#ef4444',fontWeight:600}}>
            <i className="bi bi-box-arrow-right"/> Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{background:'#111827',padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:16,borderBottom:'1px solid #1f2937',flexShrink:0}}>
          <span style={{color:'#9ca3af',fontSize:'.85rem'}}>{time}</span>
          <span style={{color:'white',fontSize:'.85rem',display:'flex',alignItems:'center',gap:6}}>
            <i className="bi bi-person-circle" style={{color:'#9ca3af'}}/> {session.usuario} ▾
          </span>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position:'fixed',top:16,right:16,zIndex:2000,
            background:toast.tipo==='danger'?'#ef4444':'#22c55e',
            color:'white',borderRadius:10,padding:'12px 20px',fontWeight:600,fontSize:'.85rem',
            boxShadow:'0 4px 16px rgba(0,0,0,.2)',display:'flex',alignItems:'center',gap:8,
          }}>
            <i className={`bi ${toast.tipo==='danger'?'bi-x-circle':'bi-check-circle'}`}/>
            {toast.msg}
          </div>
        )}

        <div style={{flex:1,overflowY:'auto',padding:'28px'}}>

          {/* ── DASHBOARD ── */}
          {tab==='dashboard' && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:24}}>
                <h4 style={{fontWeight:700,margin:0,color:'#111827'}}>Panel de Control</h4>
                <span style={{color:'#6b7280',fontSize:'.85rem',textTransform:'capitalize'}}>{hoy}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
                {[
                  {icon:'bi-people-fill',    label:'PACIENTES',      val:(1250+pacientes.length).toLocaleString('es-CO'), color:'#6366f1',bg:'#ede9fe'},
                  {icon:'bi-person-badge',   label:'PERSONAL ACTIVO',val:personal.filter(p=>p.estado==='Activo').length,  color:'#22c55e',bg:'#dcfce7'},
                  {icon:'bi-calendar-check', label:'CITAS DEL MES',  val:342,                                              color:'#f59e0b',bg:'#fef3c7'},
                  {icon:'bi-cash-stack',     label:'INGRESOS MES',   val:'$4.200.000',                                     color:'#ef4444',bg:'#fee2e2'},
                ].map(m=>(
                  <div key={m.label} style={{background:'white',borderRadius:12,padding:'18px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:16}}>
                    <div style={{width:48,height:48,borderRadius:12,background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <i className={`bi ${m.icon}`} style={{color:m.color,fontSize:'1.3rem'}}/>
                    </div>
                    <div>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color:'#111827',lineHeight:1.1}}>{m.val}</div>
                      <div style={{fontSize:'.67rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginTop:2}}>{m.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20}}>
                <div style={{background:'white',borderRadius:12,padding:'20px 24px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
                  <h6 style={{fontWeight:700,color:'#111827',marginBottom:16}}>Flujo de atenciones (mensual)</h6>
                  <LineChart data={[120,190,150,280,220,310,265,340,290,320,380,410]}/>
                </div>
                <div style={{background:'white',borderRadius:12,padding:'20px 24px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
                  <h6 style={{fontWeight:700,color:'#111827',marginBottom:16}}>Tratamientos frecuentes</h6>
                  <DonutChart/>
                </div>
              </div>
            </>
          )}

          {/* ── PERSONAL ── */}
          {tab==='personal' && (
            <div>
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h4 style={{fontWeight:700,margin:0,color:'#111827'}}>Gestión de Talento Humano</h4>
                <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                  {/* Filtro rol */}
                  <select className="form-select form-select-sm" value={filRol} onChange={e=>setFilRol(e.target.value)} style={{minWidth:160,fontSize:'.8rem'}}>
                    <option>Todos los roles</option>
                    {ROLES.map(r=><option key={r}>{r}</option>)}
                  </select>
                  {/* Filtro estado */}
                  <select className="form-select form-select-sm" value={filEst} onChange={e=>setFilEst(e.target.value)} style={{minWidth:160,fontSize:'.8rem'}}>
                    <option>Todos los estados</option>
                    {ESTADOS.map(e=><option key={e}>{e}</option>)}
                  </select>
                  {/* Búsqueda */}
                  <div style={{position:'relative'}}>
                    <i className="bi bi-search" style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:'.8rem'}}/>
                    <input className="form-control form-control-sm" placeholder="Buscar nombre o doc..." value={busqPers} onChange={e=>setBusqPers(e.target.value)} style={{paddingLeft:28,minWidth:190,fontSize:'.8rem'}}/>
                  </div>
                  <button onClick={()=>setModal({type:'personal',mode:'add'})} style={{
                    display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:8,
                    border:'none',background:'#0d6efd',color:'white',cursor:'pointer',fontWeight:700,fontSize:'.84rem',whiteSpace:'nowrap',
                  }}>
                    <i className="bi bi-plus-circle"/> + Nuevo
                  </button>
                </div>
              </div>

              {/* Tabla */}
              <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['DOCUMENTO','FUNCIONARIO','ROL','EMAIL','TELÉFONO','ESPECIALIDAD','ESTADO','ACCIONES'].map(h=>(
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {persFiltrado.length===0
                      ? <tr><td colSpan={8} style={{...tdStyle,textAlign:'center',color:'#9ca3af',padding:32}}>No se encontraron funcionarios.</td></tr>
                      : persFiltrado.map(p=>(
                        <tr key={p.doc} style={{transition:'background .1s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e=>e.currentTarget.style.background='white'}>
                          <td style={tdStyle}>{p.doc}</td>
                          <td style={tdStyle}>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <Avatar nombre={p.nombre} color={ROL_COLORS[p.rol]||'#6366f1'}/>
                              <span style={{fontWeight:600,color:'#111827'}}>{p.nombre}</span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <span style={{background:(ROL_COLORS[p.rol]||'#6366f1')+'18',color:ROL_COLORS[p.rol]||'#6366f1',borderRadius:20,padding:'3px 10px',fontSize:'.75rem',fontWeight:700}}>
                              {p.rol}
                            </span>
                          </td>
                          <td style={tdStyle}>{p.email}</td>
                          <td style={tdStyle}>{p.tel||'—'}</td>
                          <td style={tdStyle}>{p.esp||'—'}</td>
                          <td style={tdStyle}>
                            <span style={{background:p.estado==='Activo'?'#dcfce7':'#fee2e2',color:p.estado==='Activo'?'#15803d':'#b91c1c',borderRadius:20,padding:'3px 12px',fontSize:'.75rem',fontWeight:700}}>
                              {p.estado}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{display:'flex',gap:6}}>
                              <AccionBtn icon="bi-pencil"    color="#0d6efd" title="Editar"    onClick={()=>setModal({type:'personal',mode:'edit',data:{...p}})}/>
                              <AccionBtn icon="bi-gear"      color="#f59e0b" title="Permisos"  onClick={()=>showToast('Módulo de permisos próximamente.')}/>
                              <AccionBtn icon="bi-trash"     color="#ef4444" title="Eliminar"  onClick={()=>setConfirm({type:'personal',doc:p.doc,nombre:p.nombre})}/>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                <div style={{padding:'12px 16px',borderTop:'1px solid #f3f4f6',fontSize:'.78rem',color:'#9ca3af'}}>
                  Mostrando {persFiltrado.length} de {personal.length} funcionarios
                </div>
              </div>
            </div>
          )}

          {/* ── PACIENTES ── */}
          {tab==='pacientes' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h4 style={{fontWeight:700,margin:0,color:'#111827'}}>Registro de Pacientes</h4>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{position:'relative'}}>
                    <i className="bi bi-search" style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:'.8rem'}}/>
                    <input className="form-control form-control-sm" placeholder="Buscar paciente..." value={busqPac} onChange={e=>setBusqPac(e.target.value)} style={{paddingLeft:28,minWidth:200,fontSize:'.8rem'}}/>
                  </div>
                  <button onClick={()=>setModal({type:'paciente',mode:'add'})} style={{
                    display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:8,
                    border:'none',background:'#0d6efd',color:'white',cursor:'pointer',fontWeight:700,fontSize:'.84rem',whiteSpace:'nowrap',
                  }}>
                    <i className="bi bi-person-plus"/> Nuevo paciente
                  </button>
                </div>
              </div>

              <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['DOCUMENTO','NOMBRE','TELÉFONO','CORREO','FECHA REGISTRO','ESTADO','ACCIONES'].map(h=>(
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pacFiltrado.length===0
                      ? <tr><td colSpan={7} style={{...tdStyle,textAlign:'center',color:'#9ca3af',padding:32}}>No se encontraron pacientes.</td></tr>
                      : pacFiltrado.map(p=>(
                        <tr key={p.doc} style={{transition:'background .1s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e=>e.currentTarget.style.background='white'}>
                          <td style={tdStyle}>{p.doc}</td>
                          <td style={{...tdStyle,fontWeight:600,color:'#111827'}}>{p.nombre}</td>
                          <td style={tdStyle}>{p.tel}</td>
                          <td style={tdStyle}>{p.correo}</td>
                          <td style={tdStyle}>{p.fechaReg||'—'}</td>
                          <td style={tdStyle}>
                            <span style={{background:p.estado==='Activo'?'#dcfce7':'#fee2e2',color:p.estado==='Activo'?'#15803d':'#b91c1c',borderRadius:20,padding:'3px 12px',fontSize:'.75rem',fontWeight:700}}>
                              {p.estado||'Activo'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{display:'flex',gap:6}}>
                              <AccionBtn icon="bi-pencil" color="#0d6efd" title="Editar"    onClick={()=>setModal({type:'paciente',mode:'edit',data:{...p}})}/>
                              <AccionBtn icon="bi-trash"  color="#ef4444" title="Eliminar"  onClick={()=>setConfirm({type:'paciente',doc:p.doc,nombre:p.nombre})}/>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                <div style={{padding:'12px 16px',borderTop:'1px solid #f3f4f6',fontSize:'.78rem',color:'#9ca3af'}}>
                  Mostrando {pacFiltrado.length} de {pacientes.length} pacientes
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIG CLÍNICA ── */}
          {tab==='config' && (
            <div>
              <h4 style={{fontWeight:700,marginBottom:20,color:'#111827'}}><i className="bi bi-building me-2 text-warning"/>Configuración de la Clínica</h4>
              <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.06)',maxWidth:560}}>
                {[['Nombre de la clínica','Nova Smile Pro'],['NIT','900.123.456-7'],['Dirección','Calle 10 #5-32, Arauca'],['Teléfono','(7) 8854321'],['Email','info@novasmile.com']].map(([l,v])=>(
                  <div key={l} className="mb-3">
                    <label style={{fontSize:'.78rem',fontWeight:700,color:'#6b7280',display:'block',marginBottom:4,textTransform:'uppercase'}}>{l}</label>
                    <input className="form-control" defaultValue={v}/>
                  </div>
                ))}
                <button className="btn btn-primary mt-2" onClick={()=>showToast('Configuración guardada.')}><i className="bi bi-save me-1"/>Guardar cambios</button>
              </div>
            </div>
          )}

          {/* ── AUDITORÍA ── */}
          {tab==='auditoria' && (
            <div>
              <h4 style={{fontWeight:700,marginBottom:20,color:'#111827'}}><i className="bi bi-card-list me-2 text-info"/>Registro de Auditoría</h4>
              <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>
                {logs.length===0
                  ? <div style={{padding:32,textAlign:'center',color:'#9ca3af'}}><i className="bi bi-journal-x" style={{fontSize:'2rem',display:'block',marginBottom:8}}/>No hay registros aún.</div>
                  : <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr>{['Usuario','Rol','Hora de acceso'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{logs.map((l,i)=>(
                        <tr key={i}>
                          <td style={{...tdStyle,fontWeight:600}}>{l.usuario}</td>
                          <td style={tdStyle}><span className="badge bg-secondary">{l.rol}</span></td>
                          <td style={tdStyle}>{new Date(l.hora).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                }
              </div>
            </div>
          )}

          {/* ── BASE DE DATOS ── */}
          {tab==='bd' && (
            <div>
              <h4 style={{fontWeight:700,marginBottom:20,color:'#111827'}}><i className="bi bi-database me-2"/>Base de Datos</h4>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                {[
                  {label:'Pacientes',  val:pacientes.length, icon:'bi-people',          color:'#6366f1'},
                  {label:'Personal',   val:personal.length,  icon:'bi-person-badge',    color:'#0d6efd'},
                  {label:'Citas',      val:342,              icon:'bi-calendar-check',  color:'#22c55e'},
                  {label:'Facturas',   val:89,               icon:'bi-receipt',         color:'#f59e0b'},
                  {label:'Tratamientos',val:512,             icon:'bi-clipboard2-pulse',color:'#ef4444'},
                  {label:'Logs',       val:logs.length,      icon:'bi-journal',         color:'#8b5cf6'},
                ].map(s=>(
                  <div key={s.label} style={{background:'white',borderRadius:12,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,.06)',textAlign:'center'}}>
                    <i className={`bi ${s.icon}`} style={{color:s.color,fontSize:'2rem',display:'block',marginBottom:8}}/>
                    <div style={{fontSize:'1.8rem',fontWeight:800,color:'#111827'}}>{s.val.toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'.72rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.05em'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALES ── */}
      {modal?.type==='personal' && (
        <Modal title={modal.mode==='add'?'Nuevo funcionario':'Editar funcionario'} onClose={()=>setModal(null)}>
          <FormPersonal initial={modal.data} onSave={savePersonal} onClose={()=>setModal(null)}/>
        </Modal>
      )}
      {modal?.type==='paciente' && (
        <Modal title={modal.mode==='add'?'Nuevo paciente':'Editar paciente'} onClose={()=>setModal(null)}>
          <FormPaciente initial={modal.data} onSave={savePaciente} onClose={()=>setModal(null)}/>
        </Modal>
      )}
      {confirm && (
        <ConfirmModal
          message={`¿Eliminar a ${confirm.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={()=> confirm.type==='personal' ? deletePersonal(confirm.doc) : deletePaciente(confirm.doc)}
          onCancel={()=>setConfirm(null)}
        />
      )}
    </div>
  );
}
