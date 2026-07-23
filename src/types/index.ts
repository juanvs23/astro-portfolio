import type { ImageMetadata } from "astro";

export interface ItemView {
  title: string;
  class: string;
  icon: string;
}
export interface JobItem {
  id: number;
  title: string;
  start: string;
  end: string;
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
export interface SocialNetworksInterface {
  title: string;
  networks: NetworkItem[];
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
  networks: SocialNetworksInterface;
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
  desc?: string;
  img: ImageMetadata;
}
export interface ProjectSectionType {
  title: string;
  projectsItems: ProjectItem[];
}
