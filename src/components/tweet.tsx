import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Input = styled.input`
  margin: 10px 0px;
  font-size: 15px;
  width: 400px;
`;

const Photo = styled.img`
  width: 120px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const Button = styled.button`
  background-color: #5c5858;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  margin: 5px 2px;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

const AttachFileInput = styled.input`
  display: none;
`;

const ChangePhoto = styled.label`
  background-color: #5c5858;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  margin: 5px 2px;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

const File = styled.input`
  display: none;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isEditing, setEdit] = useState(false);
  const [editText, setEditText] = useState(tweet);
  const [file, setFile] = useState<File | null>(null);

  const MAX_IMG_SIZE = 1 * 1024 * 1024;
  const user = auth.currentUser;

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      if (files[0].size > MAX_IMG_SIZE) {
        alert("Your image is too big! Maximun size is 1Mb.");
        return;
      }
      setFile(files[0]);
    }
  };

  //save
  const onSave = async () => {
    if (!user || tweet === "" || user?.uid !== userId || tweet.length > 280)
      return;
    try {
      await updateDoc(doc(db, `tweets/${id}`), { tweet: editText }); //text변경
      if (file) {
        // img 변경
        const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        await updateDoc(doc(db, `tweets/${id}`), { photo: url });
        setFile(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(false);
    }
  };

  const onEdit = async () => {
    setEdit(true);
  };
  const CancelEdit = async () => {
    setEdit(false);
    setFile(null);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const onChangePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const oneMB = 1 * 1024 * 1024;
    if (files && files.length === 1 && files[0].size < oneMB) {
      setFile(files[0]);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <div>
          {isEditing ? (
            <Input
              required
              value={editText}
              onChange={onChange}
              maxLength={280}
            />
          ) : (
            <Payload>{tweet}</Payload>
          )}
        </div>
        <Column>
          {user?.uid === userId ? (
            <Button onClick={isEditing ? onSave : onDelete}>
              {isEditing ? "Save" : "Delete"}
            </Button>
          ) : null}

          {user?.uid === userId ? (
            <Button onClick={isEditing ? CancelEdit : onEdit}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          ) : null}
          {isEditing ? (
            <>
              <ChangePhoto htmlFor="editPhoto">
                {file ? "Photo uploaded ✔" : "replace Photo"}
              </ChangePhoto>
              <File
                type="file"
                id="editPhoto"
                onChange={onChangePhoto}
                accept="image/*"
              />
            </>
          ) : null}
          <AttachFileInput onChange={onFileChange} accept="image/*" />
        </Column>
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}
