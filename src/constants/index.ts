import { FormInterface, ProjectSectionType, Status } from "@/types";
import {useTranslations} from 'next-intl';
const email = process.env.NEXT_PUBLIC_EMAIL;



export const useSocialNetWorks = (): { title: string; netWorks: { name: string; link: string; icon: string; color: string }[] } => {
  const social = useTranslations('social');
  return {
    title: social('title'),
    netWorks: [
      {
        name: "Github",
        link: "https://github.com/juanvs23",
        icon: "github",
        color: "#000",
      },
      {
        name: "Facebook",
        link: "https://www.facebook.com/juancarlos.avila.1420/",
        icon: "facebook",
        color: "#3b5998",
      },
      {
        name: "Linkedin",
        link: "https://www.linkedin.com/in/juanvs23/",
        icon: "linkedin",
        color: "#0077b5",
      },
      {
        name: "X",
        link: "https://twitter.com/juanvs23",
        icon: "twitter",
        color: "#1da1f2",
      },
    ],
  };
}

export const UseAbout = ()=>{
  const about = useTranslations('about');
  return {
    title: about('title'),
    description: about('description'),
    skills: about('skills'),
  }
}


export const useJobs = ()=>{
  const jobs = useTranslations('jobs');
  const translate = useTranslations();

  const jobsItems = ['ama', 'ciancoder', 'tremgroup', 'conocimiento', 'nivelics', 'ztgroup', 'hispano'] as const;


  const jobsItemsTranslate = jobsItems.map((job, index) => {
    return {
      id: index + 1,
      title: translate(`${job}.title`),
      date: {
        startDate: new Date(translate(`${job}.start`)),
        endDate: new Date(translate(`${job}.end`)),
      },
      company: translate(`${job}.company`),
      description: translate(`${job}.description`),
    };
  });

  return{
    title: jobs('title'),
    jobsItems: jobsItemsTranslate,
  };
}
export const useProjects = ()=>{
  const projects = useTranslations('projects');
  return{
      title: projects('title'),
      subTitle: projects('subtitle'),
      button: projects('button'),
      projectsItems: [
        {
          id: 1,
          name: "Gericht",
          url: "https://restaurant.coltmandev.dev/",
          description: "",
          img: "/img/gericht.jpg",
        },
        {
          id: 2,
          name: "Cesde",
          url: "https://www.cesde.edu.co/",
          description: "",
          img: "/img/cesde.jpg",
        },
        {
          id: 3,
          name: "Thinkus",
          url: "https://thinkus.io/",
          description: "",
          img: "/img/thinkous.jpg",
        },
        {
          id: 4,
          name: "Proyectos Cesde",
          url: "https://proyectos.cesde.edu.co/",
          description: "",
          img: "/img/cesde-proyectos.jpg",
        },
        {
          id: 5,
          name: "Cesde Colegios",
          url: "https://colegios.cesde.edu.co/",
          description: "",
          img: "/img/colegios.jpg",
        },
        {
          id: 6,
          name: "Centro de empleo Cesde",
          url: "https://centrodeempleo.cesde.edu.co/",
          description: "",
          img: "/img/empleo.jpg",
        },
        {
          id: 8,
          name: "Dogtorscat",
          url: "https://www.dogtorscat.com/",
          description: "",
          img: "/img/dogtor.jpg",
        },
        {
          id: 11,
          name: "Hisomos",
          url: "https://hisomos.com/",
          description: "",
          img: "/img/hisomo.jpg",
        },
        {
          id: 12,
          name: "Book project",
          url: "https://projects.coltmandev.dev/product-book/",
          description: "",
          img: "/img/book-test.jpg",
        },
        {
          id: 13,
          name: "LuxlifemiamiBlog",
          url: "https://luxlifemiamiblog.com/market-statistics/",
          description: "",
          img: "/img/luxlife.jpg",
        },
        {
          id: 14,
          name: "Boreal Expedition",
          url: "https://borealexpedition.com/",
          description: "",
          img: "/img/boreal.jpg",
        },
        {
          id: 15,
          name: "Emprende",
          url: "https://emprende.cesde.edu.co/",
          description: "",
          img: "/img/emprende.jpg",
        },
        {
          id: 16,
          name: "Fancy Login",
          description: "",
          img: "https://github.com/juanvs23/fancy-login/raw/master/public/demo.jpg",
          url: "https://projects.coltmandev.dev/fancy-login/",
        },
        {
          id:17,
          name: "Incredible Table",
          description: "",
          img: "/img/incredible-room.jpg",
          url: "https://incredible-table.vercel.app/",
        },
        {
          id: 18,
          name: "Pockemon API",
          description: "",
          url: "https://next-pokemon-coral.vercel.app/",
          img: "/img/pockemon.webp",
        },
         {
          id: 19,
          name: "News App",
          description: "",
          url: "https://news-app-sage-theta.vercel.app/",
          img: "/img/news-app.webp",
        },
        {
          id: 20,
          name: "Bajalenx",
          description: "",
          url: "https://projects.coltmandev.dev/bajalenx/",
          img: "/img/bajalenx.webp",
        },
        {
          id: 21,
          name: "Clima App",
          description: "",
          url: "https://clima-gray-nine.vercel.app/",
          img: "/img/clima-app.webp",
        },
      ],
    };

}

