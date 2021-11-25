import React from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";
import styled from "styled-components";

const StyledMenu = styled.nav`
  flex-direction: column;
  justify-content: center;
  background: #bdc3c7;
  transform: ${({ open }) => (open ? "translateX(10%)" : "translateX(100%)")};
  height: 100vh;
  padding: 2rem;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
  overflow-y: hidden;
  transition: transform 0.3s ease-in-out;
  display: none;

  @media (max-width: 500px) {
    display: flex;
  }
  @media (max-width: 576px) {
    width: 100%;
  }

  a {
    font-size: 2rem;
    text-transform: uppercase;
    padding: 2rem;
    font-weight: bold;
    letter-spacing: 0.5rem;
    color: #34495e;
    text-decoration: none;
    transition: color 0.3s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: left;
    }
  }
`;

const Menu = ({ open, setOpen }) => {
  return (
    <StyledMenu open={open}>
      <AnchorLink href="#about" onClick={() => setOpen(!open)}>
        About
      </AnchorLink>
      <AnchorLink href="#projects" onClick={() => setOpen(!open)}>
        Projects
      </AnchorLink>
      <AnchorLink href="#contact" onClick={() => setOpen(!open)}>
        Contact
      </AnchorLink>
    </StyledMenu>
  );
};

export default Menu;
