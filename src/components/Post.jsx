import * as React from "react";

const getDateTime = (currentdate) => {
  var datetime =
    ("0" + currentdate.getHours()).slice(-2) +
    ":" +
    ("0" + currentdate.getMinutes()).slice(-2) +
    ":" +
    ("0" + currentdate.getSeconds()).slice(-2);

  return datetime;
};

const Post = ({ text, did, postId, time, zIndex, top, left, href }) => {
  return (
    <a href={href} target="_blank">
      <div
        key={postId + did}
        className="postWrapper"
        style={{ zIndex: zIndex, top: window.innerHeight + 200 - top, left: left+"px" }}
      >
        {text}
        <div style={{height: 12}}/>
        <div className="postUser">@{did}</div>
        <div className="postDate">{getDateTime(time)}</div>
      </div>
    </a>
  );
};

export default Post;
