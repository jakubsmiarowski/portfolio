import React, {useRef, useEffect} from "react";
import styled from "styled-components";
import cvKuba from "../../assets/CV/Jakub Smiarowski - CV.pdf";
import {
    revealTextHome,
    reavealButton,
    reavealEmoji,
} from "../../components/Animations/Animations";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/fontawesome-free-solid";

import About from "../About/About";
import ProjectsList from "../ProjectsList/ProjectsList";
import Contact from "../Contact/Contact";

const StyledContainer = styled.div`
  margin: 0 auto;
  padding: 0 200px;
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
const StyledWrapper = styled.div`
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-self: center;
`;

const StyledHeader = styled.h5`
  font-size: 24px;
  font-weight: 400;
  padding-right: 200px;
  text-align: left;
  margin: 10px 0;
  line-height: 40px;
  &:first-of-type {
    margin-top: 260px;
  }
  @media (max-width: 1440px) {
    font-size: 20px;
  }
  @media (max-width: 1024px) {
    padding-right: 100px;
  }
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 0;
  }
  @media (max-width: 375px) {
    &:first-of-type {
      margin-top: 180px;
    }
  }
`;
const StyledLink = styled.a`
  width: 100px;
  height: 50px;
  margin-top: 50px;
`;
const StyledButton = styled.button`
  padding: 15px 40px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background-color: #2c3e50;
  color: white;
  float: left;
  cursor: pointer;
  outline: none;
`;
const StyledHeaderEmoji = styled.div`
  margin-right: 5px;
  font-size: 20px;
`;
const StyledFixedDiv = styled.div`
  position: fixed;
  top: 50%;
  right: 50px;
  transform: rotate(-90deg);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 1.5px;
  mix-blend-mode: difference;
  z-index: 8;
  @media (max-width: 1440px) {
    right: -12px;
  }
  @media (max-width: 768px) {
    right: -30px;
  }
  @media (max-width: 500px) {
    display: none;
  }
`;

gsap.registerPlugin(ScrollTrigger);

function Home({open}) {
    let line1 = useRef(null);

    let button = useRef(null);
    let emoji = useRef(null);

    useEffect(() => {
        revealTextHome(line1);
        reavealButton(button);
        reavealEmoji(emoji);
    });

    useEffect(() => {
        const list = document.querySelectorAll("#list");
        const photo = document.getElementById("photo");
        const projects = document.querySelectorAll("#project");
        const form = document.getElementById("contact-form");
        const socials = document.querySelectorAll("#socials");

        list.forEach((item) => {
            gsap.from(item, {
                duration: 0.9,
                opacity: 0,
                delay: 0.5,
                ease: "power3.out",
                x: -64,
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                },
            });
        });
        gsap.from(photo, {
            duration: 0.9,
            opacity: 0,
            delay: 0.9,
            ease: "power3.out",
            x: 64,
            scrollTrigger: {
                trigger: photo,
                start: "top 90%",
            },
        });
        projects.forEach((item) => {
            gsap.from(item, {
                duration: 0.9,
                opacity: 0,
                delay: 0.5,
                ease: "power3.out",
                y: 64,
                stagger: {
                    amount: 0.15,
                },
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                },
            });
        });
        gsap.from(form, {
            duration: 0.9,
            opacity: 0,
            delay: 0.5,
            ease: "power3.out",
            y: 64,
            stagger: {
                amount: 0.15,
            },
            scrollTrigger: {
                trigger: form,
                start: "top bottom",
            },
        });
        gsap.from(socials, {
            duration: 0.9,
            opacity: 0,
            delay: 0.8,
            ease: "power3.out",
            x: -64,
            scrollTrigger: {
                trigger: socials,
                start: "top bottom",
            },
        });
    });

    return (
        <StyledContainer>
            <StyledWrapper>
                <StyledHeader ref={(el) => (line1 = el)}>
                    Hello! Cześć! ¡Holá!<br></br>
                    I'm <b>Kuba</b> — a Montreal based frontend developer and
                    sports enthusiast, currently working with Typescript and React/Angular.
                </StyledHeader>
                <StyledHeaderEmoji role="img" ref={(el) => (emoji = el)}>
          <span role="img" aria-label="">
            &#127745; &#127754; &#128187; &#128247; &#127947; &#128692;
              &#128509; &#128526;
          </span>{" "}
                </StyledHeaderEmoji>
                <StyledLink href={cvKuba} target="_blank" rel="noopener noreferrer">
                    <StyledButton ref={(el) => (button = el)}>Resume.pdf</StyledButton>
                </StyledLink>
            </StyledWrapper>
            <StyledFixedDiv>
        <span>
          <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon> scroll down{" "}
            <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
        </span>
            </StyledFixedDiv>
            <About/>
            <ProjectsList/>
            <Contact/>
        </StyledContainer>
    );
}

export default Home;
