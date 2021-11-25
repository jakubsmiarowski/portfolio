import React from "react";
import styled from "styled-components";
import ja from "../../assets/images/unnamed.jpg";

const about = [
  { id: 1, text: "1. I'm 29", em4oji: null },
  { id: 2, text: "2. Love rock climbing 🧗", emoji: null },
  { id: 3, text: "3. Main transportation - bike", emoji: "\u{1F6B4}" },
  {
    id: 4,
    text: "4. Coolest place I've been? Australian Rainforest",
    emoji: "\u{1F334}",
  },
  {
    id: 5,
    text: "5. Reeealy into coding, getting better by the day",
    emoji: "\u{1F468}",
  },
  {
    id: 6,
    text: "6. Like making photos, not being on them",
    emoji: "\u{1F4F8}",
  },
  {
    id: 7,
    text:
      "7. Organized a trip for my 16 friends to go to Thailand. Weirdest trip ever",
    emoji: "\u{1F30F}",
  },
  { id: 8, text: "8. 'Breaking Bad' all the way!", emoji: "\u{1F4FA}" },
  { id: 9, text: "9. King of board games", emoji: "\u{1F3B2}" },
  {
    id: 10,
    text: "10. Favorite quote: 'I find your lack of faith... disturbing'",
    emoji: null,
  },
  {
    id: 11,
    text: "11. Tequila doesn't like me as much as I like Tequila",
    emoji: null,
  },
  {
    id: 12,
    text: "12. My dream job? Blockchain Developer",
    emoji: "🔥",
  },
  { id: 13, text: "13. I hope to meet you", emoji: "\u{1F44B}" },
  { id: 14, text: "14. And have a fantastic day!", emoji: "\u{1F609}" },
];

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
      <StyledHr></StyledHr>
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
          <StyledImage id="photo" src={ja}></StyledImage>
        </StyledImageContainer>
      </StyledGrid>
    </StyledContainer>
  );
}

export default About;
