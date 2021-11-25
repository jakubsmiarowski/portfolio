import React, {useState, useRef} from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";
import Menu from "../Menu/Menu";
import Burger from "../Burger/Burger";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100px;
  z-index: 999;
  padding: 0 200px;
  overflow: hidden;
  @media (max-width: 1440px) {
    padding: 0 200px;
  }
  @media (max-width: 1024px) {
    padding: 0 100px;
  }

  @media (max-width: 500px) {
    padding: 0 50px;
  }
  @media (max-width: 320px) {
    padding: 0 25px;
  }
`;

const StyledUl = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;
  @media (max-width: 500px) {
    display: none;
  }
`;

const StyledLi = styled.li`
  margin-left: 100px;
  font-weight: 700;
  font-size: 1rem;
  @media (max-width: 1080px) {
    margin-left: 50px;
  }
`;
const StyledDiv = styled.div`
  margin: 0;
  padding: 0;
  display: none;
  @media (max-width: 500px) {
    display: block;
  }
`;

const StyledLink = styled(AnchorLink)`
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  color: #34495e;
  z-index: 999;
`;

const Header = () => {
    const [open, setOpen] = useState(false);
    const node = useRef();

    return (
        <StyledContainer>
            <StyledLink>JAKUBŚMIAROWSKI.</StyledLink>
            <StyledUl>
                <StyledLi>
                    <StyledLink href="#about">About</StyledLink>
                </StyledLi>
                <StyledLi>
                    <StyledLink href="#projects">Projects</StyledLink>
                </StyledLi>
                <StyledLi>
                    <StyledLink href="#contact">Contact</StyledLink>
                </StyledLi>
            </StyledUl>
            <StyledDiv ref={node}>
                <Burger open={open} setOpen={setOpen}/>
                <Menu open={open} setOpen={setOpen}/>
            </StyledDiv>
        </StyledContainer>
    );
};

export default Header;
