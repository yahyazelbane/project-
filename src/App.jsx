
import { useState } from 'react'

function App() {

  const [page, setPage] = useState('home')

  const [students, setStudents] = useState([
    { id: 1, nom: 'Ahmed', prenom: 'Ali', filiere: 'Developpement' },
    { id: 2, nom: 'Sara', prenom: 'Amal', filiere: 'Gestion' },
    { id: 3, nom: 'Youssef', prenom: 'Omar', filiere: 'Reseaux' }
  ])

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [filiere, setFiliere] = useState('')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState(null)

  function ajouter() {
    const nouveau = {
      id: Date.now(),
      nom: nom,
      prenom: prenom,
      filiere: filiere
    }

    setStudents([...students, nouveau])

    setNom('')
    setPrenom('')
    setFiliere('')
    setPage('students')
  }

  function supprimer(id) {
    setStudents(students.filter(s => s.id !== id))
  }

  function voir(s) {
    setSelected(s)
    setPage('details')
  }

  return (
    <div className="container">

      <h1>Gestion des étudiants</h1>

      <nav>
        <button onClick={() => setPage('home')}>Accueil</button>
        <button onClick={() => setPage('login')}>Login</button>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('students')}>Etudiants</button>
      </nav>

      {page === 'home' && (
        <div>
          <h2>Bienvenue</h2>
          <p>Application de gestion des étudiants</p>
          <button onClick={() => setPage('login')}>
            Commencer
          </button>
        </div>
      )}

      {page === 'login' && (
        <div>
          <h2>Authentification</h2>
          <input placeholder="Email" />
          <input placeholder="Mot de passe" type="password" />
          <button onClick={() => setPage('dashboard')}>
            Se connecter
          </button>
        </div>
      )}

      {page === 'dashboard' && (
        <div>
          <h2>Tableau de bord</h2>
          <h3>Total étudiants : {students.length}</h3>
          <button onClick={() => setPage('students')}>
            Voir les étudiants
          </button>
        </div>
      )}

      {page === 'students' && (
        <div>
          <h2>Liste des étudiants</h2>

          <input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <button onClick={() => setPage('add')}>
            Ajouter étudiant
          </button>

          {students.filter(s =>
            s.nom.toLowerCase().includes(search.toLowerCase())
          ).map(s => (
            <div key={s.id}>
              <p>
                {s.nom} {s.prenom} - {s.filiere}
              </p>

              <button onClick={() => voir(s)}>Details</button>

              <button onClick={() => supprimer(s.id)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {page === 'add' && (
        <div>
          <h2>Ajouter un étudiant</h2>

          <input
            placeholder="Nom"
            value={nom}
            onChange={e => setNom(e.target.value)}
          />

          <input
            placeholder="Prenom"
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
          />

          <input
            placeholder="Filiere"
            value={filiere}
            onChange={e => setFiliere(e.target.value)}
          />

          <button onClick={ajouter}>Ajouter</button>
        </div>
      )}

      {page === 'details' && selected && (
        <div>
          <h2>Details étudiant</h2>
          <p>Nom : {selected.nom}</p>
          <p>Prenom : {selected.prenom}</p>
          <p>Filiere : {selected.filiere}</p>

          <button onClick={() => setPage('students')}>
            Retour
          </button>
        </div>
      )}

    </div>
  )
}

export default App
