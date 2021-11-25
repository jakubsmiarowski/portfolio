import React from 'react';
import ReactDOM from "react-dom";
import styled from "styled-components";

const StyledContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0,0,0, .3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: all 0.3s ease;
`;
const StyledModal = styled.div`
    width: 80vw;
    height: auto;
    padding: 0 2rem 2rem 2rem;
    background-color: white;
    backdrop-filter: blur(5px);
    box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
`;
const StyledHeader = styled.header`
    position: relative;
`;
const StyledTitle = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`;

const StyledCloseButton = styled.div`
    position: absolute;
    top: 1rem;
    right: 0;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    &:hover {
      transform: scale(1.1);
    }
`;

const modalRoot = document.getElementById("modal");

const Modal = ({open, close, title, project, children}) => {
    if(!open) return null
    return ReactDOM.createPortal(
        <>
            <StyledContainer>
                <StyledModal>
                    <StyledHeader>
                        <StyledTitle>
                            <h2>{title}</h2>
                        </StyledTitle>
                        <StyledCloseButton onClick={close}>X</StyledCloseButton>
                    </StyledHeader>
                    <main>{children}</main>
                </StyledModal>
            </StyledContainer>
        </>
        , modalRoot
    )
}
export default Modal;