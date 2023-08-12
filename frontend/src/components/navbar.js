import { useState } from 'react';
import '../styles/navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    function toggleMenu(){ 
        setIsOpen(!isOpen);
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
            <ul className="nav-links">
                <li><Link exact="true" to="/">Home</Link></li>
                <li><Link exact="true" to="checkin">Check In</Link></li>
                <li><Link exact="true" to="about">About</Link></li>
            </ul>
        </div>
        
    );

}

export default Navbar;