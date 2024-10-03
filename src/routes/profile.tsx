import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import Modal from "react-modal";

import { Form } from "../components/auth-components";

/*
const SubmitBtn = styled.button`
  white-space: nowrap;
  padding: 10px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  width: 80px;
  padding: 10px 0px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;
*/

const Text = styled.h1`
  font-size: 36px;
  margin-bottom: 0px;
`;

const ChangeName = styled.label`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  margin-top: 3px;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  border-color: #1d9bf0;
  svg {
    width: 13px;
    fill: #1d9bf0;
  }

  &:hover,
  &:active {
    opacity: 0.8;
  }
`;
const ChangeNameBtn = styled.button`
  display: none;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const Column = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 24px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;
export const Input = styled.input`
  border-color: "black";
  padding: 10px 20px;
  border-radius: 10px;
  width: 100%;
  font-size: 16px;
  &[type="submit"] {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
`;
const customModalStyles: ReactModal.Styles = {
  overlay: {
    backgroundColor: " rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100vh",
    zIndex: "10",
    position: "fixed",
    top: "0",
    left: "0",
  },
  content: {
    marginLeft: "120px",
    color: "black",
    width: "500px",
    height: "250px",
    zIndex: "150",
    position: "absolute",
    top: "35%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "10px",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    backgroundColor: "white",
    justifyContent: "center",
    overflow: "auto",
  },
};

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [nickname, setNickname] = useState(user?.displayName || "");
  const [modalOpen, setModalOpen] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!user || nickname === "") return;
      await updateProfile(user, { displayName: nickname });
    } catch (error) {
      console.log(error);
    } finally {
      setModalOpen(false);
    }
  };

  const onClick = async () => {
    setModalOpen(true);
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const spanshot = await getDocs(tweetQuery);
    const tweets = spanshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z"
            />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Column>
        <Name>{user?.displayName ?? "Anonymous"}</Name>
        <ChangeName htmlFor="btn">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
          </svg>
        </ChangeName>
        <ChangeNameBtn id="btn" onClick={onClick} />
        ​​​​
        <Modal
          isOpen={modalOpen}
          ariaHideApp={false}
          onRequestClose={() => setModalOpen(false)}
          style={customModalStyles}
        >
          <Wrapper>
            <Text>Change your name✍</Text>
            <Column>
              <Form onSubmit={onSubmit}>
                <Input
                  onChange={onChange}
                  type="text"
                  value={nickname}
                  required
                />
                <Input type="submit" value={"Submit"} />
              </Form>
            </Column>
          </Wrapper>
        </Modal>
      </Column>
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
