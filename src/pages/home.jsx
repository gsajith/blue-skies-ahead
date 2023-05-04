import * as React from "react";
import { Link } from "wouter";
import {
  startFirehose,
  endFirehose,
  setShouldFilterEnglish,
} from "../util/firehose.mjs";
import Post from "../components/Post";

const removeKey = (key, { [key]: _, ...rest }) => rest;

const Home = () => {
  const [posts, setPosts] = React.useState({});
  const postCount = React.useRef(1);
  const [wrapperScroll, setWrapperScroll] = React.useState(
    window.innerHeight - 200
  );
  const wrapperScrollRef = React.useRef(window.innerHeight);
  const windowWidth = React.useRef(window.innerWidth);
  const [filterEnglish, setFilterEnglish] = React.useState(true);
  const [showWelcome, setShowWelcome] = React.useState(true);

  const removePost = React.useCallback((postId) => {
    setPosts((oldPosts) => removeKey(postId, oldPosts));
  }, []);

  const addPost = React.useCallback((postData) => {
    setPosts((oldPosts) => {
      if (Object.keys(oldPosts).length === 0) {
        setTimeout(() => {
        setShowWelcome(false);
        }, [3000]);
      }
      const newPosts = {
        ...oldPosts,
        [postData.postId]: {
          ...postData,
          top: wrapperScrollRef.current,
          left: Math.floor(Math.random() * (windowWidth.current - 300)),
          zIndex: postCount.current,
        },
      };
      setTimeout(() => {
        removePost(postData.postId);
      }, 50000);
      postCount.current = postCount.current + 1;
      return newPosts;
    });
  }, []);

  // Subscribe to the bluesky firehose and call addPost on each new post
  React.useEffect(() => {
    startFirehose(addPost);
    const scrollInterval = setInterval(() => {
      setWrapperScroll((old) => old - 1);
      wrapperScrollRef.current = wrapperScrollRef.current - 1;
    }, 20);
    return () => {
      endFirehose();
      clearInterval(scrollInterval);
      setWrapperScroll(-200);
      wrapperScrollRef.current = 0;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    function autoResize() {
      windowWidth.current = window.innerWidth;
    }
    window.addEventListener("resize", autoResize);
    autoResize();
    return () => window.removeEventListener("resize", autoResize);
  }, []);

  React.useEffect(() => {
    setShouldFilterEnglish(filterEnglish);
  }, [filterEnglish]);

  return (
    <>
      {showWelcome && (
        <div
          className="welcomeMessage"
        >
          People are talking on Bluesky...
        </div>
      )}
      <div style={{ position: "absolute", top: wrapperScroll + "px" }}>
        {Object.values(posts).map((post) => (
          <Post
            text={post.text}
            postId={post.postId}
            did={post.did}
            time={post.time}
            top={post.top}
            left={post.left}
            href={post.href}
            zIndex={post.zIndex}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 15,
          left: 15,
          zIndex: 9999999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <input
            type="checkbox"
            id="filter"
            checked={filterEnglish}
            onChange={() => setFilterEnglish((checked) => !checked)}
          ></input>
          <label for="filter">Filter english</label>
        </div>
        <div>
          Made by{" "}
          <a
            href="https://bsky.app/profile/gautham.bsky.social"
            target="_blank"
          >
            @gautham.bsky.social
          </a>
        </div>
      </div>
      <div className="shim" />
    </>
  );
};

export default Home;
