import { Link } from 'react-router-dom'


export default function Navbar() {
return (
<nav className='nav'>
<h2>Workflow Engine</h2>
<div>
<Link to='/'>Dashboard</Link>
<Link to='/create'>Create</Link>
<Link to='/workflows'>Workflows</Link>
<Link to='/approvals'>Approvals</Link>
<Link to='/logs'>Logs</Link>
</div>
</nav>
)
}