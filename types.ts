export interface Domain {
  id: string;
  title: string;
  icon: string;
  description: string;
  detailedDescription: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  outcome: string;
  activities?: string;
  guests?: Array<{
    name: string;
    background: string;
  }>;
  youtubeLink?: string;
  registrations?: string;
  highlights?: string;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

export interface Stat {
  label: string;
  value: string;
}


