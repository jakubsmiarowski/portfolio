import React, { useState } from "react";
import styled from "styled-components";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  div {
    display: flex;
    justify-content: space-between;
    position: relative;
    input,
    textarea {
      padding: 7px 0;
      border-top: none;
      border-right: none;
      border-left: none;
      outline: none;
      width: 350px;
      border-bottom: 1px solid #34495e;
      font-family: "Poppins";
    }
    textarea {
      height: 100px;
    }
    input::placeholder,
    textarea::placeholder {
      font-family: "Poppins";
      font-size: 12px;
      color: #34495e;
      vertical-align: bottom;
    }
  }
  @media (max-width: 425px) {
    div {
      input,
      textarea {
        width: 280px;
      }
    }
  }
`;
const StyledButton = styled.button`
  margin-top: 40px;
  border: none;
  outline: none;
  padding: 2px 4px;
  font-size: 15px;
  font-weight: 800;
  color: #34495e;
  background: transparent;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  &:hover {
    color: white;
    background: #34495e;
    padding: 8px 24px;
    border-radius: 4px;
  }
`;

toast.configure();

const Form = () => {

  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  const onChangeName = (e) => {
    const { value } = e.target;
    setInputName(value);
  };
  const onChangeEmail = (e) => {
    const { value } = e.target;
    setInputEmail(value);
  };
  const onChangeMessage = (e) => {
    const { value } = e.target;
    setInputMessage(value);
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "gmail",
        "email template",
        e.target,
        "user_6hIDxmbRhFzjpbaIncMxC"
      )
      .then(
        (result) => {
          console.log(result.text);
          toast.info("Thank you for your message!", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        },
        (error) => {
          console.log(error.text);
          toast.error("Something went wrong, please try again later :(", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      );

    setInputName("");
    setInputEmail("");
    setInputMessage("");
  };

  return (
    <StyledForm id="contact-form" onSubmit={sendEmail}>
      <div>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={inputName}
          onChange={onChangeName}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={inputEmail}
          onChange={onChangeEmail}
        />
      </div>
      <div>
        <textarea
          rows="5"
          placeholder="Message"
          name="message"
          value={inputMessage}
          onChange={onChangeMessage}
        />
      </div>
      <StyledButton type="submit">Submit</StyledButton>
    </StyledForm>
  );
};

export default Form;
