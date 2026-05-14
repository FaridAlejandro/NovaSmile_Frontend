/**
 * Nova Smile — Módulo Recepcionista
 * Check-in funcional: busca por cédula y liga al paciente correcto de la agenda
 */
import React, { useState, useEffect } from 'react';

// ── Pacientes DB: doc → datos ─────────────────────────────────────────────────
const PACIENTES_INIT = {
  '80543221': { nombre: 'Carlos Ruiz',   tel: '3104567890', email:'', eps:'', alergias:'', genero:'Masculino',  fechaNac:'', obs:'' },
  '44556677': { nombre: 'Ana Beltrán',   tel: '3001234567', email:'', eps:'', alergias:'', genero:'Femenino',   fechaNac:'', obs:'' },
  '11223344': { nombre: 'Pedro Mora',    tel: '3209876543', email:'', eps:'', alergias:'', genero:'Masculino',  fechaNac:'', obs:'' },
  '99887766': { nombre: 'Luisa Cano',    tel: '3157654321', email:'', eps:'', alergias:'', genero:'Femenino',   fechaNac:'', obs:'' },
  '55443322': { nombre: 'Mario López',   tel: '3126543210', email:'', eps:'', alergias:'', genero:'Masculino',  fechaNac:'', obs:'' },
};

// ── Citas del día con el campo `doc` que vincula al paciente ─────────────────
const CITAS_INIT = [
  { id:1, doc:'80543221', paciente:'Carlos Ruiz',   servicio:'Control Endodoncia',    doctor:'Dr. Farid Torres',  hora:'09:00', estado:'Confirmada', monto:80000 },
  { id:2, doc:'44556677', paciente:'Ana Beltrán',   servicio:'Evaluación inicial',     doctor:'Dra. Elena Gelves', hora:'10:30', estado:'Confirmada', monto:50000 },
  { id:3, doc:'11223344', paciente:'Pedro Mora',    servicio:'Limpieza dental',        doctor:'Dr. Farid Torres',  hora:'11:00', estado:'Confirmada', monto:60000 },
  { id:4, doc:'99887766', paciente:'Luisa Cano',    servicio:'Radiografía panorámica', doctor:'Dra. Elena Gelves', hora:'12:00', estado:'Confirmada', monto:90000 },
  { id:5, doc:'55443322', paciente:'Mario López',   servicio:'Consulta general',       doctor:'Dr. Farid Torres',  hora:'15:00', estado:'Confirmada', monto:40000 },
];

const ESTADO_CFG = {
  Confirmada:  { bg:'#dbeafe', color:'#1e40af' },
  'En Espera': { bg:'#fef9c3', color:'#854d0e' },
  Atendido:    { bg:'#dcfce7', color:'#15803d' },
  Cancelada:   { bg:'#fee2e2', color:'#b91c1c' },
};

const DOCTORES = ['Todos los doctores','Dr. Farid Torres','Dra. Elena Gelves'];
const FILTROS  = ['Todas','Confirmadas','En sala','Atendidos'];
const AVATAR_COLORS = ['#f59e0b','#6366f1','#22c55e','#ef4444','#0dcaf0','#8b5cf6'];

