import IndexHeading from "../IndexContent/IndexHeading";

const Header = () => {
  return (
    <header>
      <div className="nav">
        <h1 className="nav__logo">
          <span className="nav__logo-text">
            <i className="fas fa-pizza-slice"></i> Foodies
          </span>
          Junction
        </h1>
        <h3>
          <a className="current" href="index.html">
            Restaurants
          </a>
        </h3>
        <nav>
          <ul>
            <li>
              <a className="nav__el" href="./about.html">
                About
              </a>
            </li>
            <li>
              <a className="nav__el" href="./login.html">
                Login
              </a>
            </li>
            <li>
              <a className="nav__el" href="./signup.html">
                Signup
              </a>
            </li>
            {/* <li><a className="nav__el" href="#about"><img className="nav__user-img" src="./img/user-1.jpeg" alt=""/><span>Kritarth</span></a></li> */}
          </ul>
        </nav>
      </div>
      <IndexHeading />
    </header>
  );
};

export default Header;
