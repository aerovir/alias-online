import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { signInWithGoogle, logOut } from "../firebase";
import LanguageContext from "../contexts/languageContext";
import UserContext from "../contexts/userContext";
import getString from '../utils/getString';
import AliasHeader from "../components/aliasHeader";

const Signin = () => {
  const navigate = useNavigate();
  const { interfaceLang } = useContext(LanguageContext);
  const { user } = useContext(UserContext);

  const onSigninWithGoogle = () => {
    signInWithGoogle();
  };

  return (
    <Container>
      <AliasHeader color={"black"}>{getString(interfaceLang, "ALIAS_ONLINE")}</AliasHeader>
      {!user &&
        <HomeSubHeader>{getString(interfaceLang, "SIGN_IN")}</HomeSubHeader>
      }
      {user && (
        <HomeSubHeader>
          <span>{getString(interfaceLang, "WELCOME")}, {user.displayName}</span>
          <img width="64" height="64" src={user.photoURL} alt={user.displayName} />
        </HomeSubHeader>
      )}
      {!user && (
        <WelcomeMessage>{getString(interfaceLang, "SIGN_IN_WITH_GOOGLE_TO_JOIN_THE_PLAY")}</WelcomeMessage>
      )}
      {user && (
        <ButtonsContainer>
          <CreateQuizButton onClick={() => navigate("/playing-room")}>
            {getString(interfaceLang, "PLAY")}
          </CreateQuizButton>
        </ButtonsContainer>
      )}
      {!user &&
        <CreateQuizButton onClick={() => onSigninWithGoogle()}>
          {getString(interfaceLang, "SIGN_IN_WITH_GOOGLE")}
        </CreateQuizButton>
      }
      {user && (
        <CreateQuizButton onClick={() => logOut(user.uid)}>
           {getString(interfaceLang, "LOG_OUT")}
        </CreateQuizButton>
      )}
      <ButtonsContainer>
        <CreateQuizButton onClick={() => navigate("/lang-settings")}>
          {getString(interfaceLang, "LANGUAGE_SETTINGS")}
        </CreateQuizButton>
      </ButtonsContainer>
    </Container>
  );
};

const HomeSubHeader = styled.p`
  text-align: center;
  margin-bottom: 1em;
`;

const WelcomeMessage = styled.p`
  text-align: center;
  margin: 3em 0 3em;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 1em;
  padding-left: 1em;
  height: 100vh;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
`;

const CreateQuizButton = styled.button`
  background-color: #54bab9;
  padding: 1em 4em;
  color: white;
  font-size: 1.5em;
`;

export default Signin;