function Avatar({ nombre, idx=0 }) {
  const ini = (nombre||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
  return (
    <div style={{
      width:38,height:38,borderRadius:'50%',background:AVATAR_COLORS[idx%AVATAR_COLORS.length],
      display:'flex',alignItems:'center',justifyContent:'center',
      color:'white',fontWeight:700,fontSize:'.82rem',flexShrink:0,
    }}>{ini}</div>
  );
}

export default function RecepcionPage({ session, onLogout }) {
  const [citas,         setCitas]         = useState(CITAS_INIT);
  const [pacientesDB,   setPacientesDB]   = useState(PACIENTES_INIT);
  const [docInput,      setDocInput]      = useState('');
  const [checkinMsg,    setCheckinMsg]    = useState(null);
  const [filtro,        setFiltro]        = useState('Todas');
  const [doctor,        setDoctor]        = useState('Todos los doctores');
  const [busqueda,      setBusqueda]      = useState('');
  const [busquedaPac,   setBusquedaPac]   = useState('');
  const [tabMain,       setTabMain]       = useState('agenda');
  const [time,          setTime]          = useState('');
  const [showNuevaCita,     setShowNuevaCita]     = useState(false);
  const [nuevaCita,         setNuevaCita]         = useState({paciente:'',servicio:'',doctor:'',hora:'',monto:''});
  const [toast,             setToast]             = useState(null);
  const [showRegistro,      setShowRegistro]      = useState(false);
  const [registroStep,      setRegistroStep]      = useState(1); // 1=datos, 2=éxito
  const [nuevoPaciente,     setNuevoPaciente]     = useState({
    nombre:'', apellido:'', cedula:'', fechaNac:'',
    genero:'', tel:'', email:'', eps:'', alergias:'', obs:'',
  });

  useEffect(()=>{
    const fmt=()=>setTime(new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
    fmt(); const t=setInterval(fmt,1000); return ()=>clearInterval(t);
  },[]);

  const showToast=(msg,tipo='success')=>{setToast({msg,tipo});setTimeout(()=>setToast(null),3000);};

  // ── MÉTRICAS ────────────────────────────────────────────────────────────────
  const citasHoy  = citas.length;
  const enEspera  = citas.filter(c=>c.estado==='En Espera').length;
  const atendidos = citas.filter(c=>c.estado==='Atendido').length;
  const porCobrar = citas.filter(c=>c.estado!=='Atendido').reduce((a,c)=>a+(c.monto||0),0);

  // ── FILTRADO DE TABLA ────────────────────────────────────────────────────────
  const citasFiltradas = citas.filter(c=>{
    const matchF =
      filtro==='Todas'       ||
      (filtro==='Confirmadas' && c.estado==='Confirmada') ||
      (filtro==='En sala'     && c.estado==='En Espera')  ||
      (filtro==='Atendidos'   && c.estado==='Atendido');
    const matchD = doctor==='Todos los doctores' || c.doctor===doctor;
    const matchB = !busqueda || c.paciente.toLowerCase().includes(busqueda.toLowerCase()) || c.doc?.includes(busqueda);
    return matchF && matchD && matchB;
  });

  const sala = citas.filter(c=>c.estado==='En Espera');

  const cambiarEstado=(id,estado)=>setCitas(prev=>prev.map(c=>c.id===id?{...c,estado}:c));

  // ── CHECK-IN ─────────────────────────────────────────────────────────────────
  // Busca la cita del paciente por su número de documento (campo `doc`)
  const checkIn = () => {
    const docTrimmed = docInput.trim();
    if (!docTrimmed) return;

    // Buscar la cita que coincida con el documento ingresado
    const cita = citas.find(c => c.doc === docTrimmed);

    if (!cita) {
      setCheckinMsg({tipo:'danger', texto:`No se encontró ninguna cita con el documento: ${docTrimmed}`});
      setTimeout(()=>setCheckinMsg(null), 4000);
      return;
    }

    if (cita.estado === 'En Espera') {
      setCheckinMsg({tipo:'warning', texto:`${cita.paciente} ya está en sala de espera.`});
      setTimeout(()=>setCheckinMsg(null), 4000);
      return;
    }

    if (cita.estado === 'Atendido') {
      setCheckinMsg({tipo:'warning', texto:`${cita.paciente} ya fue atendido hoy.`});
      setTimeout(()=>setCheckinMsg(null), 4000);
      return;
    }

    if (cita.estado === 'Cancelada') {
      setCheckinMsg({tipo:'danger', texto:`La cita de ${cita.paciente} está cancelada.`});
      setTimeout(()=>setCheckinMsg(null), 4000);
      return;
    }

    // Cita encontrada en estado Confirmada → pasar a En Espera
    cambiarEstado(cita.id, 'En Espera');
    setDocInput('');
    setCheckinMsg({tipo:'success', texto:`✓ Check-in exitoso: ${cita.paciente} — ${cita.hora} con ${cita.doctor}`});
    setTimeout(()=>setCheckinMsg(null), 4000);
  };

  // ── NUEVA CITA ───────────────────────────────────────────────────────────────
  const agregarCita = (e) => {
    e.preventDefault();
    if (!nuevaCita.paciente||!nuevaCita.hora||!nuevaCita.doctor) return;
    setCitas(prev=>[...prev,{
      id:Date.now(), doc:'manual',
      ...nuevaCita, estado:'Confirmada', monto:Number(nuevaCita.monto)||0,
    }]);
    setNuevaCita({paciente:'',servicio:'',doctor:'',hora:'',monto:''});
    setShowNuevaCita(false);
    showToast('Cita agregada correctamente.');
  };

  // ── REGISTRO PACIENTE NUEVO ──────────────────────────────────────────────────
  const registrarPaciente = () => {
    const { nombre, apellido, cedula, tel, email, eps, alergias, genero, fechaNac, obs } = nuevoPaciente;
    if (!nombre || !apellido || !cedula || !tel) return;
    setPacientesDB(prev => ({
      ...prev,
      [cedula]: { nombre: `${nombre} ${apellido}`, tel, email, eps, alergias, genero, fechaNac, obs },
    }));
    setRegistroStep(2);
  };
  const cerrarRegistro = () => {
    setShowRegistro(false);
    setRegistroStep(1);
    setNuevoPaciente({ nombre:'', apellido:'', cedula:'', fechaNac:'', genero:'', tel:'', email:'', eps:'', alergias:'', obs:'' });
  };


  const thStyle={padding:'10px 14px',fontSize:'.68rem',textTransform:'uppercase',
    letterSpacing:'.05em',color:'#9ca3af',fontWeight:600,background:'#f9fafb',
    borderBottom:'1px solid #e5e7eb',whiteSpace:'nowrap'};
  const tdStyle={padding:'11px 14px',fontSize:'.83rem',color:'#374151',
    borderBottom:'1px solid #f3f4f6',verticalAlign:'middle'};

  return (
    <div style={{background:'#f3f4f6',minHeight:'100vh',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* Toast */}
      {toast&&(
        <div style={{
          position:'fixed',top:16,right:16,zIndex:2000,
          background:toast.tipo==='danger'?'#ef4444':'#22c55e',
          color:'white',borderRadius:10,padding:'12px 20px',fontWeight:600,
          fontSize:'.85rem',boxShadow:'0 4px 16px rgba(0,0,0,.2)',
          display:'flex',alignItems:'center',gap:8,
        }}>
          <i className={`bi ${toast.tipo==='danger'?'bi-x-circle':'bi-check-circle'}`}/> {toast.msg}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{
        background:'#111827',height:52,padding:'0 24px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        boxShadow:'0 2px 6px rgba(0,0,0,.3)',position:'sticky',top:0,zIndex:100,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <i className="bi bi-calendar2-week-fill" style={{color:'white',fontSize:'1.1rem'}}/>
          <span style={{color:'white',fontWeight:800,fontSize:'.9rem',letterSpacing:'.05em'}}>NOVA SMILE</span>
          <span style={{
            background:'#0dcaf0',color:'#0c4a6e',fontSize:'.6rem',
            fontWeight:800,padding:'2px 7px',borderRadius:4,letterSpacing:'.04em',
          }}>RECEPCIÓN</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{color:'#9ca3af',fontSize:'.85rem'}}>{time}</span>
          <button onClick={onLogout} style={{
            background:'transparent',border:'1.5px solid #ef4444',
            color:'#ef4444',borderRadius:8,padding:'4px 14px',
            cursor:'pointer',fontSize:'.8rem',fontWeight:600,
            display:'flex',alignItems:'center',gap:6,
          }}>
            <i className="bi bi-box-arrow-right"/> Salir
          </button>
        </div>
      </nav>

      {/* MÉTRICAS TOP */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottom:'1px solid #e5e7eb'}}>
        {[
          {val:citasHoy,  label:'CITAS HOY',        color:'#0d6efd',border:'#0d6efd'},
          {val:enEspera,  label:'EN SALA DE ESPERA', color:'#f59e0b',border:'#f59e0b'},
          {val:atendidos, label:'ATENDIDOS',          color:'#22c55e',border:'#22c55e'},
          {val:`$ ${porCobrar.toLocaleString('es-CO')}`,label:'POR COBRAR',color:'#ef4444',border:'#ef4444'},
        ].map((m,i)=>(
          <div key={i} style={{
            background:'white',padding:'18px 24px',
            borderLeft:`4px solid ${m.border}`,
            borderRight:i<3?'1px solid #e5e7eb':'none',
          }}>
            <div style={{fontSize:'2rem',fontWeight:800,color:m.color,lineHeight:1}}>{m.val}</div>
            <div style={{fontSize:'.68rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginTop:4}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',height:'calc(100vh - 52px - 74px)',overflow:'hidden'}}>

        {/* ── PANEL IZQUIERDO ── */}
        <div style={{width:290,flexShrink:0,borderRight:'1px solid #e5e7eb',overflowY:'auto',background:'white',padding:20}}>

          {/* CHECK-IN */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:'.68rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
              <i className="bi bi-person-check"/> CHECK-IN DE LLEGADA
            </div>
            <div style={{fontSize:'.65rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:5}}>DOCUMENTO DEL PACIENTE</div>
            <div style={{display:'flex',gap:6}}>
              <input
                className="form-control form-control-sm"
                placeholder="Buscar por cédula / ID..."
                value={docInput}
                onChange={e=>setDocInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&checkIn()}
                style={{fontSize:'.82rem'}}
              />
              <button onClick={checkIn} className="btn btn-sm btn-primary" title="Hacer check-in">
                <i className="bi bi-check-lg"/>
              </button>
            </div>

            {/* Mensaje de resultado del check-in */}
            {checkinMsg && (
              <div style={{
                marginTop:8,padding:'8px 10px',borderRadius:8,fontSize:'.78rem',fontWeight:600,
                background:
                  checkinMsg.tipo==='success'?'#dcfce7':
                  checkinMsg.tipo==='warning'?'#fef9c3':'#fee2e2',
                color:
                  checkinMsg.tipo==='success'?'#15803d':
                  checkinMsg.tipo==='warning'?'#854d0e':'#b91c1c',
                border:`1px solid ${
                  checkinMsg.tipo==='success'?'#86efac':
                  checkinMsg.tipo==='warning'?'#fde68a':'#fca5a5'
                }`,
              }}>
                {checkinMsg.texto}
              </div>
            )}

            {/* Documentos de prueba — cliclables */}
            <div style={{
              background:'#fefce8',border:'1px solid #fde68a',borderRadius:8,
              padding:'8px 10px',marginTop:8,
            }}>
              <div style={{fontSize:'.68rem',color:'#78350f',fontWeight:700,marginBottom:6}}>
                <i className="bi bi-info-circle me-1"/>Documentos de prueba (clic para autocompletar):
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {Object.entries(pacientesDB).map(([doc,pac])=>(
                  <button
                    key={doc}
                    onClick={()=>setDocInput(doc)}
                    title={pac.nombre}
                    style={{
                      background:'#fef3c7',border:'1px solid #fbbf24',
                      borderRadius:6,padding:'3px 8px',cursor:'pointer',
                      fontSize:'.72rem',fontWeight:700,color:'#78350f',
                    }}
                  >
                    {doc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:'.68rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
              <i className="bi bi-lightning"/> ACCIONES RÁPIDAS
            </div>
            <button onClick={()=>setShowNuevaCita(true)} style={{
              display:'flex',alignItems:'center',gap:8,width:'100%',
              padding:'10px 12px',borderRadius:8,border:'1.5px solid #0d6efd',
              background:'white',color:'#0d6efd',cursor:'pointer',fontWeight:600,fontSize:'.83rem',marginBottom:8,
            }}>
              <i className="bi bi-calendar-plus"/> Agendar nueva cita
            </button>
            <button onClick={()=>setShowRegistro(true)} style={{
              display:'flex',alignItems:'center',gap:8,width:'100%',
              padding:'10px 12px',borderRadius:8,border:'1.5px solid #f59e0b',
              background:'white',color:'#92400e',cursor:'pointer',fontWeight:600,fontSize:'.83rem',
            }}>
              <i className="bi bi-person-plus"/> Registrar paciente nuevo
            </button>
          </div>

          {/* SALA DE ESPERA */}
          <div>
            <div style={{fontSize:'.68rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
              <i className="bi bi-door-open"/> SALA DE ESPERA
              <span style={{width:8,height:8,borderRadius:'50%',background:'#ef4444',display:'inline-block',marginLeft:2}}/>
            </div>
            <div style={{background:'#111827',borderRadius:12,padding:12}}>
              {sala.length===0
                ? <p style={{color:'#6b7280',fontSize:'.8rem',textAlign:'center',margin:'12px 0'}}>Sala vacía</p>
                : sala.map((c,i)=>(
                  <div key={c.id} style={{
                    display:'flex',alignItems:'center',gap:10,padding:'10px 0',
                    borderBottom:i<sala.length-1?'1px solid #1f2937':'none',
                  }}>
                    <Avatar nombre={c.paciente} idx={i}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:'white',fontWeight:600,fontSize:'.82rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {c.paciente}
                      </div>
                      <div style={{color:'#6b7280',fontSize:'.72rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {c.servicio} · {c.doctor}
                      </div>
                    </div>
                    <span style={{color:'#f59e0b',fontWeight:700,fontSize:'.8rem',flexShrink:0}}>{c.hora}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>

          {/* Tabs */}
          <div style={{display:'flex',borderBottom:'1px solid #e5e7eb',marginBottom:14,gap:4}}>
            {[
              {id:'agenda',    icon:'bi-list-ul',        label:'Agenda del día'},
              {id:'pacientes', icon:'bi-people-fill',    label:'Pacientes'},
              {id:'semana',    icon:'bi-calendar-week',  label:'Calendario semanal'},
              {id:'caja',      icon:'bi-cash-coin',      label:'Caja y facturación'},
            ].map(t=>(
              <button key={t.id} onClick={()=>setTabMain(t.id)} style={{
                background:'transparent',border:'none',cursor:'pointer',
                padding:'10px 16px',fontSize:'.85rem',fontWeight:600,
                color:tabMain===t.id?'#0d6efd':'#6c757d',
                borderBottom:tabMain===t.id?'2px solid #0d6efd':'2px solid transparent',
                display:'flex',alignItems:'center',gap:5,marginBottom:-1,
              }}>
                <i className={`bi ${t.icon}`}/> {t.label}
                {t.id==='pacientes'&&(
                  <span style={{
                    background:'#0d6efd',color:'white',borderRadius:20,
                    fontSize:'.62rem',fontWeight:800,padding:'1px 6px',lineHeight:1.4,
                  }}>{Object.keys(pacientesDB).length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Modal nueva cita */}
          {showNuevaCita&&(
            <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:12,padding:18,marginBottom:14,boxShadow:'0 4px 16px rgba(0,0,0,.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h6 style={{fontWeight:700,margin:0}}>Nueva cita</h6>
                <button onClick={()=>setShowNuevaCita(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'#6b7280'}}>✕</button>
              </div>
              <form onSubmit={agregarCita}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
                  <input className="form-control form-control-sm" placeholder="Paciente *" value={nuevaCita.paciente} onChange={e=>setNuevaCita({...nuevaCita,paciente:e.target.value})} required/>
                  <input className="form-control form-control-sm" placeholder="Servicio" value={nuevaCita.servicio} onChange={e=>setNuevaCita({...nuevaCita,servicio:e.target.value})}/>
                  <select className="form-select form-select-sm" value={nuevaCita.doctor} onChange={e=>setNuevaCita({...nuevaCita,doctor:e.target.value})} required>
                    <option value="">Doctor *</option>
                    <option>Dr. Farid Torres</option>
                    <option>Dra. Elena Gelves</option>
                  </select>
                  <input type="time" className="form-control form-control-sm" value={nuevaCita.hora} onChange={e=>setNuevaCita({...nuevaCita,hora:e.target.value})} required/>
                  <button type="submit" className="btn btn-sm btn-success">
                    <i className="bi bi-check-lg"/> Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── AGENDA DEL DÍA ── */}
          {tabMain==='agenda'&&(
            <>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                {FILTROS.map(f=>(
                  <button key={f} onClick={()=>setFiltro(f)} style={{
                    padding:'5px 14px',borderRadius:20,border:'1.5px solid',
                    cursor:'pointer',fontSize:'.8rem',fontWeight:600,
                    background:filtro===f?'#0d6efd':'white',
                    color:filtro===f?'white':'#374151',
                    borderColor:filtro===f?'#0d6efd':'#e5e7eb',
                  }}>{f}</button>
                ))}
                <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                  <select className="form-select form-select-sm" value={doctor} onChange={e=>setDoctor(e.target.value)} style={{fontSize:'.8rem',minWidth:170}}>
                    {DOCTORES.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <div style={{position:'relative'}}>
                    <i className="bi bi-search" style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:'.78rem'}}/>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Buscar paciente..."
                      value={busqueda}
                      onChange={e=>setBusqueda(e.target.value)}
                      style={{paddingLeft:26,fontSize:'.8rem',minWidth:160}}
                    />
                  </div>
                </div>
              </div>

              <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Hora</th>
                      <th style={thStyle}>Paciente</th>
                      <th style={thStyle}>Doctor</th>
                      <th style={thStyle}>Estado</th>
                      <th style={thStyle}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasFiltradas.length===0
                      ? <tr><td colSpan={5} style={{...tdStyle,textAlign:'center',color:'#9ca3af',padding:28}}>No hay citas para mostrar.</td></tr>
                      : citasFiltradas.map(c=>{
                          const ec=ESTADO_CFG[c.estado]||{bg:'#f3f4f6',color:'#374151'};
                          return (
                            <tr key={c.id} style={{transition:'background .1s'}}
                              onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                              onMouseLeave={e=>e.currentTarget.style.background='white'}>
                              <td style={{...tdStyle,fontWeight:700,fontSize:'.9rem',color:'#111827'}}>{c.hora}</td>
                              <td style={tdStyle}>
                                <div style={{fontWeight:600,color:'#111827'}}>{c.paciente}</div>
                                <div style={{fontSize:'.73rem',color:'#9ca3af'}}>{c.servicio}</div>
                                {c.doc && c.doc!=='manual' && <div style={{fontSize:'.7rem',color:'#c4b5fd'}}>Doc: {c.doc}</div>}
                              </td>
                              <td style={{...tdStyle,color:'#6b7280'}}>{c.doctor}</td>
                              <td style={tdStyle}>
                                <span style={{
                                  background:ec.bg,color:ec.color,borderRadius:20,
                                  padding:'3px 12px',fontSize:'.75rem',fontWeight:600,
                                }}>{c.estado}</span>
                              </td>
                              <td style={tdStyle}>
                                <div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap'}}>
                                  {c.estado==='Confirmada'&&(
                                    <button onClick={()=>cambiarEstado(c.id,'En Espera')} style={{
                                      background:'none',border:'1px solid #e5e7eb',borderRadius:6,
                                      padding:'3px 9px',cursor:'pointer',fontSize:'.75rem',
                                      color:'#374151',display:'flex',alignItems:'center',gap:3,
                                    }}>
                                      <i className="bi bi-person-check"/> Llegó
                                    </button>
                                  )}
                                  {c.estado==='En Espera'&&(
                                    <button onClick={()=>cambiarEstado(c.id,'Atendido')} style={{
                                      background:'none',border:'1px solid #e5e7eb',borderRadius:6,
                                      padding:'3px 9px',cursor:'pointer',fontSize:'.75rem',
                                      color:'#374151',display:'flex',alignItems:'center',gap:3,
                                    }}>
                                      <i className="bi bi-check"/> Atendido
                                    </button>
                                  )}
                                  {c.estado!=='Atendido'&&c.estado!=='Cancelada'&&(
                                    <button onClick={()=>cambiarEstado(c.id,'Cancelada')} style={{
                                      background:'none',border:'1px solid #e5e7eb',borderRadius:6,
                                      padding:'3px 7px',cursor:'pointer',fontSize:'.8rem',color:'#9ca3af',
                                    }}>✕</button>
                                  )}
                                  <button style={{
                                    background:'none',border:'1px solid #e5e7eb',borderRadius:6,
                                    padding:'3px 9px',cursor:'pointer',fontSize:'.75rem',
                                    color:'#374151',display:'flex',alignItems:'center',gap:3,
                                  }}>
                                    <i className="bi bi-receipt"/> Pago
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PACIENTES ── */}
          {tabMain==='pacientes'&&(
            <>
              {/* Barra de búsqueda y contador */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontWeight:700,color:'#111827',fontSize:'.9rem'}}>
                    Directorio de pacientes
                  </span>
                  <span style={{
                    background:'#f0f4ff',color:'#0d6efd',borderRadius:20,
                    fontSize:'.72rem',fontWeight:800,padding:'2px 10px',
                  }}>{Object.keys(pacientesDB).length} registros</span>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{position:'relative'}}>
                    <i className="bi bi-search" style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:'.78rem'}}/>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Buscar por nombre o cédula..."
                      value={busquedaPac}
                      onChange={e=>setBusquedaPac(e.target.value)}
                      style={{paddingLeft:28,fontSize:'.82rem',minWidth:220}}
                    />
                  </div>
                  <button onClick={()=>setShowRegistro(true)} style={{
                    display:'flex',alignItems:'center',gap:5,
                    padding:'6px 14px',borderRadius:8,border:'none',
                    background:'#f59e0b',color:'white',cursor:'pointer',fontWeight:700,fontSize:'.8rem',
                    whiteSpace:'nowrap',
                  }}>
                    <i className="bi bi-person-plus"/> Nuevo paciente
                  </button>
                </div>
              </div>

              {/* Tabla de pacientes */}
              <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)',overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Paciente','Cédula / ID','Teléfono','EPS','Alergias','Citas',''].map(h=>(
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pacientesDB)
                      .filter(([doc, p]) =>
                        !busquedaPac ||
                        p.nombre.toLowerCase().includes(busquedaPac.toLowerCase()) ||
                        doc.includes(busquedaPac)
                      )
                      .map(([doc, p], idx) => {
                        const citasPac = citas.filter(c => c.doc === doc);
                        const ultimaCita = citasPac[citasPac.length - 1];
                        return (
                          <tr key={doc}
                            style={{transition:'background .1s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                            onMouseLeave={e=>e.currentTarget.style.background='white'}>
                            {/* Paciente */}
                            <td style={tdStyle}>
                              <div style={{display:'flex',alignItems:'center',gap:10}}>
                                <Avatar nombre={p.nombre} idx={idx}/>
                                <div>
                                  <div style={{fontWeight:700,color:'#111827'}}>{p.nombre}</div>
                                  {p.genero&&<div style={{fontSize:'.7rem',color:'#9ca3af'}}>{p.genero}{p.fechaNac?` · Nac: ${p.fechaNac}`:''}</div>}
                                  {p.email&&<div style={{fontSize:'.7rem',color:'#6366f1'}}>{p.email}</div>}
                                </div>
                              </div>
                            </td>
                            {/* Cédula */}
                            <td style={tdStyle}>
                              <span style={{
                                background:'#f3f4f6',borderRadius:6,padding:'3px 8px',
                                fontFamily:'monospace',fontSize:'.82rem',fontWeight:700,color:'#374151',
                              }}>{doc}</span>
                            </td>
                            {/* Teléfono */}
                            <td style={{...tdStyle,color:'#374151'}}>
                              {p.tel
                                ? <div style={{display:'flex',alignItems:'center',gap:5}}>
                                    <i className="bi bi-phone" style={{color:'#22c55e',fontSize:'.8rem'}}/>
                                    {p.tel}
                                  </div>
                                : <span style={{color:'#d1d5db'}}>—</span>}
                            </td>
                            {/* EPS */}
                            <td style={{...tdStyle,color:'#6b7280'}}>
                              {p.eps || <span style={{color:'#d1d5db'}}>—</span>}
                            </td>
                            {/* Alergias */}
                            <td style={tdStyle}>
                              {p.alergias
                                ? <span style={{
                                    background:'#fee2e2',color:'#b91c1c',borderRadius:20,
                                    padding:'2px 10px',fontSize:'.72rem',fontWeight:600,
                                    display:'flex',alignItems:'center',gap:4,width:'fit-content',
                                  }}>
                                    <i className="bi bi-exclamation-triangle-fill" style={{fontSize:'.65rem'}}/>
                                    {p.alergias}
                                  </span>
                                : <span style={{color:'#d1d5db',fontSize:'.78rem'}}>Ninguna</span>}
                            </td>
                            {/* Citas */}
                            <td style={tdStyle}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <span style={{
                                  background:'#dbeafe',color:'#1e40af',borderRadius:20,
                                  padding:'2px 9px',fontSize:'.72rem',fontWeight:700,
                                }}>{citasPac.length}</span>
                                {ultimaCita&&(
                                  <span style={{fontSize:'.7rem',color:'#9ca3af'}}>
                                    Últ: {ultimaCita.hora}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Acciones */}
                            <td style={tdStyle}>
                              <div style={{display:'flex',gap:5}}>
                                <button
                                  onClick={()=>{
                                    setDocInput(doc);
                                    setTabMain('agenda');
                                  }}
                                  title="Ver agenda"
                                  style={{
                                    background:'none',border:'1px solid #e5e7eb',borderRadius:6,
                                    padding:'3px 9px',cursor:'pointer',fontSize:'.75rem',
                                    color:'#374151',display:'flex',alignItems:'center',gap:3,
                                  }}>
                                  <i className="bi bi-calendar"/> Agenda
                                </button>
                                <button
                                  onClick={()=>{
                                    setNuevaCita(prev=>({...prev,paciente:p.nombre}));
                                    setShowNuevaCita(true);
                                    setTabMain('agenda');
                                  }}
                                  title="Agendar cita"
                                  style={{
                                    background:'none',border:'1px solid #0d6efd',borderRadius:6,
                                    padding:'3px 9px',cursor:'pointer',fontSize:'.75rem',
                                    color:'#0d6efd',display:'flex',alignItems:'center',gap:3,
                                  }}>
                                  <i className="bi bi-calendar-plus"/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                    {Object.keys(pacientesDB).filter(doc => {
                      const p = pacientesDB[doc];
                      return !busquedaPac || p.nombre.toLowerCase().includes(busquedaPac.toLowerCase()) || doc.includes(busquedaPac);
                    }).length === 0 && (
                      <tr>
                        <td colSpan={7} style={{...tdStyle,textAlign:'center',color:'#9ca3af',padding:32}}>
                          <i className="bi bi-search" style={{fontSize:'1.5rem',display:'block',marginBottom:8}}/>
                          No se encontraron pacientes con "{busquedaPac}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CALENDARIO SEMANAL ── */}
          {tabMain==='semana'&&(
            <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.06)',textAlign:'center',color:'#9ca3af'}}>
              <i className="bi bi-calendar-week" style={{fontSize:'3rem',display:'block',marginBottom:10}}/>
              <p style={{fontSize:'.9rem'}}>Vista semanal próximamente disponible.</p>
            </div>
          )}

          {/* ── CAJA Y FACTURACIÓN ── */}
          {tabMain==='caja'&&(
            <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
              <h6 style={{fontWeight:700,color:'#111827',marginBottom:16}}>Resumen de caja del día</h6>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
                {[
                  {label:'Total facturado',val:citas.reduce((a,c)=>a+c.monto,0),color:'#0d6efd'},
                  {label:'Cobrado',val:citas.filter(c=>c.estado==='Atendido').reduce((a,c)=>a+c.monto,0),color:'#22c55e'},
                  {label:'Por cobrar',val:porCobrar,color:'#ef4444'},
                ].map(s=>(
                  <div key={s.label} style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',borderLeft:`3px solid ${s.color}`}}>
                    <div style={{fontSize:'1.3rem',fontWeight:800,color:s.color}}>${s.val.toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'.7rem',color:'#9ca3af',textTransform:'uppercase'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    {['Paciente','Servicio','Hora','Monto','Estado'].map(h=><th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {citas.map(c=>{
                    const ec=ESTADO_CFG[c.estado]||{};
                    return (
                      <tr key={c.id}>
                        <td style={{...tdStyle,fontWeight:600}}>{c.paciente}</td>
                        <td style={tdStyle}>{c.servicio}</td>
                        <td style={tdStyle}>{c.hora}</td>
                        <td style={{...tdStyle,fontWeight:700}}>${c.monto.toLocaleString('es-CO')}</td>
                        <td style={tdStyle}>
                          <span style={{background:ec.bg,color:ec.color,borderRadius:20,padding:'2px 10px',fontSize:'.72rem',fontWeight:600}}>
                            {c.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* ── MODAL REGISTRO PACIENTE NUEVO ── */}
      {showRegistro&&(
        <div style={{
          position:'fixed',inset:0,zIndex:3000,background:'rgba(0,0,0,.55)',
          display:'flex',alignItems:'center',justifyContent:'center',padding:16,
        }} onClick={e=>{if(e.target===e.currentTarget)cerrarRegistro();}}>
          <div style={{
            background:'white',borderRadius:16,width:'100%',maxWidth:580,
            boxShadow:'0 20px 60px rgba(0,0,0,.3)',overflow:'hidden',
            animation:'fadeIn .18s ease',
          }}>
            {/* Header */}
            <div style={{
              background:'linear-gradient(135deg,#f59e0b,#d97706)',
              padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{
                  width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,.2)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>
                  <i className="bi bi-person-plus-fill" style={{color:'white',fontSize:'1.1rem'}}/>
                </div>
                <div>
                  <div style={{color:'white',fontWeight:800,fontSize:'1rem'}}>Registrar paciente nuevo</div>
                  <div style={{color:'rgba(255,255,255,.75)',fontSize:'.75rem'}}>Complete los datos del paciente</div>
                </div>
              </div>
              <button onClick={cerrarRegistro} style={{
                background:'rgba(255,255,255,.2)',border:'none',borderRadius:8,
                width:32,height:32,cursor:'pointer',color:'white',fontSize:'1rem',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>✕</button>
            </div>

            {registroStep===1?(
              <div style={{padding:24}}>
                {/* Sección datos personales */}
                <div style={{marginBottom:18}}>
                  <div style={{
                    fontSize:'.68rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',
                    letterSpacing:'.06em',marginBottom:10,display:'flex',alignItems:'center',gap:5,
                  }}>
                    <i className="bi bi-person" style={{color:'#f59e0b'}}/> Datos personales
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>
                        Nombre <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Nombre"
                        value={nuevoPaciente.nombre}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,nombre:e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>
                        Apellido <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Apellido"
                        value={nuevoPaciente.apellido}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,apellido:e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>
                        Cédula / ID <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Número de documento"
                        value={nuevoPaciente.cedula}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,cedula:e.target.value.replace(/\D/,'')})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>Fecha de nacimiento</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={nuevoPaciente.fechaNac}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,fechaNac:e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>Género</label>
                      <select
                        className="form-select form-select-sm"
                        value={nuevoPaciente.genero}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,genero:e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        <option>Masculino</option>
                        <option>Femenino</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>
                        Teléfono <span style={{color:'#ef4444'}}>*</span>
                      </label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="3xxxxxxxxx"
                        value={nuevoPaciente.tel}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,tel:e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección contacto y salud */}
                <div style={{marginBottom:18}}>
                  <div style={{
                    fontSize:'.68rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',
                    letterSpacing:'.06em',marginBottom:10,display:'flex',alignItems:'center',gap:5,
                  }}>
                    <i className="bi bi-heart-pulse" style={{color:'#f59e0b'}}/> Información médica
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>Correo electrónico</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="correo@ejemplo.com"
                        type="email"
                        value={nuevoPaciente.email}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,email:e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>EPS / Seguro</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Nombre EPS o seguro"
                        value={nuevoPaciente.eps}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,eps:e.target.value})}
                      />
                    </div>
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>Alergias conocidas</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Ej: penicilina, látex (dejar en blanco si ninguna)"
                        value={nuevoPaciente.alergias}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,alergias:e.target.value})}
                      />
                    </div>
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={{fontSize:'.72rem',color:'#6b7280',fontWeight:600,display:'block',marginBottom:3}}>Observaciones</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Notas adicionales sobre el paciente..."
                        value={nuevoPaciente.obs}
                        onChange={e=>setNuevoPaciente({...nuevoPaciente,obs:e.target.value})}
                        style={{resize:'none'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Validación */}
                {(!nuevoPaciente.nombre||!nuevoPaciente.apellido||!nuevoPaciente.cedula||!nuevoPaciente.tel)&&(
                  <div style={{
                    background:'#fef9c3',border:'1px solid #fde68a',borderRadius:8,
                    padding:'8px 12px',fontSize:'.75rem',color:'#78350f',marginBottom:12,
                    display:'flex',alignItems:'center',gap:6,
                  }}>
                    <i className="bi bi-exclamation-triangle"/> Los campos marcados con <strong>*</strong> son obligatorios
                  </div>
                )}

                {/* Botones */}
                <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                  <button onClick={cerrarRegistro} style={{
                    padding:'8px 20px',borderRadius:8,border:'1.5px solid #e5e7eb',
                    background:'white',color:'#6b7280',cursor:'pointer',fontWeight:600,fontSize:'.85rem',
                  }}>Cancelar</button>
                  <button
                    onClick={registrarPaciente}
                    disabled={!nuevoPaciente.nombre||!nuevoPaciente.apellido||!nuevoPaciente.cedula||!nuevoPaciente.tel}
                    style={{
                      padding:'8px 24px',borderRadius:8,border:'none',
                      background:(!nuevoPaciente.nombre||!nuevoPaciente.apellido||!nuevoPaciente.cedula||!nuevoPaciente.tel)
                        ?'#d1d5db':'#f59e0b',
                      color:(!nuevoPaciente.nombre||!nuevoPaciente.apellido||!nuevoPaciente.cedula||!nuevoPaciente.tel)
                        ?'#9ca3af':'white',
                      cursor:(!nuevoPaciente.nombre||!nuevoPaciente.apellido||!nuevoPaciente.cedula||!nuevoPaciente.tel)
                        ?'not-allowed':'pointer',
                      fontWeight:700,fontSize:'.85rem',
                      display:'flex',alignItems:'center',gap:6,
                    }}>
                    <i className="bi bi-person-check"/> Registrar paciente
                  </button>
                </div>
              </div>
            ):(
              /* ── Paso 2: Éxito ── */
              <div style={{padding:36,textAlign:'center'}}>
                <div style={{
                  width:64,height:64,borderRadius:'50%',background:'#dcfce7',
                  display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',
                }}>
                  <i className="bi bi-check-circle-fill" style={{color:'#22c55e',fontSize:'2rem'}}/>
                </div>
                <h5 style={{fontWeight:800,color:'#111827',marginBottom:6}}>¡Paciente registrado!</h5>
                <p style={{color:'#6b7280',fontSize:'.88rem',marginBottom:4}}>
                  <strong style={{color:'#111827'}}>{nuevoPaciente.nombre} {nuevoPaciente.apellido}</strong> ha sido agregado al sistema.
                </p>
                <p style={{color:'#9ca3af',fontSize:'.78rem',marginBottom:24}}>
                  Doc: {nuevoPaciente.cedula} · Tel: {nuevoPaciente.tel}
                </p>
                <div style={{
                  background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,
                  padding:'10px 16px',fontSize:'.78rem',color:'#15803d',marginBottom:20,
                  display:'flex',alignItems:'center',gap:6,justifyContent:'center',
                }}>
                  <i className="bi bi-info-circle"/> Ya puede usar la cédula <strong>{nuevoPaciente.cedula}</strong> para hacer check-in o agendar una cita.
                </div>
                <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                  <button onClick={()=>{cerrarRegistro();setShowNuevaCita(true);}} style={{
                    padding:'8px 20px',borderRadius:8,border:'1.5px solid #0d6efd',
                    background:'white',color:'#0d6efd',cursor:'pointer',fontWeight:600,fontSize:'.83rem',
                    display:'flex',alignItems:'center',gap:5,
                  }}>
                    <i className="bi bi-calendar-plus"/> Agendar cita ahora
                  </button>
                  <button onClick={cerrarRegistro} style={{
                    padding:'8px 24px',borderRadius:8,border:'none',
                    background:'#f59e0b',color:'white',cursor:'pointer',fontWeight:700,fontSize:'.85rem',
                  }}>Cerrar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
