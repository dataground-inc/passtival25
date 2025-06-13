import PropTypes from "prop-types";
import React from "react";
import "./TopOthers.css"

export const TopOthers = ({ data }) => {
  if (!data) return null; // 이 줄이 꼭 필요합니다!
  return (
    <div className="top3-box">
      <div className="rank">{data.rank || "🥈"}</div>
      <div className="face-wrapper">
        <div className="animal-face">
          <div className="animal-face1"> <img src="https://dataground-inc.github.io/pass-sports/animal3d.png" alt="animal-face"></img></div></div>
      </div>
      <div className="name-box">
        <div className="name">{data.name || "이름없음"}</div>
        <div className="center">{data.center || "센터없음"}</div>
      </div>
    </div>
  );
};

TopOthers.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    center: PropTypes.string,
    rank: PropTypes.string,
  }),
};
