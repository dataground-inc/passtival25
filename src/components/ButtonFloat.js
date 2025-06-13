import PropTypes from "prop-types";
import "./ButtonFloat.css"

export const ButtonFloat = ({
  title = "내 순위 확인하기",
}) => {
  return (
    <div className="float-button-wrapper">
        <div className="button-title">{title}</div>
    </div>
  );
};

ButtonFloat.propTypes = {
  title: PropTypes.string,
};
