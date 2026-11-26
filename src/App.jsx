import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, BookOpen, CheckCircle2, ChevronDown, Download, Filter,
  GraduationCap, LayoutDashboard, Menu, Pencil, Plus, RefreshCw, Search,
  Trash2, TrendingUp, UserRound, Users, X
} from 'lucide-react'
import './App.css'

const STORAGE_KEY = 'campusflow-students'
const emptyForm = { nom: '', prenom: '', email: '', filiere: '', niveau: '1ère année' }

const exampleStudents = [
  { id: 1, nom: 'Amrani', prenom: 'Sara', email: 'sara@example.com', filiere: 'Développement digital', niveau: '1ère année' },
  { id: 2, nom: 'Bennani', prenom: 'Youssef', email: 'youssef@example.com', filiere: 'Gestion des entreprises', niveau: '2ème année' },
  { id: 3, nom: 'Alaoui', prenom: 'Imane', email: 'imane@example.com', filiere: 'Développement digital', niveau: '1ère année' },
  { id: 4, nom: 'Idrissi', prenom: 'Omar', email: 'omar@example.com', filiere: 'Réseaux informatiques', niveau: '3ème année' },
  { id: 5, nom: 'Tazi', prenom: 'Lina', email: 'lina@example.com', filiere: 'Gestion des entreprises', niveau: '2ème année' }
]

function readStudents() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return exampleStudents
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : exampleStudents
  } catch {
    return exampleStudents
  }
}

