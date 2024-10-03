import { useState } from "react";
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import styled from "styled-components";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

export default function ChangePassword() {
  const Text = styled.span`
    margin-top: 50px;
    font-size: 16px;
  `;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "") return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }

      //setError
    } finally {
      setLoading(false);
    }
    //create an account.
    //set the name of the user profile.
    //redirect to the homepage
  };
  return (
    <Wrapper>
      <Title>Change Password 𝕏</Title>

      <Text>
        Enter your user account's verified email address and we will send you a
        password reset link.
      </Text>

      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Send password reset email"}
        ></Input>
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Go back to Log in page. <Link to="/login">Log in &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
