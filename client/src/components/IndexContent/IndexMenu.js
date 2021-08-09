const IndexMenu = ({ name }) => {
  return (
    <div className="categories">
      <p className="categories__heading">
        {name === "Categories" ? (
          <i className="fas fa-archive"></i>
        ) : name === "Neighbours" ? (
          <i className="fas fa-map-marker-alt"></i>
        ) : (
          ""
        )}{" "}
        &nbsp;{name}
      </p>
      <a href="#">Link 1</a>
      <a href="#">Link 2</a>
      <a href="#">Link 3</a>
      <a href="#">Link 4</a>
      <a href="#">Link 5</a>
      <a href="#">Link 6</a>
      <a href="#">Link 7</a>
      <a href="#">Link 8</a>
      <a href="#">Link 9</a>
      <a href="#">Link 10</a>
    </div>
  );
};

export default IndexMenu;
