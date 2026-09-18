// Seed data for the 33 branches of Centre of Higher Education, Haryana.
// This is inserted into MongoDB once, the first time the server starts
// against an empty database. After that, MongoDB is the source of truth —
// editing this file will NOT change already-seeded data (use the /api
// routes or MongoDB directly to update records afterwards).

const ROLES = ["Assistant Director", "Superintendent", "Assistant", "Clerk", "DEO"];

const BIO_FOCUS = {
  "Assistant Director":
    "overall branch strategy, policy compliance and inter-departmental coordination",
  Superintendent: "day-to-day supervision of branch staff and workflow management",
  Assistant: "processing case files, verification and official correspondence",
  Clerk: "record-keeping, data entry and documentation",
  DEO: "digital data entry and system/records updates",
};

// Colours used to generate each person's avatar, keyed by role so the
// hierarchy reads visually top-down (deep navy/gold for senior roles,
// lighter slate tones further down the chain).
const ROLE_AVATAR_COLORS = {
  "Assistant Director": { bg: "0f172a", color: "f59e0b" },
  Superintendent: { bg: "1e293b", color: "e2e8f0" },
  Assistant: { bg: "334155", color: "e2e8f0" },
  Clerk: { bg: "475569", color: "f1f5f9" },
  DEO: { bg: "64748b", color: "f8fafc" },
};

const BRANCH_DEFS = [
  { id: "sports", name: "Sports", icon: "Trophy",
    people: ["Deepak Sir", "Dhoop Singh", "Anita Dhiman", "Ishwar", "Vijay"] },
  { id: "academics", name: "Academics", icon: "BookOpen",
    people: ["Rakesh Yadav", "Suresh Kumar", "Meena Sharma", "Ramesh Chand", "Pooja Rani"] },
  { id: "examinations", name: "Examinations", icon: "FileCheck",
    people: ["Ashok Mehta", "Ravi Dahiya", "Sunita Devi", "Mahesh Gupta", "Rohit Verma"] },
  { id: "admissions", name: "Admissions", icon: "UserPlus",
    people: ["Sanjay Malik", "Naresh Kaushik", "Kavita Rani", "Dinesh Kumar", "Pankaj Sharma"] },
  { id: "finance", name: "Finance & Accounts", icon: "Wallet",
    people: ["Vinod Aggarwal", "Sushil Bansal", "Rekha Jain", "Yogesh Goyal", "Ankit Mittal"] },
  { id: "hr", name: "Human Resources", icon: "Users",
    people: ["Neelam Sharma", "Vikas Sehrawat", "Priya Chaudhary", "Manoj Ahlawat", "Neha Kapoor"] },
  { id: "it", name: "Information Technology", icon: "Cpu",
    people: ["Arun Bhatia", "Karan Sethi", "Ritu Saini", "Amit Rana", "Deepika Ahuja"] },
  { id: "library", name: "Library", icon: "Library",
    people: ["Om Prakash", "Radha Krishnan", "Sarita Devi", "Bhupender Singh", "Nisha Yadav"] },
  { id: "research", name: "Research & Innovation", icon: "FlaskConical",
    people: ["Dr. Anil Kumar", "Dr. Meera Joshi", "Sonia Nagar", "Harish Kumar", "Preeti Rathi"] },
  { id: "planning", name: "Planning & Development", icon: "LineChart",
    people: ["Jagdish Rai", "Bharat Singh", "Kamla Devi", "Satish Kumar", "Divya Chauhan"] },
  { id: "affiliation", name: "Affiliation", icon: "Link",
    people: ["Rajender Singh", "Om Dutt", "Manisha Rani", "Krishan Kumar", "Sunil Dahiya"] },
  { id: "student-welfare", name: "Student Welfare", icon: "HeartHandshake",
    people: ["Balbir Singh", "Yashpal Sharma", "Kiran Bala", "Ajay Kumar", "Rinku Devi"] },
  { id: "scholarships", name: "Scholarships", icon: "GraduationCap",
    people: ["Randhir Singh", "Mahender Pal", "Seema Kadyan", "Naveen Kumar", "Shalu Sharma"] },
  { id: "hostels", name: "Hostels", icon: "Building",
    people: ["Devender Rana", "Anil Yadav", "Reena Kumari", "Sube Singh", "Mohit Rathee"] },
  { id: "estate", name: "Estate & Infrastructure", icon: "Landmark",
    people: ["Ram Niwas", "Kartar Singh", "Usha Rani", "Praveen Kumar", "Sachin Malik"] },
  { id: "security", name: "Security", icon: "ShieldCheck",
    people: ["Inspector Ram Kumar", "Head Const. Jai Singh", "Poonam Devi", "Ranjit Singh", "Vikram Chauhan"] },
  { id: "legal", name: "Legal Cell", icon: "Scale",
    people: ["Adv. Sunil Beniwal", "Prem Chand", "Anjali Gupta", "Ravinder Sheokand", "Nitin Bansal"] },
  { id: "public-relations", name: "Public Relations", icon: "Megaphone",
    people: ["Kuldeep Sangwan", "Yogesh Jangra", "Ritika Kapoor", "Sandeep Kumar", "Shivani Arora"] },
  { id: "vigilance", name: "Vigilance", icon: "Eye",
    people: ["Surender Hooda", "Ramkishan", "Geeta Rani", "Jitender Kumar", "Aakash Sharma"] },
  { id: "audit", name: "Internal Audit", icon: "ClipboardCheck",
    people: ["S.K. Aggarwal", "R.P. Singhal", "Kavita Bansal", "Deepak Garg", "Nikhil Jain"] },
  { id: "purchase", name: "Purchase & Stores", icon: "ShoppingCart",
    people: ["Ramphal", "Baljeet Singh", "Sunita Sharma", "Ompal", "Kunal Verma"] },
  { id: "transport", name: "Transport", icon: "Bus",
    people: ["Dharmender Rathi", "Zile Singh", "Savita Rani", "Rajesh Nagar", "Sombir Singh"] },
  { id: "medical", name: "Medical & Health", icon: "Stethoscope",
    people: ["Dr. Rajiv Bhatia", "Ram Mehar", "Sister Kamlesh", "Vinay Kumar", "Shweta Malhotra"] },
  { id: "cultural", name: "Cultural Affairs", icon: "Music",
    people: ["Rajeev Vats", "Anup Kadian", "Sneha Deswal", "Parveen Kumar", "Nikita Ahlawat"] },
  { id: "distance-education", name: "Distance Education", icon: "MonitorPlay",
    people: ["Dr. Pardeep Kumar", "Mahavir Prasad", "Rachna Sharma", "Sandeep Yadav", "Isha Bhardwaj"] },
  { id: "training-placement", name: "Training & Placement", icon: "Briefcase",
    people: ["Vikas Aggarwal", "Sameer Chopra", "Payal Ahuja", "Rakesh Rathee", "Aman Kaushik"] },
  { id: "alumni", name: "Alumni Relations", icon: "Contact",
    people: ["Prof. Ajit Singh", "Suraj Bhan", "Nidhi Grover", "Mohan Lal", "Karan Deep"] },
  { id: "grievance", name: "Grievance Redressal", icon: "MessageSquareWarning",
    people: ["Ranbir Singh", "Ompal Yadav", "Rachana Devi", "Naresh Kumar", "Tarun Batra"] },
  { id: "rti", name: "RTI Cell", icon: "FileSearch",
    people: ["Krishan Pal", "Ramesh Rathi", "Bimla Devi", "Ashok Kumar", "Deepak Jangra"] },
  { id: "exam-conduct", name: "Exam Conduct & Result", icon: "FileSpreadsheet",
    people: ["N.R. Sharma", "K.L. Kadian", "Rachna Yadav", "Balwan Singh", "Sourav Antil"] },
  { id: "curriculum", name: "Curriculum Development", icon: "PencilRuler",
    people: ["Dr. Anita Rathee", "Dr. Sanjeev Kumar", "Shivani Malik", "Rajender Beniwal", "Anmol Sharma"] },
  { id: "quality-assurance", name: "Quality Assurance (IQAC)", icon: "BadgeCheck",
    people: ["Dr. Sudhir Kumar", "Bhagwan Das", "Renu Bala", "Vipin Kumar", "Simran Kaur"] },
  { id: "coe", name: "Controller of Examinations Office", icon: "Gavel",
    people: ["Dr. Mahesh Kumar", "R.K. Sangwan", "Vandana Sharma", "Suraj Malik", "Ayush Chauhan"] },
];

