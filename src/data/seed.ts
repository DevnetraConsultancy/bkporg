import type { DB, Member, Unit, UnitType, EventItem } from './types';
import { hashPw } from './hash';
import { ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_MEMBER_PASSWORD, ASSEMBLIES, BOOTHS_PER_SHAKTI, CELLS, MANDALS_PER_ASSEMBLY, MORCHAS, POSTS, SHAKTI_PER_MANDAL } from './config';

// Small seeded random generator, so the demo data is the same every time.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MALE = ['Rahul', 'Amit', 'Subhas', 'Sanjay', 'Partha', 'Debasish', 'Arijit', 'Sourav', 'Tapas', 'Biswajit',
  'Prasenjit', 'Abhijit', 'Sudip', 'Kaushik', 'Ranjit', 'Manoj', 'Pradip', 'Ashok', 'Gautam', 'Tarun', 'Bikash',
  'Sandip', 'Dipankar', 'Anirban', 'Raju', 'Shankar', 'Nirmal', 'Uttam', 'Swapan', 'Ratan', 'Vikash', 'Rakesh', 'Sunil'];
const FEMALE = ['Mousumi', 'Rina', 'Sima', 'Payel', 'Rupa', 'Moumita', 'Soma', 'Tanushree', 'Anita', 'Shampa',
  'Mitali', 'Sangita', 'Priyanka', 'Debjani', 'Sutapa', 'Puja', 'Kavita', 'Rekha'];
const SURNAME = ['Das', 'Ghosh', 'Bose', 'Sen', 'Roy', 'Dutta', 'Mondal', 'Sarkar', 'Chatterjee', 'Banerjee',
  'Mukherjee', 'Saha', 'Paul', 'Biswas', 'Halder', 'Majumder', 'Chakraborty', 'Sharma', 'Singh', 'Yadav', 'Shaw',
  'Gupta', 'Bhattacharya', 'Naskar', 'Prasad'];
const BLOOD = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'];

export function createSeed(): DB {
  const r = rng(20261117);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const units: Unit[] = [];
  const members: Member[] = [];
  let mCount = 0;
  const demoHash = hashPw(DEMO_MEMBER_PASSWORD);

  const addUnit = (type: UnitType, name: string, parentId: string | null, area: string, femaleOnly = false) => {
    const id = `u${units.length + 1}`;
    units.push({ id, type, name, parentId });
    POSTS[type].forEach((post, i) => {
      mCount++;
      const female = femaleOnly || r() < 0.2;
      const first = female ? pick(FEMALE) : pick(MALE);
      const last = pick(SURNAME);
      members.push({
        id: `m${mCount}`,
        unitId: id,
        name: `${first} ${last}`,
        post,
        rank: i + 1,
        email: `${first}.${last}.${mCount}@demo.in`.toLowerCase(),
        phone: `98${String(30000000 + mCount * 7919).slice(0, 8)}`,
        gender: female ? 'Female' : 'Male',
        age: 25 + Math.floor(r() * 40),
        bloodGroup: pick(BLOOD),
        address: `Ward ${1 + Math.floor(r() * 30)}, ${area}`,
        joined: `${2010 + Math.floor(r() * 15)}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}`,
        addedBy: 'seed',
        passwordHash: demoHash,
        resetToken: null,
      });
    });
    return id;
  };

  const addMorchas = (parentId: string, prefix: string, area: string) =>
    MORCHAS.forEach((m) => addUnit('morcha', `${prefix} ${m}`, parentId, area, m === 'Mahila Morcha'));

  const district = addUnit('district', 'Barrackpore District', null, 'Barrackpore');
  addUnit('extended', 'District Extended Committee', district, 'Barrackpore');
  addMorchas(district, 'District', 'Barrackpore');
  CELLS.forEach((c) => addUnit('cell', `District ${c}`, district, 'Barrackpore'));
  let booth = 0;
  ASSEMBLIES.forEach((a) => {
    const asm = addUnit('assembly', `${a} Assembly`, district, a);
    for (let mi = 1; mi <= MANDALS_PER_ASSEMBLY; mi++) {
      const mandal = addUnit('mandal', `${a} Mandal ${mi}`, asm, a);
      addMorchas(mandal, `${a} M${mi}`, a);
      for (let si = 1; si <= SHAKTI_PER_MANDAL; si++) {
        const sk = addUnit('shakti', `${a} M${mi} Shakti Kendra ${si}`, mandal, a);
        for (let bi = 1; bi <= BOOTHS_PER_SHAKTI; bi++) {
          booth++;
          addUnit('booth', `${a} Booth ${booth}`, sk, a);
        }
      }
    }
  });

  const events: EventItem[] = [
    {
      id: 'e1', title: 'District Padayatra', date: '2026-11-25', time: '16:00', place: 'Barrackpore Station Road',
      description: 'All Assembly and Mandal committees must join with their teams.',
      unitId: district, levels: ['assembly', 'mandal', 'morcha', 'shakti'], createdBy: 'm1', createdAt: '2026-11-15T10:00:00Z',
    },
    {
      id: 'e2', title: 'Naihati Mandal 1 Meeting', date: '2026-11-28', time: '18:00', place: 'Party Office, Naihati',
      description: 'Monthly review of booth work.',
      unitId: units.find((u) => u.name === 'Naihati Mandal 1')!.id, levels: ['shakti', 'booth'],
      createdBy: members.find((m) => m.unitId === units.find((u) => u.name === 'Naihati Mandal 1')!.id)!.id,
      createdAt: '2026-11-16T09:00:00Z',
    },
  ];

  return {
    admin: { email: ADMIN_EMAIL, passwordHash: hashPw(DEMO_ADMIN_PASSWORD), resetToken: null },
    emails: [],
    units, members, events,
    messages: [{ id: 'msg1', from: 'm1', to: 'm10', text: 'Please update the booth committee list by Friday.', at: '2026-11-16T08:30:00Z', read: false }],
  };
}
