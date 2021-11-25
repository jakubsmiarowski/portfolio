import ethereum from "../images/ethereum.png";
import shop from "../images/shop.jpg";
import zapp from "../images/music-zapp.jpg";
import ey from "../images/ey.png";

const projects = [
    {
        id: 1,
        name: "send-ether",
        image: ethereum,
        live: "https://send-ether.space",
        code: "https://github.com/jakubsmiarowski/send-ether",
    },
    {
        id: 2,
        name: "React Bike Shop",
        image: shop,
        live: "https://bike-shop-95af0.firebaseapp.com/",
        code: "https://github.com/jakubsmiarowski/shop",
    },
    {
        id: 3,
        name: "Music-Zapp",
        image: zapp,
        live: "https://jolly-leakey-52d67d.netlify.app/",
        code: "https://github.com/jakubsmiarowski/music-zapp",
    },
    {
        id: 4,
        name: "EY applications",
        description: {
            header: 'This section is dedicated my first job as a Frontend Developer. I worked for EY Poland in Angular and Typescript. Unfortunately I cannot show any code or live application here, since the code written during this time is owned by EY.',
            title1: 'LitigEYtor',
            text1: ' - application for EY LAW for tracking their correspondence, cases and clients. This was a beast of an app, build by backend team on Spring. UI build using Angular 9+ with Typescript, RxJS library, Angular Material. I also configured Single Sign-On using Azure AD.',
            title2: 'Copyrights',
            text2: ' - this was another big app I worked on. Used by every employee of EY Poland (and EY Cech Republic) to declare and track their copyrights work. I worked on UI for this one just as with LitigEYtor I configured SSO.',
            title3: 'WeslEY UK',
            text3: ' - chatbot for company Cognizant. With this one I made UI adjustments for Cognizant employees to use as their tool. Chat itself helps to find every tax law that is needed for their work.'
        },
        image: ey,
    },
];
export default projects;