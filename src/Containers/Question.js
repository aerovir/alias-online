import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';


const Question = () => {  
    const navigate = useNavigate();
    const { id } = useParams()

    return (
        <>
            <div style={ { width: '3em', marginLeft: '1em'} }>
                <button onClick={ () => navigate('/') }>Tilbake</button>
            </div>
            <QuestionContainer>
                <QuestionHeader>{ id ? 'Oppdater Spørsmål' : 'Lag nytt spørsmål' }</QuestionHeader>
                <Form>
                    <FormField>
                        <label style={ {marginBottom: '0.5em'} } htmlFor="title">Spørsmål</label>
                        <textarea rows="2" cols="50" type="text"  name="question" id="question"  />
                    </FormField>
                    <FormField>
                        <label style={ {marginBottom: '0.5em'} } htmlFor="answer">Svar</label>
                        <textarea rows="1" cols="50" type="text"  name="answer" id="answer"  />
                    </FormField>
                </Form>
                <ButtonsContainer>
                    <SaveButton>Lagre</SaveButton>
                    <DeleteButton>Slett</DeleteButton>
                </ButtonsContainer>
            </QuestionContainer>
        </>

    );
}

const QuestionContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-left: 1em;
    margin-top: 2em;
`

const QuestionHeader = styled.h1`
    font-size: 2em;
    margin-bottom: 0.5em;
    margin-top: 0.2em;
`

const ButtonsContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 3em;   
`

const Form = styled.div`
    display: flex;
    flex-direction: column;
    width: 60%;
    justify-content: center;
    align-items: center;
`

const FormField = styled.div`
    margin-top: 1em;
    display: flex;
    flex-direction: column;
    width: 100%;
`

const DeleteButton = styled.button`
    background-color: #D885A3; 
    color: white;
`

const SaveButton = styled.button`
    background-color: #54BAB9;
    margin-right: 1em;
`


export default Question;
