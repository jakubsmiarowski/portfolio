import gsap from "gsap";

// REVEAL HOME TEXT
export const revealTextHome = (node1) => {
    gsap.from([node1], {
        duration: 0.9,
        opacity: 0,
        delay: 0.9,
        ease: "power3.out",
        y: 64,
        stagger: {
            amount: 0.15
        }
    });
};
// REVEAL RESUME BUTTON
export const reavealButton = node => {
    gsap.from(node, {
        duration: 0.9,
        opacity: 0,
        delay: 0.9,
        ease: "power3.out",
        x: 64,
        stagger: {
            amount: 0.15
        }
    });
}

//Reveal Emoji
export const reavealEmoji = node => {
    gsap.from(node, {
        duration: 0.9,
        opacity: 0,
        delay: 0.9,
        ease: "power3.out",
        y: 64,
        stagger: {
            amount: 0.15
        }
    });
}