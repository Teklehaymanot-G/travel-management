import TravelCard from "../dashboard/TravelCard";

const TravelGrid = ({ travels }) => {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {travels.map((travel) => (
        <TravelCard key={travel.id} travel={travel} />
      ))}
    </div>
  );
};

// Add default export
export default TravelGrid;