function App() {
  const [students, setStudents] = useState(readStudents)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
  }, [students])

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModal(true)
  }

  function openEdit(student) {
    setEditing(student.id)
    setForm({
      nom: student.nom || '',
      prenom: student.prenom || '',
      email: student.email || '',
      filiere: student.filiere || '',
      niveau: student.niveau || '1ère année'
    })
    setError('')
    setModal(true)
  }

  function saveStudent(event) {
    event.preventDefault()
    setError('')
    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      filiere: form.filiere.trim(),
      niveau: form.niveau
    }

    if (!payload.nom || !payload.prenom || !payload.filiere) {
      setError('Veuillez remplir le nom, le prénom et la filière.')
      return
    }

    if (editing !== null) {
      setStudents(current => current.map(student =>
        student.id === editing ? { ...student, ...payload } : student
      ))
      showNotice('Étudiant modifié.')
    } else {
      setStudents(current => [{ id: Date.now(), ...payload }, ...current])
      showNotice('Étudiant ajouté.')
    }

    setModal(false)
  }

  function deleteStudent(id) {
    if (!window.confirm('Supprimer cet étudiant ?')) return
    setStudents(current => current.filter(student => student.id !== id))
    showNotice('Étudiant supprimé.')
  }

  function resetStudents() {
    if (!window.confirm('Remettre la liste des étudiants d’exemple ?')) return
    setStudents(exampleStudents.map(student => ({ ...student })))
    setSearch('')
    setFilter('Tous')
    showNotice('Les exemples sont réinitialisés.')
  }

  const filtered = useMemo(() => students.filter(student => {
    const term = search.toLowerCase()
    const text = (student.nom + ' ' + student.prenom + ' ' + (student.email || '') + ' ' + student.filiere).toLowerCase()
    return text.includes(term) && (filter === 'Tous' || student.niveau === filter)
  }), [students, search, filter])

  function exportCSV() {
    const headers = ['Nom', 'Prénom', 'Email', 'Filière', 'Niveau']
    const rows = filtered.map(student => [
      student.nom, student.prenom, student.email || '', student.filiere, student.niveau || ''
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(';'))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'etudiants.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className={'sidebar ' + (sidebarOpen ? 'open' : '')}>
        <div className="brand"><span className="brand-mark"><GraduationCap size={23} /></span> CampusFlow</div>
        <div className="side-label">MENU PRINCIPAL</div>
        <button className="nav-item active"><LayoutDashboard size={19} /> Tableau de bord</button>
        <button
          className="nav-item"
          onClick={() => document.getElementById('student-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Users size={19} /> Étudiants
        </button>
        <div className="side-bottom">
          <div className="profile">
            <div className="avatar">E</div>
            <div><strong>Mode exercice</strong><small>Données de cet appareil</small></div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Ouvrir le menu">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <div><span className="top-kicker">PROJET D'EXERCICE</span><h1>Tableau de bord</h1></div>
          <div className="top-user"><div className="avatar">E</div><span>Mode exercice</span></div>
        </header>

        <div className="content">
          {notice && <div className="alert success"><CheckCircle2 size={17} />{notice}</div>}
          {error && !modal && <div className="alert error"><AlertCircle size={17} />{error}</div>}

          <div className="welcome-row">
            <div>
              <h2>Vue d'ensemble</h2>
              <p className="muted">Gérez une liste d'étudiants avec des exemples prêts à utiliser.</p>
            </div>
            <button className="secondary" onClick={resetStudents}><RefreshCw size={16} /> Réinitialiser</button>
          </div>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple"><Users size={20} /></div>
              <span>Total étudiants</span><strong>{students.length}</strong>
              <small><TrendingUp size={13} /> Dans la liste</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><GraduationCap size={20} /></div>
              <span>Filières représentées</span>
              <strong>{new Set(students.map(student => student.filiere).filter(Boolean)).size}</strong>
              <small><BookOpen size={13} /> Filières différentes</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><UserRound size={20} /></div>
              <span>1ère année</span>
              <strong>{students.filter(student => student.niveau === '1ère année').length}</strong>
              <small>Étudiants en première année</small>
            </div>
          </section>

          <section className="table-card" id="student-section">
            <div className="table-heading">
              <div><h2>Liste des étudiants</h2><p className="muted">Ajoutez, modifiez ou supprimez les étudiants.</p></div>
              <div className="heading-actions">
                <button className="secondary" onClick={exportCSV}><Download size={16} /> Exporter CSV</button>
                <button className="primary" onClick={openAdd}><Plus size={17} /> Ajouter</button>
              </div>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  placeholder="Rechercher un étudiant..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </div>
              <div className="filter-box">
                <Filter size={16} />
                <select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filtrer par niveau">
                  <option>Tous</option><option>1ère année</option><option>2ème année</option><option>3ème année</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>ÉTUDIANT</th><th>EMAIL</th><th>FILIÈRE</th><th>NIVEAU</th><th className="actions-head">ACTIONS</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan="5" className="empty">Aucun étudiant trouvé.</td></tr>
                    : filtered.map((student, index) => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-cell">
                            <div className={'student-avatar color-' + (index % 4)}>
                              {student.prenom?.[0]}{student.nom?.[0]}
                            </div>
                            <strong>{student.prenom} {student.nom}</strong>
                          </div>
                        </td>
                        <td>{student.email || '—'}</td>
                        <td>{student.filiere}</td>
                        <td><span className="level-tag">{student.niveau || '—'}</span></td>
                        <td>
                          <div className="row-actions">
                            <button title="Modifier" aria-label="Modifier" onClick={() => openEdit(student)}><Pencil size={16} /></button>
                            <button title="Supprimer" aria-label="Supprimer" className="delete" onClick={() => deleteStudent(student.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="table-foot">
              <span>{filtered.length} étudiant(s) affiché(s)</span>
              <span>Enregistré dans ce navigateur</span>
            </div>
          </section>

          <footer className="footer">© {new Date().getFullYear()} CampusFlow · Projet d'exercice</footer>
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setModal(false)}>
          <form className="modal" onSubmit={saveStudent}>
            <div className="modal-head">
              <div><span className="eyebrow">DOSSIER ÉTUDIANT</span><h2>{editing !== null ? 'Modifier étudiant' : 'Nouvel étudiant'}</h2></div>
              <button type="button" className="icon-btn" onClick={() => setModal(false)} aria-label="Fermer"><X /></button>
            </div>
            {error && <div className="alert error"><AlertCircle size={17} />{error}</div>}
            <div className="form-grid">
              <div><label>Prénom *</label><input value={form.prenom} onChange={event => setForm({ ...form, prenom: event.target.value })} required /></div>
              <div><label>Nom *</label><input value={form.nom} onChange={event => setForm({ ...form, nom: event.target.value })} required /></div>
              <div className="wide"><label>Email</label><input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="etudiant@exemple.com" /></div>
              <div><label>Filière *</label><input value={form.filiere} onChange={event => setForm({ ...form, filiere: event.target.value })} placeholder="Développement digital" required /></div>
              <div>
                <label>Niveau</label>
                <select value={form.niveau} onChange={event => setForm({ ...form, niveau: event.target.value })}>
                  <option>1ère année</option><option>2ème année</option><option>3ème année</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setModal(false)}>Annuler</button>
              <button className="primary" type="submit">{editing !== null ? 'Enregistrer' : 'Ajouter étudiant'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
