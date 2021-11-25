import React from "react";
import styled from "styled-components";
import ja from "../../assets/images/unnamed.jpg";
import about from '../../assets/data/about'

const StyledContainer = styled.div``;
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
  margin-top: 30px;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;
`;
const StyledUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 50px 0;
  @media (max-width: 500px) {
    margin: 100px 0;
  }
`;
const StyledLi = styled.li`
  font-size: 1rem;
  margin: 4px 0;
  @media (max-width: 1280px) {
    font-size: 0.8rem;
  }
  @media (max-width: 800px) {
    font-size: 1rem;
  }
`;
const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 50px;
  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
  }
`;
const StyledImageContainer = styled.div`
  padding-top: 50px;
  margin-bottom: 50px;
  @media (max-width: 800px) {
    padding: 0;
  }
  @media (max-width: 500px) {
    margin: 0;
  }
`;
const StyledImage = styled.img`
  max-width: 100%;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: 0.5s;
`;

function About() {
  return (
    <StyledContainer id="about" className="section">
      <StyledHr />
      <StyledParagraph>
        List of Relevant Facts About Me That May Or May Not Make You Wish We Had
        a Beer
      </StyledParagraph>
      <StyledGrid>
        <StyledUl>
          {about.map((item) => (
            <StyledLi id="list" key={item.id}>
              {item.text} {item.emoji}{" "}
            </StyledLi>
          ))}
        </StyledUl>
        <StyledImageContainer>
          <StyledImage id="photo" src={ja} />
        </StyledImageContainer>
      </StyledGrid>
    </StyledContainer>
  );
}

export default About;
