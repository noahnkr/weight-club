import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/navbar.css'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    function toggleMenu() {
        setIsOpen(!isOpen)
    }

    return (
        <div className={`navbar ${isOpen ? 'open' : ''}`}>
            <div className="title">
                <span>
                    <h1>Iowa State Weight Club</h1>
                </span>
            </div>
            <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <ul className="nav-links">
                <li>
                    <Link exact="true" to="/" onClick={toggleMenu}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link exact="true" to="update" onClick={toggleMenu}>
                        Update
                    </Link>
                </li>
                <li>
                    <Link exact="true" to="about" onClick={toggleMenu}>
                        About
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Navbar
