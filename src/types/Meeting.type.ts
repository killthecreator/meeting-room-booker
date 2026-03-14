export type Meeting = {
  id: string;
  name: string;
  description: string;
  owner: string;
  /** Current user's id (e.g. Google sub) when they created this meeting */
  ownerId?: string;
  ownerEmail?: string;
  ownerPicture?: string;
  start: Date;
  end: Date;
};
