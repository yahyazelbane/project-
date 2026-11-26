import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, Users, GraduationCap, Search, Plus, LogOut,
  Menu, X, Pencil, Trash2, Download, RefreshCw, BookOpen,
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, UserRound,
  TrendingUp, Filter, ChevronDown
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './supabase'
import './App.css'

const emptyForm = { nom: '', prenom: '', email: '', filiere: '', niveau: '1ère année' }

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadStudents()
  }, [session])

  async function loadStudents() {
    if (!supabase) return
    setLoading(true); setError('')
    const { data, error: fetchError } = await supabase
      .from('students').select('*').order('created_at', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setStudents(data || [])
    setLoading(false)
  }

  async function signIn(e) {
    e.preventDefault(); setError('')
    if (!supabase) return
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) setError('Email ou mot de passe incorrect.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setStudents([])
    setPassword('')
  }

  function openAdd() {
    setEditing(null); setForm(emptyForm); setModal(true)
  }

  function openEdit(student) {
    setEditing(student.id)
    setForm({
      nom: student.nom || '', prenom: student.prenom || '',
      email: student.email || '', filiere: student.filiere || '',
      niveau: student.niveau || '1ère année'
    })
    setModal(true)
  }

  async function saveStudent(e) {
    e.preventDefault(); setError('')
    const payload = { ...form, nom: form.nom.trim(), prenom: form.prenom.trim(), email: form.email.trim(), filiere: form.filiere.trim() }
    if (!payload.nom || !payload.prenom || !payload.filiere) {
      setError('Veuillez remplir le nom, le prénom et la filière.')
      return
    }
    const request = editing
      ? supabase.from('students').update(payload).eq('id', editing)
      : supabase.from('students').insert(payload)
    const { error: saveError } = await request
    if (saveError) { setError(saveError.message); return }
    setModal(false); setNotice(editing ? 'Étudiant modifié.' : 'Étudiant ajouté.')
    await loadStudents()
    setTimeout(() => setNotice(''), 3000)
  }

  async function deleteStudent(id) {
    if (!window.confirm('Supprimer définitivement cet étudiant ?')) return
    const { error: deleteError } = await supabase.from('students').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else { setNotice('Étudiant supprimé.'); loadStudents(); setTimeout(() => setNotice(''), 3000) }
  }

  const filtered = useMemo(() => students.filter(s => {
    const term = search.toLowerCase()
    const matches = `${s.nom} ${s.prenom} ${s.email || ''} ${s.filiere}`.toLowerCase().includes(term)
    return matches && (filter === 'Tous' || s.niveau === filter)
  }), [students, search, filter])

  function exportCSV() {
    const headers = ['Nom', 'Prénom', 'Email', 'Filière', 'Niveau']
    const rows = filtered.map(s => [s.nom, s.prenom, s.email || '', s.filiere, s.niveau || ''])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'etudiants.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading) return <div className="center-screen"><div className="loader" />Chargement...</div>

  if (!isSupabaseConfigured) return <SetupScreen />

  if (!session) return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand brand-light"><span className="brand-mark"><GraduationCap size={23}/></span> CampusFlow</div>
        <div className="art-copy">
          <span className="eyebrow">ESPACE ADMINISTRATEUR</span>
          <h1>Gérez votre établissement en toute simplicité.</h1>
          <p>Une plateforme claire pour suivre les étudiants, organiser les filières et garder vos données à jour.</p>
          <div className="art-stats"><div><strong>01</strong><span>Centralisez</span></div><div><strong>02</strong><span>Organisez</span></div><div><strong>03</strong><span>Suivez</span></div></div>
        </div>
        <div className="art-footer">CampusFlow · Gestion des étudiants</div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={signIn}>
          <div className="brand"><span className="brand-mark"><GraduationCap size={23}/></span> CampusFlow</div>
          <span className="eyebrow">BON RETOUR</span>
          <h2>Connexion admin</h2>
          <p className="muted">Connectez-vous pour accéder à votre tableau de bord.</p>
          {error && <div className="alert error"><AlertCircle size={17}/>{error}</div>}
          <label>Adresse e-mail</label>
          <div className="input-wrap"><Mail size={18}/><input type="email" placeholder="admin@exemple.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <label>Mot de passe</label>
          <div className="input-wrap"><Lock size={18}/><input type={showPassword ? 'text' : 'password'} placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}/><button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          <button className="primary full" type="submit">Se connecter <span>→</span></button>
          <p className="login-note">Accès réservé aux comptes administrateurs créés dans Supabase.</p>
        </form>
      </section>
    </main>
  )

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand"><span className="brand-mark"><GraduationCap size={23}/></span> CampusFlow</div>
        <div className="side-label">MENU PRINCIPAL</div>
        <button className="nav-item active"><LayoutDashboard size={19}/> Tableau de bord</button>
        <button className="nav-item" onClick={() => document.getElementById('student-section')?.scrollIntoView({ behavior: 'smooth' })}><Users size={19}/> Étudiants</button>
        <div className="side-bottom">
          <div className="profile"><div className="avatar">{session.user.email?.[0]?.toUpperCase() || 'A'}</div><div><strong>Administrateur</strong><small>{session.user.email}</small></div></div>
          <button className="nav-item logout" onClick={signOut}><LogOut size={18}/> Déconnexion</button>
        </div>
      </aside>
      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu"/>}
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X/> : <Menu/>}</button><div><span className="top-kicker">GESTION SCOLAIRE</span><h1>Tableau de bord</h1></div><div className="top-user"><div className="avatar">{session.user.email?.[0]?.toUpperCase() || 'A'}</div><span>{session.user.email}</span></div></header>
        <div className="content">
          {notice && <div className="alert success"><CheckCircle2 size={17}/>{notice}</div>}
          {error && <div className="alert error"><AlertCircle size={17}/>{error}</div>}
          <div className="welcome-row"><div><h2>Vue d'ensemble</h2><p className="muted">Voici la situation actuelle de vos étudiants.</p></div><button className="secondary" onClick={loadStudents}><RefreshCw size={16}/> Actualiser</button></div>
          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon purple"><Users size={20}/></div><span>Total étudiants</span><strong>{students.length}</strong><small><TrendingUp size={13}/> Inscrits dans votre établissement</small></div>
            <div className="stat-card"><div className="stat-icon blue"><GraduationCap size={20}/></div><span>Filières représentées</span><strong>{new Set(students.map(s => s.filiere).filter(Boolean)).size}</strong><small><BookOpen size={13}/> Filières différentes</small></div>
            <div className="stat-card"><div className="stat-icon green"><UserRound size={20}/></div><span>1ère année</span><strong>{students.filter(s => s.niveau === '1ère année').length}</strong><small>Étudiants en première année</small></div>
          </section>
          <section className="table-card" id="student-section">
            <div className="table-heading"><div><h2>Liste des étudiants</h2><p className="muted">Consultez et gérez les inscriptions.</p></div><div className="heading-actions"><button className="secondary" onClick={exportCSV}><Download size={16}/> Exporter CSV</button><button className="primary" onClick={openAdd}><Plus size={17}/> Ajouter</button></div></div>
            <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Rechercher un étudiant..." value={search} onChange={e => setSearch(e.target.value)}/></div><div className="filter-box"><Filter size={16}/><select value={filter} onChange={e => setFilter(e.target.value)}><option>Tous</option><option>1ère année</option><option>2ème année</option><option>3ème année</option></select><ChevronDown size={14}/></div></div>
            <div className="table-scroll"><table><thead><tr><th>ÉTUDIANT</th><th>EMAIL</th><th>FILIÈRE</th><th>NIVEAU</th><th className="actions-head">ACTIONS</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="5" className="empty">Chargement des étudiants...</td></tr> : filtered.length === 0 ? <tr><td colSpan="5" className="empty">Aucun étudiant trouvé.</td></tr> : filtered.map((s, i) => <tr key={s.id}><td><div className="student-cell"><div className={`student-avatar color-${i % 4}`}>{s.prenom?.[0]}{s.nom?.[0]}</div><strong>{s.prenom} {s.nom}</strong></div></td><td>{s.email || '—'}</td><td>{s.filiere}</td><td><span className="level-tag">{s.niveau || '—'}</span></td><td><div className="row-actions"><button title="Modifier" onClick={() => openEdit(s)}><Pencil size={16}/></button><button title="Supprimer" className="delete" onClick={() => deleteStudent(s.id)}><Trash2 size={16}/></button></div></td></tr>)}
            </tbody></table></div>
            <div className="table-foot"><span>{filtered.length} étudiant(s) affiché(s)</span><span>Données synchronisées avec Supabase</span></div>
          </section>
          <footer className="footer">© {new Date().getFullYear()} CampusFlow · Gestion des étudiants</footer>
        </div>
      </main>
      {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(false)}><form className="modal" onSubmit={saveStudent}><div className="modal-head"><div><span className="eyebrow">DOSSIER ÉTUDIANT</span><h2>{editing ? 'Modifier étudiant' : 'Nouvel étudiant'}</h2></div><button type="button" className="icon-btn" onClick={() => setModal(false)}><X/></button></div>
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid"><div><label>Prénom *</label><input value={form.prenom} onChange={e => setForm({...form, prenom:e.target.value})} required/></div><div><label>Nom *</label><input value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} required/></div><div className="wide"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="etudiant@exemple.com"/></div><div><label>Filière *</label><input value={form.filiere} onChange={e => setForm({...form, filiere:e.target.value})} placeholder="Développement digital" required/></div><div><label>Niveau</label><select value={form.niveau} onChange={e => setForm({...form, niveau:e.target.value})}><option>1ère année</option><option>2ème année</option><option>3ème année</option></select></div></div>
        <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(false)}>Annuler</button><button className="primary" type="submit">{editing ? 'Enregistrer' : 'Ajouter étudiant'}</button></div>
      </form></div>}
    </div>
  )
}

function SetupScreen() {
  return <div className="setup-screen"><div className="setup-card"><div className="brand"><span className="brand-mark"><GraduationCap size={23}/></span> CampusFlow</div><div className="setup-icon"><AlertCircle size={28}/></div><h1>Configuration nécessaire</h1><p>Pour activer la connexion sécurisée et enregistrer les étudiants dans une base de données, connectez ce projet à Supabase.</p><ol><li>Créez un projet sur <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>.</li><li>Copiez <code>.env.example</code> vers <code>.env.local</code> et renseignez l'URL et la clé publique (anon/publishable).</li><li>Exécutez le script <code>supabase/schema.sql</code> dans le SQL Editor de Supabase.</li><li>Créez votre compte admin dans Authentication → Users.</li></ol><p className="small-note">Ne mettez jamais la clé service_role ou un mot de passe admin dans le code frontend.</p></div></div>
}

export default App