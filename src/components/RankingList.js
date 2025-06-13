import PropTypes from "prop-types";
import React from "react";
import "./RankingList.css";

export const RankingList = ({
  name = "신혜린",
  center = "서울센터",
  rank = "10",
  status,
}) => {

  return (
    <div className={'ranking-list ${statusClass}'}>
      <div className="frame">
        <div className="rank">{rank}</div>
        <div className="name font-24b">{name}</div>
      </div>

      <div className="center">{center}</div>
    </div>
  );
};

RankingList.propTypes = {
  name: PropTypes.string,
  center: PropTypes.string,
  rank: PropTypes.string,
  status: PropTypes.oneOf(["top-3", "top-5"])
};
