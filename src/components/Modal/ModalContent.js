import React from 'react';
import styled from "styled-components";

const StyledSpan = styled.span`
    font-weight: bold;
`;

const ModalContent = ({description}) => {
    if(description !== undefined) {
        return (
            <>
                <h4>{description.header}</h4>
                <p><StyledSpan>{description.title1}</StyledSpan>{description.text1}</p>
                <p><StyledSpan>{description.title2}</StyledSpan>{description.text2}</p>
                <p><StyledSpan>{description.title3}</StyledSpan>{description.text3}</p>
            </>
        )
    }
    return <>Something went wrong</>
}
export default ModalContent;