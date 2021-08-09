import IndexCard from "./IndexCard";
import IndexPagination from "./IndexPagination";

const IndexCardSection = () => {
  return (
    <div className="card-container">
      <IndexCard />
      <IndexCard />
      <IndexCard />
      <IndexCard />
      <IndexCard />
      <IndexCard />
      <IndexPagination />
    </div>
  );
};

export default IndexCardSection;