// Small deterministic string hash — used so avatars/emails/phones/joining
// years stay stable across re-seeds instead of being random every time.
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function stripTitle(name) {
  return name.replace(/^(Dr\.|Adv\.|Prof\.|Inspector|Head Const\.|Sister)\s+/i, "");
}

function emailFor(name) {
  const local = stripTitle(name)
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${local}@che.hry.gov.in`;
}

function phoneFor(name) {
  let seed = hashStr(name) || 1;
  const digits = [];
  for (let i = 0; i < 9; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    digits.push(seed % 10);
  }
  const firstDigit = 6 + (hashStr(name) % 4); // valid Indian mobile prefix 6-9
  return `+91 ${firstDigit}${digits.slice(0, 4).join("")} ${digits.slice(4, 9).join("")}`;
}

function joinedYearFor(name) {
  return 2006 + (hashStr(name) % 18); // 2006 - 2023
}

function avatarFor(name, role) {
  const clean = stripTitle(name);
  const { bg, color } = ROLE_AVATAR_COLORS[role] || ROLE_AVATAR_COLORS.Assistant;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    clean
  )}&background=${bg}&color=${color}&size=256&bold=true&font-size=0.36`;
}

function buildHierarchy(people, branchName) {
  return people.map((name, idx) => {
    const role = ROLES[idx];
    return {
      level: idx,
      role,
      name,
      avatar: avatarFor(name, role),
      email: emailFor(name),
      phone: phoneFor(name),
      joined: joinedYearFor(name),
      bio: `${role} in the ${branchName} branch, responsible for ${BIO_FOCUS[role]}.`,
    };
  });
}

function buildSeedBranches() {
  return BRANCH_DEFS.map((b, i) => ({
    id: b.id,
    code: `CHE-${String(i + 1).padStart(2, "0")}`,
    name: b.name,
    icon: b.icon,
    description: `${b.name} branch of the Centre of Higher Education, Haryana.`,
    headcount: b.people.length,
    hierarchy: buildHierarchy(b.people, b.name),
  }));
}

module.exports = {
  buildSeedBranches,
  ROLES,
  BRANCH_DEFS,
  BIO_FOCUS,
  avatarFor,
  emailFor,
  phoneFor,
  joinedYearFor,
  stripTitle,
};
