import { useContext } from "react";
import { StaffContext } from "./context/StaffContext";
import Card from "./Card";
import "./Cardlist.css";

function Cardlist(props) {
  const { staff } = useContext(StaffContext);

  const filteredstaff = staff.filter((member) => {
    return member.name.toLowerCase().startsWith(props.searchTerm.toLowerCase());
  });

  return (
    <div className="row">
      {filteredstaff.map((member) => (
        <Card
          key={member.key}
          image={member.image}
          name={member.name}
          job={member.job}
        />
      ))}
    </div>
  );
}

export default Cardlist;

