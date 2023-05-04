/************************************************
*  Adapted from https://glitch.com/~whenitrains
************************************************/
import { CID } from "https://cdn.jsdelivr.net/npm/multiformats@11.0.1/+esm";
import { CarReader } from "https://cdn.jsdelivr.net/npm/@ipld/car@5.1.1/+esm";
import {
  decode,
  decodeMultiple,
  addExtension,
} from "https://cdn.jsdelivr.net/npm/cbor-x@1.5.1/+esm";

import LanguageDetect from "languagedetect";

const lngDetector = new LanguageDetect();

const MSG_OP = 1;
const POST_TYPE = "app.bsky.feed.post";
const LIKE_TYPE = "app.bsky.feed.like";
const FOLLOW_TYPE = "app.bsky.graph.follow";
const REPOST_TYPE = "app.bsky.feed.repost";
const POST_LINK = "https://staging.bsky.app/profile/%s/post/%s";
const PROFILE_LINK = "https://staging.bsky.app/profile/%s";

let socket = null;

let filterEnglish = true;

export function startFirehose(callback) {
  addExtension({
    Class: CID,
    tag: 42,
    encode: () => {
      throw new Error("cannot encode cids");
    },
    decode: (bytes) => {
      if (bytes[0] !== 0) {
        throw new Error("invalid cid for cbor tag 42");
      }
      return CID.decode(bytes.subarray(1)); // ignore leading 0x00
    },
  });

  socket = new WebSocket(
    "wss://bsky.social/xrpc/com.atproto.sync.subscribeRepos"
  );
  socket.addEventListener("message", async (event) => {
    const messageBuf = await event.data.arrayBuffer();
    const [header, body] = decodeMultiple(new Uint8Array(messageBuf));
    if (header.op !== MSG_OP) return;
    const car = await CarReader.fromBytes(body.blocks);
    for (const op of body.ops) {
      if (!op.cid) continue;
      const block = await car.get(op.cid);
      const record = decode(block.bytes);
      if (record.$type === POST_TYPE && typeof record.text === "string") {
        // Optional filter out empty posts
        if (record.text.length > 0) {
          const rkey = op.path.split("/").at(-1);

          const userRepo = JSON.parse(
            await fetch(
              `https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${body.repo}`
            ).then((r) => r.text())
          );

          const languages = lngDetector.detect(record.text, 3);

          if (
            (filterEnglish &&
            languages.length > 0 &&
            languages[0][0] === "english") || !filterEnglish
          ) {
            const postObject = {
              text: record.text,
              did: userRepo.handle,
              postId: rkey,
              time: new Date(),
              href: format(POST_LINK, body.repo, rkey),
            };
            callback(postObject);
          }
        }
      }
    }
  });
}

export function endFirehose() {
  if (socket !== null) {
    socket.close();
  }
}

export function setShouldFilterEnglish(filter) {
  filterEnglish = filter;
}

function format(str, ...params) {
  for (const param of params) {
    str = str.replace("%s", param);
  }
  return str;
}
