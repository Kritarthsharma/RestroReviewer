const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__main-content">
        <div className="footer__left footer__box">
          <h2>About us</h2>
          <div className="footer__content">
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet
              architecto tempora consequatur ipsam asperiores ut expedita
              voluptatibus, quia excepturi illo saepe autem nam repellat quod
              totam earum, doloremque sit ipsum.
            </p>
            <div className="footer__social">
              <a href="https://facebook.com/">
                <span className="fab fa-facebook-f"></span>
              </a>
              <a href="https://twitter.com/">
                <span className="fab fa-twitter"></span>
              </a>
              <a href="https://instagram.com/">
                <span className="fab fa-instagram"></span>
              </a>
              <a href="https://youtube.com/">
                <span className="fab fa-youtube"></span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer__center footer__box">
          <h2>Address</h2>
          <div className="footer__content">
            <div className="footer__place">
              <span className="fas fa-map-marker-alt"></span>
              <span className="footer__text">Bangalore, India</span>
            </div>
            <div className="footer__phone">
              <span className="fas fa-phone-alt"></span>
              <span className="footer__text">+91-123456789</span>
            </div>
            <div className="footer__email">
              <span className="fas fa-envelope"></span>
              <span className="footer__text">abc@example.com</span>
            </div>
          </div>
        </div>
        <div className="footer__right footer__box">
          <h2>Contact us</h2>
          <div className="footer__content">
            <form action="#">
              <div className="footer__email">
                <div className="footer__text">Email *</div>
                <input type="email" required />
              </div>
              <div className="footer__msg">
                <div className="footer__text">Message *</div>
                <textarea rows="2" cols="25" required></textarea>
              </div>
              <div className="footer__btn">
                <button type="submit">Send</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <center>
          <span className="footer__credit">
            Created By{" "}
            <a href="https://kritarthsharma.herokuapp.com/">Kritarth Sharma</a>{" "}
            |{" "}
          </span>
          <span className="far fa-copyright"></span>
          <span> 2021 All rights reserved.</span>
        </center>
      </div>
    </footer>
  );
};

export default Footer;
