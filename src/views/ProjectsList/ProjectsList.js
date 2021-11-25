import React, {useState} from "react";
import styled from "styled-components";
import Modal from "../../components/Modal/Modal";
import ModalContent from "../../components/Modal/ModalContent";
import projects from '../../assets/data/projects';

const StyledContainer = styled.div`
  margin-top: 150px;
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
  margin-top: 30px;
  color: #34495e;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-weight: 600;
  text-align: center;
`;
const StyledProjectsContainer = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(2, 1fr);
  margin-top: 3rem;
  @media (max-width: 800px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;
const StyledProject = styled.div`
  position: relative;
  height: 100%;

  .overlay {
    transition: 0.5s;
  }
  &:hover {
    background-color: rgba(255, 255, 255, 0.92);
    .project-btn {
      transform: none;
    }
    .img {
      opacity: 0.2;
      transform: scale(1.03);
    }
    .overlay {
      opacity: 1;
    }
  }
  @media (max-width: 800px) {
    margin: 0 auto;
  }
`;
const StyledOverlay = styled.div`
  position: absolute;
  transform: translate(-50%);
  top: 45%;
  left: 50%;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  overflow: hidden;
  z-index: 1;
`;
const StyledSpan = styled.span`
  font-size: 28px;
  transition: 0.5s;
  border: none;
  border-radius: 10px;
  background: #34495e;
  padding: 4px 15px;
  &:first-child {
    transform: translateX(-500px);
  }
  &:nth-child(2) {
    transform: translateX(500px);
  }
`;
const StyledLink = styled.a`
  padding: 6px;
  text-decoration: none;
  color: #ecf0f1;
  cursor: pointer;
`;
const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  object-fit: contain;
  -webkit-box-shadow: 0px 0px 12px -1px rgba(52, 73, 94, 0.45);
  -moz-box-shadow: 0px 0px 12px -1px rgba(52, 73, 94, 0.45);
  box-shadow: 0px 0px 12px -1px rgba(52, 73, 94, 0.45);
  transition: 0.5s;
`;

function ProjectsList() {
    const [open, setOpen] = useState(false);
    const toggleModal = () => setOpen(prevOpen => !prevOpen);

    return (
        <StyledContainer id="projects" className="section">
            <StyledHr></StyledHr>
            <StyledParagraph>
                These are some of the projects I worked on
            </StyledParagraph>
            <StyledProjectsContainer>
                {projects.map(project => (
                    <StyledProject id="project" key={project.id}>
                        <StyledOverlay className="overlay">
                            <StyledSpan className="project-btn">
                                {
                                    (project.live)
                                        ? <StyledLink
                                            href={project.live}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            live
                                        </StyledLink>
                                        : <StyledLink onClick={toggleModal}>description</StyledLink>
                                }
                            </StyledSpan>
                            {
                                (project.code)
                                    ? <StyledSpan className="project-btn">
                                        <StyledLink
                                            href={project.code}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            code
                                        </StyledLink>
                                    </StyledSpan>
                                    : <></>
                            }
                        </StyledOverlay>
                        <StyledImage
                            className="img"
                            src={project.image}
                            alt={project.name} />
                        <Modal open={open} close={toggleModal} title={project.name}>
                            <ModalContent description={project.description} />
                        </Modal>
                    </StyledProject>
                ))}
            </StyledProjectsContainer>
        </StyledContainer>
    );
}

export default ProjectsList;
