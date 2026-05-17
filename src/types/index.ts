/* import nodemailer from "nodemailer";
import { ElementType } from "react";
export interface CardSkill {
    title: string;
    icon: React.ReactNode | ElementType;
    points: string[];
    color: string;
} */
export interface ItemView {
  title: string;
  class: string;
  icon: string;
}
export interface JobItem {
  id: number;
  title: string;
  date: {
    startDate: Date;
    endDate: Date | null;
  };
  company: string;
  description: string;
}
export interface JobToolItem {
  id: number;
  title: string;
  icon: string;
}
export interface InputInterface {
  name: string;
  inputTitle: string;
  inputValue: string;
  inputError: string | null;
  active: boolean;
}
export enum Status {
  idle = "idle",
  loading = "loading",
  succeeded = "succeeded",
  failed = "failed",
  error = "error",
}
export interface NetworkItem {
  name: string;
  link: string;
  icon: string;
  color: string;
}
export interface SocialNetWorksInterface {
  title: string;
  netWorks: NetworkItem[];
}
export interface EmailMe {
  emailTitle: string;
  hoverTitle: string;
  clickedTitle: string;
  email: string;
  icons: {
    initialIcon: string;
    hoverIcon: string;
    clickedIcon: string;
  };
}
export interface ContactUsInterface {
  title: string;
  subtitle: string;
  formTitle: string;
  emailData: EmailMe;
  form: FormInterface;
  networks: SocialNetWorksInterface;
}

export interface FormInterface {
  status: Status;
  message: string;
  inputs: InputInterface[];
}
export interface ProjectItem {
  id: number;
  name: string;
  url: string;
  description: string;
  img: string;
}
export interface ProjectSectionType {
  title: string;
  projectsItems: ProjectItem[];
}
export interface sendMailType {
  nodemailer?: any;
  auth: {
    user: string;
    password: string;
  };
  mailData: {
    from: string;
    to: string;
    subject: string;
    html: string;
  };
}