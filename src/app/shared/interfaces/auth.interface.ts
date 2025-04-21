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
  videos: { url: string; description: string | null }[];
  externalLinks: { platform: string; url: string }[];
  isPayingUser: boolean;
  package: string | null;
  description: string | null;
  contactNumber: string | null;
  isPublicProfile: boolean;
}

