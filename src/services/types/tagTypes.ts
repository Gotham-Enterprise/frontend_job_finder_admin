export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface NewTag {
  name: string;
  slug: string;
  description: string;
}

export interface TagOption {
  value: string;
  text: string;
  selected: boolean;
}
