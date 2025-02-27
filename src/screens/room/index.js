import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { setLeader, setWinner, resetGame, updateScore, updateGreeting, updateWord } from "../../firebase";
import UserList from "../../components/userList";
import Button from "../../components/button";
import ResetButton from "../../components/resetButton";
import Container from "../../components/constainer";
import Header from "../../components/header";
import UserContext from "../../contexts/userContext";
import VOCABULARY from "../../utils/vocabulary.json";
import { isUserActive } from "../../utils/helpers";

const PlayingRoom = () => {
  // TODO: how to pass parameter once to the top tag of compound component?
  const HEADER_HEIGHT = "80px";
  const FOOTER_HEIGHT = "130px";

  const navigate = useNavigate();
  let { slug } = useParams();
  const { user, users, rooms, lang } = useContext(UserContext);

  const [ isChooseWinner, setIsChooseWinner ] = useState(false);
  const [ room, setRoom ] = useState(null);

  useEffect(() => {
    const aRoom = rooms.find(r => r.uid === slug);
    if (aRoom) {
      setRoom(aRoom);
    }
  }, [rooms, slug]);

  let status = 0; // Game is not started
  let leaderUid = "";
  let leaderName = "";
  let leaderTimestamp = 0;
  let winnerUid = "";
  let winnerTimestamp = 0;
  let word = "";
  if (room) {
    leaderUid = room.leaderUid;
    leaderName = room.leaderName;
    leaderTimestamp = room.leaderTimestamp;
    winnerUid = room.winnerUid;
    winnerTimestamp = room.winnerTimestamp;
    word = room.word;

    if (leaderUid) {
      status = 1; // Leader explain the word
      if (leaderUid === user.uid) {
        status = 2; // You explain the word
      }
    } else if (winnerUid && word) {
      status = 3; // The match is over
      if (winnerUid === user.uid) {
        status = 4; // You win the match
      }
    }
  } else {
    console.error('No room found', slug);
  }

  const [ countDown, setCountDown ] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 2 || status === 1) {
        const today = +(new Date());
        const diff = (today - leaderTimestamp) / 1000; // in seconds
        setCountDown(diff < 60 ? Math.ceil(60 - diff) : 0);
      } else if (status === 3 || status === 4) {
        const today = +(new Date());
        const diff = (today - winnerTimestamp) / 1000; // in seconds
        setCountDown(diff < 30 ? Math.ceil(30 - diff) : 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  const getIcon = useCallback((word) => {
    const w = VOCABULARY.find(w => word === w[room?.lang]);
    return (w && !!w['emoji'] ? w['emoji'] : '😵');
  }, [room]);

  const getWord = (room) => {
    let result = "";
    if (room) {
      const w = VOCABULARY.find(w => word === w[room.lang]);
      if (w) {
        result = w[room.lang];
      }
    }
    return result;
  };

  const getRandomCard = useCallback(() => {
    const wordsWithEmoji = VOCABULARY.filter(w => !!w['emoji']);
    const randomIndex = Math.ceil(Math.random() * (wordsWithEmoji.length-1));
    return wordsWithEmoji[randomIndex];
    }, []);

  const onGreet = async () => {
    await updateGreeting(user.uid, true);
    setTimeout(async () => {
      await updateGreeting(user.uid, false);
    }, 1000);
  };

  const onPlayClick = async () => {
    const activeUsers = users.filter(u => isUserActive(u.lastActiveAt));

    if (activeUsers.length >= 2) {
      setIsChooseWinner(false);
      const w = getRandomCard();
      await setLeader(user.uid, room.uid, user.displayName, w[room.lang]);
    } else {
      alert(lang("need_at_least_two_players"));
    }
  }

  const onWinnerClick = async (user) => {
    if (room) {
      await setWinner(user.uid, room.uid, user.displayName, room.word);
    }
  }

  // NOTE!
  // users object contains data about score:
  // https://docs.google.com/document/d/1J7g91NJokW6iptjZxOcIQbLNSpCceRIT7UVWEcZV_BA/edit#heading=h.ie7mxisro286
  // and user object contains only authorization information.
  // TODO: implement unified user information.
  const userData = useCallback(() => {
    return users.find(u => u.uid === user.uid);
  }, [users, user]);

  const onGetPrizeClick = async() => {
    if (room) {
      await updateScore(user.uid,(userData()?.score || 0) + 1);
      setIsChooseWinner(false);
      const w = getRandomCard();
      await setLeader(user.uid, room.uid, userData()?.displayName, w[room.lang]);
    }
  }

  const onResetGameClick = async () => {
    if (room && window.confirm(lang('are_you_sure_you_want_to_reset_game'))) {
      await resetGame(room.uid);
    }
  }

  const onNextWordClick = async () => {
    if (room && window.confirm(lang('are_you_sure_you_want_to_reset_game'))) {
      const w = getRandomCard();
      await updateWord(room.uid, w[room.lang]);
    }
  }

  if (!room) {
    return <>{lang("loading")}</>;
  }

  return (
    <Container paddingTop={HEADER_HEIGHT} paddingBottom={FOOTER_HEIGHT}>
      <Container.Header height={HEADER_HEIGHT}>
        <Header
          title={room.name}
          backButton
          menuButton
        />
      </Container.Header>
      <Container.Content>
        {status === 0 && (
          <Center>
            <Border title={lang("players")}>
              {users.length ? <UserList users={users} uid={user?.uid} room={room} onUserClick={(u) => navigate(`/profile/${u.uid}`)} /> : lang("loading")}
            </Border>
          </Center>
        )}
        {status === 1 && (
          <Center>
            <Border title={lang("players")}>
              {users.length ? <UserList users={users} uid={user?.uid} room={room} onUserClick={(u) => navigate(`/profile/${u.uid}`)} /> : lang("loading")}
            </Border>
          </Center>
        )}
        {status === 2 && isChooseWinner && (
          <Center>
            <Border title={lang("players")}>
              {users.length ? <UserList users={users} uid={user?.uid} room={room} onUserClick={onWinnerClick} /> : lang("loading")}
            </Border>
          </Center>
        )}
        {status === 2 && !isChooseWinner && (
          <Center>
            <Border title={lang("word")}>
              <EmojiImage>{getIcon(room.word)}</EmojiImage>
              <StatusMessage>{getWord(room)}</StatusMessage>
            </Border>
            <Button onClick={() => onNextWordClick()}>{lang("next_word")}</Button>
          </Center>
        )}
        {status === 3 && (
          <Center>
            <Border title={lang("status")}>
              <EmojiImage>{getIcon(room.word)}</EmojiImage>
              <StatusMessage>
                {getWord(room)}
              </StatusMessage>
              <SubStatusMessage>
                {`${room.winnerName} ${lang("has_guessed_the_word")}`}
              </SubStatusMessage>
            </Border>
          </Center>
        )}
        {status === 4 && (
          <Center>
            <Border title={lang("status")}>
              <EmojiImage>🥳</EmojiImage>
            </Border>
          </Center>
        )}
      </Container.Content>
      <Container.Footer height={FOOTER_HEIGHT}>
        <PlayingRoomControlFooter>
          {status === 0 && (
            <Button onClick={onPlayClick}>
              {lang("play")}
            </Button>
          )}
          {status === 1 && countDown === 0 && (
            <>
              <Button onClick={onGreet}>
                {"👋"}
              </Button>
              <ResetButton onClick={onResetGameClick}>
                {lang("reset_game")}
              </ResetButton>
            </>
          )}
          {status === 1 && countDown > 0 && (
            <Button onClick={onGreet}>
              {"👋"}
            </Button>
          )}
          {status === 2 && isChooseWinner && (
            <Button onClick={() => setIsChooseWinner(false)}>
              {lang("show_picture")}
            </Button>
          )}
          {status === 2 && !isChooseWinner && (
            <Button onClick={() => setIsChooseWinner(true)}>
              {lang("choose_vinner")}
            </Button>
          )}
          {status === 3 && countDown === 0 && (
            <ResetButton onClick={onResetGameClick}>
              {lang("reset_game")}
            </ResetButton>
          )}
          {status === 4 && (
            <Button onClick={onGetPrizeClick}>
              {lang("get_prize")}
            </Button>
          )}
        </PlayingRoomControlFooter>
        <PlayingRoomFooter>
          {status === 0 && (
            <>
              {lang("game_is_not_started_press_play_button")}
            </>
          )}
          {status === 1 && (
            <>
              {`${leaderName} ${lang("are_explaining_the_word")}`}
              {countDown > 0 ? ` (${countDown})` : ""}
            </>
          )}
          {status === 2 && isChooseWinner && (
            <>
              {lang("choose_the_winner_or_back_to_picture")}
            </>
          )}
          {status === 2 && !isChooseWinner && (
            <>
              {lang("you_are_explaining_the_word")}
              {countDown > 0 ? ` (${countDown})` : ""}
            </>
          )}
          {status === 3 && (
            <>
              {lang("wait_for_winner")}
              {countDown > 0 ? ` (${countDown})` : ""}
            </>
          )}
          {status === 4 && (
            <>
              {lang("you_win_press_get_prize")}
              {countDown > 0 ? ` (${countDown})` : ""}
            </>
          )}
        </PlayingRoomFooter>
      </Container.Footer>
    </Container>
  );
};

const EmojiImage = styled.h2`
  font-size: 96px;
  text-align: center;
`;

const StatusMessage = styled.p`
  margin-top: 10px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  max-width: 260px;
`;

const SubStatusMessage = styled.p`
  margin-top: 10px;
  text-align: center;
  max-width: 260px;
`;

const PlayingRoomControlFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 80px;
  border-top: 1px solid rgb(241, 236, 228);
  background-color: rgb(251, 246, 238);
  padding: 0 20px;
  color: white;
`;

const PlayingRoomFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 50px;
  background-color: #222;
  padding: 0 20px;
  color: white;
`;

const Border = styled.div`
  border-radius: 0;
  border: 1px solid #51565F;
  padding: 10px 20px;
  background-color: white;
  min-width: 280px;
  max-width: 360px;
  margin: 20px 0;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 20px 0;
`;

export default PlayingRoom;
