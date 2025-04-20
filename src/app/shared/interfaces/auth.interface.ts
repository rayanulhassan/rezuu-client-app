export interface Credentials {
  email: string;
  password: string;
}

export interface RezuuUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  resume: string | null;
  certificates: { url: string; name: string }[];
  video: string | null;
  externalLinks: string[];
  isPayingUser: boolean;
  package: string | null;
  description: string | null;
}

