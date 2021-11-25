import React from "react";
import styled from "styled-components";
import Form from "../../components/Form/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/fontawesome-free-solid";

const StyledContainer = styled.div`
  margin: 150px 0 50px 0;
`;
const StyledHr = styled.hr`
  display: block;
  width: 100px;
  height: 2px;
  margin: 0 auto;
  background: black;
  border: none;
  border-radius: 3%;
`;
const StyledParagraph = styled.p`
  margin: 30px 0;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;
  @media (max-width: 575px) {
    margin-bottom: 30px;
  }
`;
const StyledContactInfo = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  margin: 20px 0;
`;
const StyledContactSpan = styled.span`
  cursor: pointer;
  font-weight: 400;
  margin: 0 32px;
  &:first-child {
    margin-left: 64px;
  }
  svg {
    margin-top: 20px;
    color: #34495e;
    font-size: 30px;
    padding: 8px 12px;
    transition: 0.3s ease-out;
    &:hover {
      color: white;
      background: #34495e;
      border-radius: 4px;
    }
  }
  @media (max-width: 571px) {
    margin: 0 16px;
  }
`;
const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
`;
const socials = [
  {
    item: "LinkedIn",
    icon: faLinkedin,
    link: "https://www.linkedin.com/in/jakub-%C5%9Bmiarowski-779371104/",
  },
  {
    item: "Github",
    icon: faGithub,
    link: "https://github.com/jakubsmiarowski/",
  },
  {
    item: "Facebook",
    icon: faFacebook,
    link: "https://www.facebook.com/jakub.smiarowski",
  },
  { item: "Mail", icon: faEnvelope, link: "mailto:jakub.smiarowski@gmail.com" },
];

const Contact = () => {
  return (
    <StyledContainer id="contact">
      <StyledHr></StyledHr>
      <StyledParagraph>Want to get in touch? Shoot me an email</StyledParagraph>
      <div className="section">
        <Form />
        <StyledContactInfo>
          <StyledParagraph>Or let me know here:</StyledParagraph>
          {socials.map((social) => (
            <StyledContactSpan id="socials" key={social.item}>
              <StyledLink
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={social.icon} />
              </StyledLink>
            </StyledContactSpan>
          ))}
        </StyledContactInfo>
      </div>
    </StyledContainer>
  );
};

export default Contact;
