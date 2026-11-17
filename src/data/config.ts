import type { UnitType } from './types';

export const ADMIN_EMAIL = 'admin@barrackpore.app';
export const DEMO_MEMBER_PASSWORD = 'Demo@123';
export const DEMO_ADMIN_PASSWORD = 'Admin@123';

export const TYPE_LABEL: Record<UnitType, string> = {
  district: 'District',
  extended: 'Extended Committee',
  cell: 'Cell',
  assembly: 'Assembly',
  mandal: 'Mandal',
  morcha: 'Morcha',
  shakti: 'Shakti Kendra',
  booth: 'Booth',
};

export const TYPE_PLURAL: Record<UnitType, string> = {
  district: 'Districts',
  extended: 'Extended Committee',
  cell: 'Cells',
  assembly: 'Assemblies',
  mandal: 'Mandals',
  morcha: 'Morchas',
  shakti: 'Shakti Kendras',
  booth: 'Booths',
};

const STD = ['President', 'Vice President', 'Vice President', 'Vice President', 'General Secretary',
  'Secretary', 'Secretary', 'Treasurer', 'Office Secretary', 'IT In-charge'];

/** 10-person committee for each unit type, in rank order. */
export const POSTS: Record<UnitType, string[]> = {
  district: STD,
  // Extended Committee: managed by the District President, GS and IT In-charge (it has no own President).
  extended: [...Array(5).fill('Special Invitee'), ...Array(20).fill('Member')],
  cell: ['Convenor', 'Co-Convenor', 'Secretary', 'IT In-charge',
    'Member', 'Member', 'Member', 'Member', 'Member', 'Member'],
  assembly: ['Convenor', 'Co-Convenor', 'Co-Convenor', 'General Secretary', 'Secretary', 'Secretary',
    'Treasurer', 'Media In-charge', 'Social Media In-charge', 'IT In-charge'],
  mandal: STD,
  morcha: STD,
  shakti: ['Shakti Pramukh', 'Sah Pramukh', 'Secretary', 'IT In-charge',
    'Member', 'Member', 'Member', 'Member', 'Member', 'Member'],
  booth: ['Booth President', 'Booth Secretary', 'BLA-2', 'IT In-charge',
    'Member', 'Member', 'Member', 'Member', 'Member', 'Member'],
};

/** The 3 posts that manage each committee. Only Admin can appoint them.
 *  They can add/edit the other members of their own committee, set ranking and create events. */
export const POWER_POSTS: Record<UnitType, string[]> = {
  district: ['President', 'General Secretary', 'IT In-charge'],
  extended: [], // managed by the parent unit's 3
  cell: ['Convenor', 'Secretary', 'IT In-charge'],
  assembly: ['Convenor', 'General Secretary', 'IT In-charge'],
  mandal: ['President', 'General Secretary', 'IT In-charge'],
  morcha: ['President', 'General Secretary', 'IT In-charge'],
  shakti: ['Shakti Pramukh', 'Secretary', 'IT In-charge'],
  booth: ['Booth President', 'Booth Secretary', 'IT In-charge'],
};

/** One colour per branch, used for the tiles and lines on the home page. */
export const BRANCH_COLOR: Record<UnitType | 'committee', string> = {
  committee: '#EA6A0C',
  district: '#EA6A0C',
  extended: '#9333EA',
  morcha: '#DB2777',
  cell: '#0891B2',
  assembly: '#15803D',
  mandal: '#2563EB',
  shakti: '#CA8A04',
  booth: '#4F46E5',
};

export const ASSEMBLIES = ['Amdanga', 'Bijpur', 'Naihati', 'Bhatpara', 'Jagatdal', 'Noapara', 'Barrackpore'];
export const MORCHAS = ['Yuva Morcha', 'Mahila Morcha', 'Kisan Morcha', 'SC Morcha', 'ST Morcha', 'OBC Morcha', 'Minority Morcha'];
export const CELLS = ['Legal Cell', 'Doctors Cell', 'Teachers Cell', 'Traders Cell', 'Intellectuals Cell', 'IT & Social Media Cell'];
export const MANDALS_PER_ASSEMBLY = 3;
export const SHAKTI_PER_MANDAL = 3;
export const BOOTHS_PER_SHAKTI = 4;
