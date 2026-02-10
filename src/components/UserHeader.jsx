import PropTypes from 'prop-types';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserHeader = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-4 flex items-center gap-4 border-b shrink-0">
      <button
        onClick={() => navigate("/home")}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft />
      </button>
        <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};

UserHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default UserHeader;