export const useSeo = () => {
  
}


export const useInitialForm = () => {
  const inputField = useTranslations('inputField');
/*
 "fullName": "Nombre Completo",
        "phone": "Teléfono",
        "email": "Correo",
        "subject": "Asunto",
        "message": "Mensaje",
        "send": "Enviar"
*/
  return{
    status: Status.idle,
    message: "",
    send: inputField('send'),
    inputs: [
      {
        name: "name",
        inputTitle: inputField('fullName'),
        inputValue: "",
        inputError: null,
        active: false,
      },
      {
        name: "phone",
        inputTitle: inputField('phone'),
        inputValue: "",
        inputError: null,
        active: false,
      },
      {
        name: "email",
        inputTitle: inputField('email'),
        inputValue: "",
        inputError: null,
        active: false,
      },
      {
        name: "subject",
        inputTitle: inputField('subject'),
        inputValue: "",
        inputError: null,
        active: false,
      },
      {
        name: "message",
        inputTitle: inputField('message'),
        inputValue: "",
        inputError: null,
        active: false,
      },
    ],

  };
}

export const initialForm: FormInterface = {
  status: Status.idle,
  message: "",
  inputs: [
    {
      name: "name",
      inputTitle: "Full Name",
      inputValue: "",
      inputError: null,
      active: false,
    },
    {
      name: "phone",
      inputTitle: "Phone",
      inputValue: "",
      inputError: null,
      active: false,
    },
    {
      name: "email",
      inputTitle: "Email",
      inputValue: "",
      inputError: null,
      active: false,
    },
    {
      name: "subject",
      inputTitle: "Subject",
      inputValue: "",
      inputError: null,
      active: false,
    },
    {
      name: "message",
      inputTitle: "Message",
      inputValue: "",
      inputError: null,
      active: false,
    },
  ],
};
//<i class="fa-solid fa-envelope-open"></i>
//<i class="fa-solid fa-envelope-open-text"></i>
//<i class="fa-solid fa-envelope"></i>
export const useContactUs = ()=>{
  const contactUs = useTranslations('contactUs');
  const emailData = useTranslations('emailData');

  return {
    title: contactUs('title'),
    subtitle: contactUs('subtitle'),
    formTitle: contactUs('formTitle'),
    emailData: {
      title: emailData('title'),
      hoverTitle: emailData('hoverTitle'),
      clickedTitle: emailData('clickedTitle'),
      email: email,
      icons: {
        initialIcon: "fa-solid fa-envelope-open",
        hoverIcon: "fa-solid fa-envelope-open-text",
        clickedIcon: "fa-solid fa-envelope",
      },
    },
    form: initialForm,
    networks: useSocialNetWorks,
  };
}
export const useFormMessage = ()=>{
  const formMessage = useTranslations('formMessage');
  const formMessageErrors = useTranslations('formMessageErrors');
  return{
    success: formMessage('success'),
    error: formMessage('error'),
    sending: formMessage('sending'),
    errors: {
      field: formMessageErrors('field'),
      phone: formMessageErrors('phone'),
      email: formMessageErrors('email'),
    },
  };
}
export const useFooter = ()=>{
  const footer = useTranslations('footer');
  return  {
    develop: footer('develop'),
    copy: footer('copy'),
  }
};