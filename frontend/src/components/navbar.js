import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/navbar.css'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    function toggleMenu() {
        setIsOpen(!isOpen)
    }

    // Close the menu when a link is clicked or when clicking outside
    function closeMenu() {
        setIsOpen(false)
    }

    return (
        <div className={`navbar ${isOpen ? 'open' : ''}`}>
            <div className="title">
                <h1>Iowa State Weight Club</h1>
            </div>
            <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
                <li>
                    <Link to="/" onClick={closeMenu}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/update" onClick={closeMenu}>
                        Update
                    </Link>
                </li>
                <li>
                    <Link to="/about" onClick={closeMenu}>
                        About
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Navbar
