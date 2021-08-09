import rome3 from "../../img/rome3.jpg";

const IndexCard = () => {
  return (
    <a href="https://tourshur.herokuapp.com/allTours">
      <div className="card-item">
        <div className="card">
          <img className="card__img" src={rome3} alt={"rome3"} />
          <div className="card__content">
            <h1 className="card__header">Chulha Chauki Da Dhaba</h1>
            <div className="card__summary">
              <div className="card__info">
                <p className="card__text">
                  <i className="fas fa-money-bill-wave price"></i> Price for two
                  $2000
                </p>
                <p className="card__text">
                  <i className="fas fa-location-arrow location"></i> Koramangala
                </p>
              </div>
              <div className="card__rating">
                <i className="fas fa-star checked"></i>
                <i className="fas fa-star checked"></i>
                <i className="fas fa-star checked"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default IndexCard;
