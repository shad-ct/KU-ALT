/**
 * Seed Comprehensive Master Data for Scholar and Guide Registrations
 * Kannur University Research & Development Cell
 * 
 * Populates:
 * - 13 Academic Departments across Sciences, Humanities, Languages, Technology & Commerce
 * - 35 Research Centres (University Departments & Renowned Affiliated Research Colleges)
 * - 13 Ph.D. Research Programmes
 * - 4 Academic Designations (Prof, Assoc Prof, Asst Prof, Emeritus)
 * - Research Centre Heads for affiliated colleges
 * - 24 Approved Research Guides with specializations, qualifications, and free scholar slots
 */

import bcrypt from 'bcryptjs';
import {
  Department,
  ResearchCentre,
  ResearchProgramme,
  Designation,
  User,
  Role,
  Guide,
  GuideSpecialization,
  GuideQualification,
} from './src/models/index.js';
import { sequelize } from './src/db/index.js';
import { INSTITUTION_TYPE, ROLES } from './src/config/constants.js';

async function seedRegistrationData() {
  console.log('--- Starting Registration Master Data Seeding ---');

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  // 1. Fetch Existing Roles
  const roles = await Role.findAll();
  const guideRole = roles.find((r) => r.code === ROLES.GUIDE);
  const centreHeadRole = roles.find((r) => r.code === ROLES.CENTRE_HEAD);
  const drcRole = roles.find((r) => r.code === ROLES.DRC_CONVENOR);

  // 2. Academic Departments
  console.log('Seeding departments...');
  const departmentsData = [
    { id: 1, name: 'Department of Chemistry', code: 'CHEM', drc_convenor_user_id: 4, is_active: true },
    { id: 2, name: 'Department of Physics', code: 'PHYS', drc_convenor_user_id: 4, is_active: true },
    { id: 3, name: 'Department of History', code: 'HIST', drc_convenor_user_id: 4, is_active: true },
    { id: 4, name: 'Department of Computer Science', code: 'CS', drc_convenor_user_id: 4, is_active: true },
    { id: 5, name: 'Department of Mathematical Sciences', code: 'MATH', drc_convenor_user_id: 4, is_active: true },
    { id: 6, name: 'Department of Biotechnology & Microbiology', code: 'BIOTECH', drc_convenor_user_id: 4, is_active: true },
    { id: 7, name: 'Department of Environmental Studies', code: 'ENV', drc_convenor_user_id: 4, is_active: true },
    { id: 8, name: 'Department of Studies in English', code: 'ENG', drc_convenor_user_id: 4, is_active: true },
    { id: 9, name: 'Department of Management Studies', code: 'MGMT', drc_convenor_user_id: 4, is_active: true },
    { id: 10, name: 'Department of Applied Economics', code: 'ECON', drc_convenor_user_id: 4, is_active: true },
    { id: 11, name: 'Department of Malayalam', code: 'MAL', drc_convenor_user_id: 4, is_active: true },
    { id: 12, name: 'Department of Zoology', code: 'ZOOL', drc_convenor_user_id: 4, is_active: true },
    { id: 13, name: 'Department of Commerce', code: 'COMM', drc_convenor_user_id: 4, is_active: true },
  ];

  for (const dept of departmentsData) {
    const existing = await Department.findByPk(dept.id);
    if (!existing) {
      await Department.create(dept);
    } else {
      await existing.update({ name: dept.name, code: dept.code, is_active: true });
    }
  }

  // 3. Programmes
  console.log('Seeding research programmes...');
  const programmesData = [
    { id: 1, name: 'Ph.D. in Chemistry', code: 'PHD-CHEM', duration_years: 3, is_active: true },
    { id: 2, name: 'Ph.D. in Physics', code: 'PHD-PHYS', duration_years: 3, is_active: true },
    { id: 3, name: 'Ph.D. in History', code: 'PHD-HIST', duration_years: 3, is_active: true },
    { id: 4, name: 'Ph.D. in Computer Science', code: 'PHD-CS', duration_years: 3, is_active: true },
    { id: 5, name: 'Ph.D. in Mathematical Sciences', code: 'PHD-MATH', duration_years: 3, is_active: true },
    { id: 6, name: 'Ph.D. in Biotechnology & Microbiology', code: 'PHD-BIOTECH', duration_years: 3, is_active: true },
    { id: 7, name: 'Ph.D. in Environmental Studies', code: 'PHD-ENV', duration_years: 3, is_active: true },
    { id: 8, name: 'Ph.D. in English', code: 'PHD-ENG', duration_years: 3, is_active: true },
    { id: 9, name: 'Ph.D. in Management Studies', code: 'PHD-MGMT', duration_years: 3, is_active: true },
    { id: 10, name: 'Ph.D. in Applied Economics', code: 'PHD-ECON', duration_years: 3, is_active: true },
    { id: 11, name: 'Ph.D. in Malayalam', code: 'PHD-MAL', duration_years: 3, is_active: true },
    { id: 12, name: 'Ph.D. in Zoology', code: 'PHD-ZOOL', duration_years: 3, is_active: true },
    { id: 13, name: 'Ph.D. in Commerce', code: 'PHD-COMM', duration_years: 3, is_active: true },
  ];

  for (const prog of programmesData) {
    const existing = await ResearchProgramme.findByPk(prog.id);
    if (!existing) {
      await ResearchProgramme.create(prog);
    } else {
      await existing.update(prog);
    }
  }

  // 4. Designations
  console.log('Seeding designations...');
  const designationsData = [
    { id: 1, name: 'Assistant Professor' },
    { id: 2, name: 'Associate Professor' },
    { id: 3, name: 'Professor' },
    { id: 4, name: 'Emeritus Professor' },
  ];
  for (const desig of designationsData) {
    const existing = await Designation.findByPk(desig.id);
    if (!existing) {
      await Designation.create(desig);
    }
  }

  // 5. Research Centre Heads (Users)
  console.log('Seeding Centre Heads...');
  const centreHeadsInfo = [
    { email: 'brennen.head@kannur.ac.in', name: 'Dr. P. Balakrishnan', phone: '+91 94471 23401' },
    { email: 'sirsyed.head@kannur.ac.in', name: 'Dr. K. M. Khaleel', phone: '+91 94471 23402' },
    { email: 'payyanur.head@kannur.ac.in', name: 'Dr. Santhosh V.', phone: '+91 94471 23403' },
    { email: 'nehru.head@kannur.ac.in', name: 'Dr. K. V. Unnikrishnan', phone: '+91 94471 23404' },
    { email: 'nirmalagiri.head@kannur.ac.in', name: 'Dr. O. P. Varghese', phone: '+91 94471 23405' },
    { email: 'marymatha.head@kannur.ac.in', name: 'Dr. Maria Thomas', phone: '+91 94471 23406' },
  ];

  const headUsersMap = {};
  headUsersMap['gck'] = 3; // Dr. S. Nambiar (existing user 3)

  for (const ch of centreHeadsInfo) {
    let u = await User.findOne({ where: { email: ch.email } });
    if (!u) {
      u = await User.create({
        email: ch.email,
        password_hash: defaultPasswordHash,
        full_name: ch.name,
        phone: ch.phone,
        status: 'ACTIVE',
        department_id: 1,
      });
      if (centreHeadRole) {
        await u.addRole(centreHeadRole);
      }
    }
    headUsersMap[ch.email] = u.id;
  }

  // 6. Research Centres
  console.log('Seeding research centres...');
  const centresData = [
    // Chemistry (dept 1)
    { id: 1, name: 'Centre for Chemical Sciences (University Campus)', code: 'CHEM-UNI', department_id: 1, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Main Campus' },
    { id: 2, name: 'Govt. College Kasaragod (Chemistry Research Centre)', code: 'GCK-CHEM', department_id: 1, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: 3, college_name: 'Govt. College Kasaragod' },
    { id: 3, name: "St. Joseph's College Pilathara (Chemistry Centre - Vacant Head)", code: 'SJC-CHEM', department_id: 1, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: null, college_name: "St. Joseph's College Pilathara" },
    { id: 8, name: 'Payyanur College (Chemistry Research Centre)', code: 'PAY-CHEM', department_id: 1, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['payyanur.head@kannur.ac.in'], college_name: 'Payyanur College' },
    { id: 9, name: 'Sir Syed College, Taliparamba (Chemistry Centre)', code: 'SSC-CHEM', department_id: 1, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['sirsyed.head@kannur.ac.in'], college_name: 'Sir Syed College, Taliparamba' },

    // Physics (dept 2)
    { id: 4, name: 'Department of Physics (University Campus)', code: 'PHYS-UNI', department_id: 2, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Main Campus' },
    { id: 5, name: 'Payyanur College (Physics Research Centre)', code: 'PAY-PHYS', department_id: 2, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['payyanur.head@kannur.ac.in'], college_name: 'Payyanur College' },
    { id: 10, name: 'Govt. Brennen College, Thalassery (Physics Centre)', code: 'GBC-PHYS', department_id: 2, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 11, name: 'Nehru Arts & Science College, Kanhangad (Physics Centre)', code: 'NAS-PHYS', department_id: 2, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['nehru.head@kannur.ac.in'], college_name: 'Nehru Arts & Science College, Kanhangad' },

    // History (dept 3)
    { id: 6, name: 'Department of History (University Campus)', code: 'HIST-UNI', department_id: 3, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Main Campus' },
    { id: 7, name: 'Nehru Arts & Science College Kanhangad (History Centre)', code: 'NAS-HIST', department_id: 3, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['nehru.head@kannur.ac.in'], college_name: 'Nehru Arts & Science College, Kanhangad' },
    { id: 12, name: 'Govt. Brennen College, Thalassery (History Centre)', code: 'GBC-HIST', department_id: 3, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },

    // Computer Science (dept 4)
    { id: 13, name: 'Department of Computer Science (Mangattuparamba Campus)', code: 'CS-UNI', department_id: 4, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Mangattuparamba Campus' },
    { id: 14, name: 'Govt. Brennen College, Thalassery (Computer Science Centre)', code: 'GBC-CS', department_id: 4, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 15, name: 'Sir Syed College, Taliparamba (Computer Science Centre)', code: 'SSC-CS', department_id: 4, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['sirsyed.head@kannur.ac.in'], college_name: 'Sir Syed College, Taliparamba' },

    // Mathematical Sciences (dept 5)
    { id: 16, name: 'Department of Mathematical Sciences (Mangattuparamba Campus)', code: 'MATH-UNI', department_id: 5, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Mangattuparamba Campus' },
    { id: 17, name: 'Govt. Brennen College, Thalassery (Mathematics Centre)', code: 'GBC-MATH', department_id: 5, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 18, name: 'Nirmalagiri College, Kuthuparamba (Mathematics Centre)', code: 'NMC-MATH', department_id: 5, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['nirmalagiri.head@kannur.ac.in'], college_name: 'Nirmalagiri College, Kuthuparamba' },
    { id: 19, name: 'Payyanur College (Mathematics Centre)', code: 'PAY-MATH', department_id: 5, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['payyanur.head@kannur.ac.in'], college_name: 'Payyanur College' },

    // Biotechnology & Microbiology (dept 6)
    { id: 20, name: 'Department of Biotechnology & Microbiology (Palayad Campus)', code: 'BIOTECH-UNI', department_id: 6, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Palayad Campus, Thalassery' },
    { id: 21, name: 'Mary Matha Arts & Science College, Mananthavady (Biotechnology Centre)', code: 'MMA-BIOTECH', department_id: 6, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['marymatha.head@kannur.ac.in'], college_name: 'Mary Matha Arts & Science College, Mananthavady' },

    // Environmental Studies (dept 7)
    { id: 22, name: 'Department of Environmental Studies (Mangattuparamba Campus)', code: 'ENV-UNI', department_id: 7, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Mangattuparamba Campus' },

    // Studies in English (dept 8)
    { id: 23, name: 'Department of Studies in English (Palayad Campus)', code: 'ENG-UNI', department_id: 8, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Palayad Campus, Thalassery' },
    { id: 24, name: 'Govt. Brennen College, Thalassery (English Research Centre)', code: 'GBC-ENG', department_id: 8, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 25, name: 'Payyanur College (English Research Centre)', code: 'PAY-ENG', department_id: 8, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['payyanur.head@kannur.ac.in'], college_name: 'Payyanur College' },

    // Management Studies (dept 9)
    { id: 26, name: 'Department of Management Studies (Palayad Campus)', code: 'MGMT-UNI', department_id: 9, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Palayad Campus, Thalassery' },

    // Applied Economics (dept 10)
    { id: 27, name: 'Department of Applied Economics (Palayad Campus)', code: 'ECON-UNI', department_id: 10, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Palayad Campus, Thalassery' },
    { id: 28, name: 'Govt. Brennen College, Thalassery (Economics Centre)', code: 'GBC-ECON', department_id: 10, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 29, name: 'Govt. College Kasaragod (Economics Centre)', code: 'GCK-ECON', department_id: 10, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: 3, college_name: 'Govt. College Kasaragod' },

    // Malayalam (dept 11)
    { id: 30, name: 'Department of Malayalam (Palayad Campus)', code: 'MAL-UNI', department_id: 11, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Palayad Campus, Thalassery' },
    { id: 31, name: 'Govt. Brennen College, Thalassery (Malayalam Centre)', code: 'GBC-MAL', department_id: 11, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },

    // Zoology (dept 12)
    { id: 32, name: 'Department of Zoology (Mananthavady Campus)', code: 'ZOOL-UNI', department_id: 12, institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT, centre_head_user_id: null, college_name: 'Kannur University Mananthavady Campus' },
    { id: 33, name: 'Govt. Brennen College, Thalassery (Zoology Centre)', code: 'GBC-ZOOL', department_id: 12, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },

    // Commerce (dept 13)
    { id: 34, name: 'Govt. Brennen College, Thalassery (Commerce Centre)', code: 'GBC-COMM', department_id: 13, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['brennen.head@kannur.ac.in'], college_name: 'Govt. Brennen College, Thalassery' },
    { id: 35, name: 'Payyanur College (Commerce Centre)', code: 'PAY-COMM', department_id: 13, institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE, centre_head_user_id: headUsersMap['payyanur.head@kannur.ac.in'], college_name: 'Payyanur College' },
  ];

  for (const c of centresData) {
    const existing = await ResearchCentre.findByPk(c.id);
    if (!existing) {
      await ResearchCentre.create({ ...c, is_active: true });
    } else {
      await existing.update({
        name: c.name,
        code: c.code,
        department_id: c.department_id,
        institution_type: c.institution_type,
        centre_head_user_id: c.centre_head_user_id,
        college_name: c.college_name,
        is_active: true,
      });
    }
  }

  // 7. Faculty / Approved Guides Across All Disciplines
  console.log('Seeding Approved Research Guides...');
  const facultyGuidesData = [
    // Chemistry
    {
      email: 'raman.chem@kannur.ac.in',
      name: 'Dr. K. Raman',
      phone: '+91 94471 10001',
      deptId: 1,
      centreId: 1,
      desigId: 3, // Professor
      maxScholars: 8,
      bio: 'Professor of Physical & Materials Chemistry with 22 years of doctoral guidance.',
      specializations: ['Nanochemistry & Advanced Catalysis', 'Surface Chemistry', 'Polymer Nanocomposites'],
      qualifications: [{ degree: 'Ph.D. in Chemistry', institution: 'IIT Madras', year: '2001' }],
    },
    {
      email: 'preetha.chem@kannur.ac.in',
      name: 'Dr. Preetha K. Nair',
      phone: '+91 94471 10002',
      deptId: 1,
      centreId: 8,
      desigId: 2, // Associate Professor
      maxScholars: 6,
      bio: 'Associate Professor specializing in bio-inorganic synthesis and green chemical processes.',
      specializations: ['Coordination Chemistry', 'Green Chemical Synthesis', 'Bioinorganic Materials'],
      qualifications: [{ degree: 'Ph.D. in Chemistry', institution: 'University of Calicut', year: '2009' }],
    },
    {
      email: 'rafeeq.chem@kannur.ac.in',
      name: 'Dr. Mohammed Rafeeq',
      phone: '+91 94471 10003',
      deptId: 1,
      centreId: 9,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor focusing on computational quantum chemistry and heterocyclic ligands.',
      specializations: ['Computational Chemistry', 'Synthetic Heterocycles', 'Electrochemical Sensors'],
      qualifications: [{ degree: 'Ph.D. in Chemistry', institution: 'CUSAT', year: '2011' }],
    },

    // Physics
    {
      email: 'madhavan.phys@kannur.ac.in',
      name: 'Dr. A. P. Madhavan',
      phone: '+91 94471 10004',
      deptId: 2,
      centreId: 4,
      desigId: 3,
      maxScholars: 8,
      bio: 'Professor of Condensed Matter Physics, specializing in spintronic devices and multiferroics.',
      specializations: ['Condensed Matter Physics', 'Spintronics', 'Thin Film Semiconductor Devices'],
      qualifications: [{ degree: 'Ph.D. in Physics', institution: 'IISc Bangalore', year: '2003' }],
    },
    {
      email: 'manoj.phys@kannur.ac.in',
      name: 'Dr. Manoj Kumar V.',
      phone: '+91 94471 10005',
      deptId: 2,
      centreId: 5,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor with extensive research in nonlinear optics, photonics and laser spectroscopy.',
      specializations: ['Nonlinear Optics', 'Laser Spectroscopy', 'Photonic Crystals'],
      qualifications: [{ degree: 'Ph.D. in Physics', institution: 'University of Kerala', year: '2008' }],
    },
    {
      email: 'sunitha.phys@kannur.ac.in',
      name: 'Dr. Sunitha P.',
      phone: '+91 94471 10006',
      deptId: 2,
      centreId: 10,
      desigId: 1, // Assistant Professor
      maxScholars: 4,
      bio: 'Assistant Professor investigating nuclear physics and astrophysical radiative modeling.',
      specializations: ['Nuclear Structure Physics', 'Astrophysical Modeling', 'Radiation Detection'],
      qualifications: [{ degree: 'Ph.D. in Physics', institution: 'Kannur University', year: '2016' }],
    },

    // History
    {
      email: 'balakrishnan.hist@kannur.ac.in',
      name: 'Dr. C. Balakrishnan',
      phone: '+91 94471 10007',
      deptId: 3,
      centreId: 6,
      desigId: 3,
      maxScholars: 8,
      bio: 'Senior Professor of Regional and Colonial History of the Malabar and Canara coasts.',
      specializations: ['Malabar Agrarian History', 'Colonial Governance', 'Archival Historiography'],
      qualifications: [{ degree: 'Ph.D. in History', institution: 'Jawaharlal Nehru University (JNU)', year: '1998' }],
    },
    {
      email: 'mini.hist@kannur.ac.in',
      name: 'Dr. Mini Joseph',
      phone: '+91 94471 10008',
      deptId: 3,
      centreId: 7,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor specializing in medieval Kerala epigraphy and Indian Ocean trade routes.',
      specializations: ['Medieval Epigraphy', 'Indian Ocean Trade History', 'Temple Architecture & Inscriptions'],
      qualifications: [{ degree: 'Ph.D. in History', institution: 'University of Calicut', year: '2007' }],
    },

    // Computer Science
    {
      email: 'suresh.cs@kannur.ac.in',
      name: 'Dr. R. K. Suresh',
      phone: '+91 94471 10009',
      deptId: 4,
      centreId: 13,
      desigId: 3,
      maxScholars: 8,
      bio: 'Professor of Computer Science & Information Technology; leader in AI and Computer Vision.',
      specializations: ['Artificial Intelligence', 'Deep Learning for Medical Imaging', 'Computer Vision'],
      qualifications: [{ degree: 'Ph.D. in Computer Science', institution: 'NIT Calicut', year: '2006' }],
    },
    {
      email: 'priya.cs@kannur.ac.in',
      name: 'Dr. Priya Namboodiri',
      phone: '+91 94471 10010',
      deptId: 4,
      centreId: 14,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor working on modern cryptographic protocols, zero-knowledge proofs and blockchain.',
      specializations: ['Applied Cryptography', 'Distributed Systems Security', 'Blockchain Architectures'],
      qualifications: [{ degree: 'Ph.D. in Computer Engineering', institution: 'CUSAT', year: '2012' }],
    },
    {
      email: 'latheef.cs@kannur.ac.in',
      name: 'Dr. Abdul Latheef',
      phone: '+91 94471 10011',
      deptId: 4,
      centreId: 15,
      desigId: 1,
      maxScholars: 4,
      bio: 'Assistant Professor specializing in Malayalam NLP, computational linguistics and knowledge graphs.',
      specializations: ['Natural Language Processing', 'Malayalam Computational Linguistics', 'Semantic Knowledge Graphs'],
      qualifications: [{ degree: 'Ph.D. in Computer Science', institution: 'Kannur University', year: '2018' }],
    },

    // Mathematical Sciences
    {
      email: 'narayanan.math@kannur.ac.in',
      name: 'Dr. K. Narayanan',
      phone: '+91 94471 10012',
      deptId: 5,
      centreId: 16,
      desigId: 3,
      maxScholars: 8,
      bio: 'Professor of Pure Mathematics with research in operator theory, Banach spaces and wavelets.',
      specializations: ['Functional Analysis', 'Operator Theory', 'Wavelet Analysis & Transforms'],
      qualifications: [{ degree: 'Ph.D. in Mathematics', institution: 'University of Madras', year: '2000' }],
    },
    {
      email: 'mary.math@kannur.ac.in',
      name: 'Dr. Mary Varghese',
      phone: '+91 94471 10013',
      deptId: 5,
      centreId: 17,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor focusing on graph theory, algebraic connectivity and combinatorial optimization.',
      specializations: ['Spectral Graph Theory', 'Combinatorics', 'Mathematical Cryptology'],
      qualifications: [{ degree: 'Ph.D. in Mathematics', institution: 'University of Kerala', year: '2010' }],
    },
    {
      email: 'sudheesh.math@kannur.ac.in',
      name: 'Dr. Sudheesh Kumar',
      phone: '+91 94471 10014',
      deptId: 5,
      centreId: 18,
      desigId: 1,
      maxScholars: 4,
      bio: 'Assistant Professor with research interests in fluid dynamics, PDE modeling and numerical schemes.',
      specializations: ['Fluid Dynamics', 'Differential Equations', 'Numerical Computational Methods'],
      qualifications: [{ degree: 'Ph.D. in Mathematics', institution: 'NIT Karnataka, Surathkal', year: '2017' }],
    },

    // Biotechnology & Microbiology
    {
      email: 'haridas.biotech@kannur.ac.in',
      name: 'Dr. M. Haridas',
      phone: '+91 94471 10015',
      deptId: 6,
      centreId: 20,
      desigId: 3,
      maxScholars: 8,
      bio: 'Eminent Professor in biophysics, structural biology, and antimicrobial drug target design.',
      specializations: ['Structural Biology & Crystallography', 'Protein Chemistry', 'Drug Discovery & Target Design'],
      qualifications: [{ degree: 'Ph.D. in Biophysics', institution: 'AIIMS New Delhi', year: '1995' }],
    },
    {
      email: 'shilpa.biotech@kannur.ac.in',
      name: 'Dr. Shilpa Gangadharan',
      phone: '+91 94471 10016',
      deptId: 6,
      centreId: 20,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor investigating microbial enzymes, industrial bioprocesses and bioremediation.',
      specializations: ['Microbial Ecology', 'Metagenomics', 'Industrial Bioprocess Technology'],
      qualifications: [{ degree: 'Ph.D. in Biotechnology', institution: 'CUSAT', year: '2008' }],
    },
    {
      email: 'george.biotech@kannur.ac.in',
      name: 'Dr. George Thomas',
      phone: '+91 94471 10017',
      deptId: 6,
      centreId: 21,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor working on endemic flora of Wayanad, plant tissue culture and secondary metabolites.',
      specializations: ['Plant Biotechnology', 'Secondary Metabolite Biosynthesis', 'Conservation Genetics'],
      qualifications: [{ degree: 'Ph.D. in Biotechnology', institution: 'Rajiv Gandhi Centre for Biotechnology (RGCB)', year: '2011' }],
    },

    // Environmental Studies
    {
      email: 'vineeth.env@kannur.ac.in',
      name: 'Dr. B. S. Vineeth',
      phone: '+91 94471 10018',
      deptId: 7,
      centreId: 22,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor researching forest hydrology, microclimatic modeling and Western Ghats conservation.',
      specializations: ['Western Ghats Biodiversity', 'Landscape Ecology', 'Climate Impact Modeling'],
      qualifications: [{ degree: 'Ph.D. in Environmental Science', institution: 'FRI Dehradun', year: '2007' }],
    },

    // Studies in English
    {
      email: 'geetha.eng@kannur.ac.in',
      name: 'Dr. Geetha K.',
      phone: '+91 94471 10019',
      deptId: 8,
      centreId: 23,
      desigId: 3,
      maxScholars: 8,
      bio: 'Professor of English specializing in postcolonial theory, Dalit literature, and gender poetics.',
      specializations: ['Postcolonial Literature', 'Subaltern Studies & Gender Theory', 'Comparative Poetics'],
      qualifications: [{ degree: 'Ph.D. in English', institution: 'EFL University Hyderabad', year: '2002' }],
    },
    {
      email: 'thomas.eng@kannur.ac.in',
      name: 'Dr. Thomas Mathew',
      phone: '+91 94471 10020',
      deptId: 8,
      centreId: 24,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor researching semiotics, film studies, and contemporary cultural theory.',
      specializations: ['Cultural Studies', 'Film and Media Semiotics', 'Modern Literary Hermeneutics'],
      qualifications: [{ degree: 'Ph.D. in English', institution: 'University of Calicut', year: '2010' }],
    },

    // Management Studies
    {
      email: 'faisal.mgmt@kannur.ac.in',
      name: 'Dr. K. P. Faisal',
      phone: '+91 94471 10021',
      deptId: 9,
      centreId: 26,
      desigId: 3,
      maxScholars: 8,
      bio: 'Professor in Strategic Management, Behavioral Corporate Governance and Supply Chain Resilience.',
      specializations: ['Strategic Financial Management', 'Behavioral Economics & Governance', 'Supply Chain Analytics'],
      qualifications: [{ degree: 'Ph.D. in Management Studies', institution: 'IIM Kozhikode', year: '2005' }],
    },

    // Applied Economics
    {
      email: 'raveendran.econ@kannur.ac.in',
      name: 'Dr. P. T. Raveendran',
      phone: '+91 94471 10022',
      deptId: 10,
      centreId: 27,
      desigId: 3,
      maxScholars: 8,
      bio: 'Senior Professor of Economics with extensive publications in public finance and agrarian economics.',
      specializations: ['Applied Econometrics', 'Public Finance & Fiscal Decentralization', 'Agrarian Economics of Kerala'],
      qualifications: [{ degree: 'Ph.D. in Economics', institution: 'CDS Trivandrum / JNU', year: '1999' }],
    },

    // Malayalam
    {
      email: 'sukumaran.mal@kannur.ac.in',
      name: 'Dr. M. Sukumaran',
      phone: '+91 94471 10023',
      deptId: 11,
      centreId: 30,
      desigId: 3,
      maxScholars: 8,
      bio: 'Distinguished Professor of Malayalam literature, folklore, and Dravidian historical linguistics.',
      specializations: ['Modern Malayalam Poetry', 'Theyyam & North Malabar Folklore', 'Comparative Dravidian Linguistics'],
      qualifications: [{ degree: 'Ph.D. in Malayalam', institution: 'University of Kerala', year: '2001' }],
    },

    // Zoology
    {
      email: 'prakash.zool@kannur.ac.in',
      name: 'Dr. T. P. Prakash',
      phone: '+91 94471 10024',
      deptId: 12,
      centreId: 32,
      desigId: 2,
      maxScholars: 6,
      bio: 'Associate Professor investigating entomological ecology, vector biology, and freshwater ecosystems.',
      specializations: ['Entomology & Vector Biology', 'Aquatic Bioindicators', 'Wildlife Conservation Biology'],
      qualifications: [{ degree: 'Ph.D. in Zoology', institution: 'University of Calicut', year: '2009' }],
    },
  ];

  for (const fg of facultyGuidesData) {
    let u = await User.findOne({ where: { email: fg.email } });
    if (!u) {
      u = await User.create({
        email: fg.email,
        password_hash: defaultPasswordHash,
        full_name: fg.name,
        phone: fg.phone,
        status: 'ACTIVE',
        department_id: fg.deptId,
        research_centre_id: fg.centreId,
      });
    } else {
      await u.update({
        full_name: fg.name,
        department_id: fg.deptId,
        research_centre_id: fg.centreId,
      });
    }

    if (guideRole) {
      await u.addRole(guideRole);
    }

    let g = await Guide.findOne({ where: { user_id: u.id } });
    if (!g) {
      g = await Guide.create({
        user_id: u.id,
        designation_id: fg.desigId,
        department_id: fg.deptId,
        research_centre_id: fg.centreId,
        registration_status: 'APPROVED',
        approved_at: new Date('2024-01-15'),
        valid_till: new Date('2030-12-31'),
        max_scholars: fg.maxScholars,
        bio: fg.bio,
      });
    } else {
      await g.update({
        designation_id: fg.desigId,
        department_id: fg.deptId,
        research_centre_id: fg.centreId,
        registration_status: 'APPROVED',
        max_scholars: fg.maxScholars,
        bio: fg.bio,
      });
    }

    // Specializations
    await GuideSpecialization.destroy({ where: { guide_id: g.id } });
    for (const spec of fg.specializations) {
      await GuideSpecialization.create({
        guide_id: g.id,
        area: spec,
      });
    }

    // Qualifications
    await GuideQualification.destroy({ where: { guide_id: g.id } });
    for (const q of fg.qualifications) {
      await GuideQualification.create({
        guide_id: g.id,
        degree: q.degree,
        institution: q.institution,
        year: q.year,
      });
    }
  }

  console.log('--- Successfully completed Registration Master Data Seeding! ---');
}

seedRegistrationData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error during seeding:', err);
    process.exit(1);
  });
