-- ============================================================
--  SEED_TEAM.sql  — Reset team table with 40 random members
--  Run in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns (safe — IF NOT EXISTS)
ALTER TABLE team ADD COLUMN IF NOT EXISTS reg_no      text;
ALTER TABLE team ADD COLUMN IF NOT EXISTS points      integer;
ALTER TABLE team ADD COLUMN IF NOT EXISTS avatar_url  text;
ALTER TABLE team ALTER COLUMN contributions SET DEFAULT '[]'::jsonb;

-- 2. Wipe existing data
TRUNCATE TABLE team RESTART IDENTITY CASCADE;

-- 3. Insert 40 random members
--    Departments: Social | Content | Events | Marketing | Research
--    Contributions: array of {description, points} objects
INSERT INTO team (name, dept, reg_no, points, avatar_url, contributions) VALUES

('Aarav Sharma',      'Social',    '23BCE1001', 92,  NULL, '[{"description":"Designed poster series for Pi Day","points":25},{"description":"Managed Instagram story highlights","points":20},{"description":"Created Canva templates for weekly posts","points":15},{"description":"Took event photographs","points":12},{"description":"Illustrated the Math Olympiad banner","points":20}]'),
('Priya Nair',        'Content',   '23BCE1002', 88,  NULL, '[{"description":"Wrote newsletter covering Fibonacci Day","points":22},{"description":"Drafted press release for annual fest","points":18},{"description":"Curated math fun-facts thread on LinkedIn","points":14},{"description":"Edited and proofread event blog post","points":16},{"description":"Interviewed faculty for spotlight article","points":18}]'),
('Karan Mehta',       'Events',    '23BCE1003', 75,  NULL, '[{"description":"Organised logistics for Math Quiz Night","points":30},{"description":"Coordinated volunteer roster","points":20},{"description":"Sourced venue for the symposium","points":25}]'),
('Sneha Iyer',        'Marketing', '23BCE1004', 80,  NULL, '[{"description":"Ran awareness campaign on campus notice boards","points":25},{"description":"Negotiated sponsorship with two companies","points":30},{"description":"Sent outreach emails to 200 alumni","points":25}]'),
('Rohit Verma',       'Research',  '23BCE1005', 95,  NULL, '[{"description":"Published internal paper on Goldbach conjecture","points":40},{"description":"Presented at inter-college research symposium","points":30},{"description":"Reviewed 5 peer submissions","points":25}]'),
('Ananya Pillai',     'Social',    '23BCE1006', 70,  NULL, '[{"description":"Created reel series on famous mathematicians","points":22},{"description":"Designed club merchandise mockups","points":18},{"description":"Built Figma prototype for new website","points":30}]'),
('Vivek Rajagopalan', 'Content',   '23BCE1007', 65,  NULL, '[{"description":"Wrote article about cryptography basics","points":20},{"description":"Edited video script for YouTube upload","points":15},{"description":"Maintained content calendar","points":15},{"description":"Researched trending math topics monthly","points":15}]'),
('Pooja Murugan',     'Events',    '23BCE1008', 83,  NULL, '[{"description":"Planned and executed Math Carnival","points":35},{"description":"Handled registrations for hackathon","points":20},{"description":"Liaised with canteen for event catering","points":10},{"description":"Designed schedule booklet","points":18}]'),
('Arjun Krishnan',    'Marketing', '23BCE1009', 77,  NULL, '[{"description":"Managed Google Ads for club events","points":28},{"description":"Grew LinkedIn following by 40%","points":25},{"description":"Coordinated with college PR team","points":24}]'),
('Divya Subramaniam', 'Research',  '23BCE1010', 90,  NULL, '[{"description":"Conducted study on prime distribution patterns","points":38},{"description":"Prepared reading list for juniors","points":15},{"description":"Organised weekly problem-solving sessions","points":22},{"description":"Submitted abstract to national conference","points":15}]'),

('Nikhil Bose',       'Social',    '23BCE1011', 60,  NULL, '[{"description":"Created whatsapp sticker pack for club","points":18},{"description":"Photographed workshop sessions","points":20},{"description":"Updated club profile pictures across platforms","points":22}]'),
('Meera Venkatesh',   'Content',   '23BCE1012', 72,  NULL, '[{"description":"Blogged about Math in everyday life series","points":24},{"description":"Wrote detailed event recap articles","points":18},{"description":"Built FAQ document for new members","points":15},{"description":"Translated content to Tamil for wider reach","points":15}]'),
('Akash Gupta',       'Events',    '23BCE1013', 68,  NULL, '[{"description":"Assisted in online quiz event setup","points":20},{"description":"Compiled participant feedback forms","points":15},{"description":"Prepared certificate templates","points":15},{"description":"Coordinated guest speaker schedules","points":18}]'),
('Latha Chandrasekaran','Marketing','23BCE1014', 85, NULL, '[{"description":"Pitched integration of Math Club into orientation week","points":30},{"description":"Designed promotional banners","points":20},{"description":"Tracked social media analytics weekly","points":20},{"description":"Created club explainer video script","points":15}]'),
('Siddharth Joshi',   'Research',  '23BCE1015', 78,  NULL, '[{"description":"Compiled list of unsolved problems for study group","points":25},{"description":"Ran bi-weekly proof challenge","points":28},{"description":"Contributed to club newsletter math column","points":25}]'),
('Kavya Reddy',       'Social',    '23BCE1016', 55,  NULL, '[{"description":"Managed Facebook page content","points":18},{"description":"Designed event invitation cards","points":20},{"description":"Created short-form video content","points":17}]'),
('Harish Narayanan',  'Content',   '23BCE1017', 63,  NULL, '[{"description":"Wrote profile pieces on alumni in math careers","points":22},{"description":"Edited podcast transcript","points":18},{"description":"Maintained club Wikipedia draft","points":23}]'),
('Riya Choudhary',    'Events',    '23BCE1018', 74,  NULL, '[{"description":"Organised speed-math competition","points":28},{"description":"Managed event day OD letters","points":18},{"description":"Recruited 30 volunteers","points":28}]'),
('Tejas Patel',       'Marketing', '23BCE1019', 89,  NULL, '[{"description":"Cold-emailed 15 companies for club sponsorship","points":30},{"description":"Secured two sponsors for annual fest","points":35},{"description":"Set up affiliate promo for merchandise","points":24}]'),
('Aishwarya Menon',   'Research',  '23BCE1020', 82,  NULL, '[{"description":"Explored applications of graph theory in networks","points":32},{"description":"Presented seminar to 60 students","points":28},{"description":"Curated resource library for members","points":22}]'),

('Pranav Suresh',     'Social',    '23BCE1021', 57,  NULL, '[{"description":"Shot and edited club highlights reel","points":25},{"description":"Designed custom icons for website","points":18},{"description":"Maintained a photo archive","points":14}]'),
('Deepa Balakrishnan','Content',   '23BCE1022', 69,  NULL, '[{"description":"Wrote monthly column in college magazine","points":24},{"description":"Uploaded videos to YouTube channel","points":20},{"description":"Created caption templates for posts","points":25}]'),
('Saurav Dey',        'Events',    '23BCE1023', 80,  NULL, '[{"description":"Conducted Pi Day celebration event","points":30},{"description":"Arranged technical equipment for presentations","points":20},{"description":"Drafted event proposals for 3 workshops","points":30}]'),
('Nithya Arunachalam','Marketing', '23BCE1024', 71,  NULL, '[{"description":"Printed and distributed club flyers","points":18},{"description":"Set up merch stall on college day","points":22},{"description":"Managed Instagram DMs for inquiries","points":18},{"description":"Tracked conversion from promotions","points":13}]'),
('Varun Ramachandran','Research',  '23BCE1025', 94,  NULL, '[{"description":"Studied Fourier analysis and gave club lecture","points":35},{"description":"Mentored 4 juniors for math olympiad","points":30},{"description":"Submitted paper to inter-college journal","points":29}]'),
('Swathi Gopal',      'Social',    '23BCE1026', 66,  NULL, '[{"description":"Redesigned club logo","points":28},{"description":"Created animated banner for events page","points":22},{"description":"Managed Twitter/X account for a semester","points":16}]'),
('Chirag Shah',       'Content',   '23BCE1027', 74,  NULL, '[{"description":"Produced a short documentary on Math Club history","points":30},{"description":"Wrote script and voiceover","points":24},{"description":"Formatted the annual report PDF","points":20}]'),
('Anjali Thomas',     'Events',    '23BCE1028', 69,  NULL, '[{"description":"Co-organised inter-club debate on Maths vs CS","points":25},{"description":"Designed event schedule placard","points":18},{"description":"Sent reminder communications to participants","points":26}]'),
('Madhavan Pillai',   'Marketing', '23BCE1029', 58,  NULL, '[{"description":"Contributed to semester marketing strategy doc","points":20},{"description":"Ran campus survey on math interest","points":20},{"description":"Designed one-page club brochure","points":18}]'),
('Roshni Krishnaswamy','Research', '23BCE1030', 87,  NULL, '[{"description":"Led reading group on number theory","points":30},{"description":"Organised mock olympiad with 50 participants","points":32},{"description":"Published blog post on p vs np for club","points":25}]'),

('Aryan Dubey',       'Social',    '23BCE1031', 52,  NULL, '[{"description":"Managed WhatsApp broadcast group","points":15},{"description":"Took photos for alumni meet","points":18},{"description":"Created month-end stats infographic","points":19}]'),
('Keerthi Sundar',    'Content',   '23BCE1032', 61,  NULL, '[{"description":"Wrote listicles on careers in mathematics","points":20},{"description":"Handled club email newsletter subscription","points":15},{"description":"Contributed to 3 collaborative articles","points":26}]'),
('Naveen Kumar',      'Events',    '23BCE1033', 78,  NULL, '[{"description":"Executed end-of-year award ceremony","points":30},{"description":"Set up and managed registration portal","points":25},{"description":"Coordinated with sponsors on event day","points":23}]'),
('Pallavi Seshadri',  'Marketing', '23BCE1034', 76,  NULL, '[{"description":"Liaised with student media for coverage","points":28},{"description":"Designed posters for external competitions","points":22},{"description":"Maintained club merch inventory","points":26}]'),
('Vignesh Raghavan',  'Research',  '23BCE1035', 91,  NULL, '[{"description":"Delivered guest talk on chaos theory","points":35},{"description":"Organised 3 problem sessions for club members","points":28},{"description":"Submitted abstract to NCMTA conference","points":28}]'),
('Shruti Balaji',     'Social',    '23BCE1036', 64,  NULL, '[{"description":"Led photoshoot for club team page","points":22},{"description":"Built colour-palette guide for club brand","points":20},{"description":"Illustrated diagrams for newsletters","points":22}]'),
('Ritesh Nambiar',    'Content',   '23BCE1037', 70,  NULL, '[{"description":"Wrote beginner guide to topology","points":25},{"description":"Managed submissions for club zine","points":22},{"description":"Transcribed recorded lectures","points":23}]'),
('Gayathri Iyer',     'Events',    '23BCE1038', 85,  NULL, '[{"description":"Spearheaded talent hunt focused on math puzzles","points":35},{"description":"Built event feedback system using Google Forms","points":22},{"description":"Prepared post-event analysis report","points":28}]'),
('Samir Bhatt',       'Marketing', '23BCE1039', 67,  NULL, '[{"description":"Ran referral campaign for club membership","points":24},{"description":"Designed email header graphics","points":18},{"description":"Analysed reach metrics each month","points":25}]'),
('Lakshmi Priya',     'Research',  '23BCE1040', 88,  NULL, '[{"description":"Built a math quiz bot for Discord","points":36},{"description":"Ran weekly proof of the week challenge","points":28},{"description":"Wrote tutorial on LaTeX for beginners","points":24}]');

-- Verify
SELECT dept, COUNT(*) AS members, ROUND(AVG(points)) AS avg_pts
FROM team
GROUP BY dept
ORDER BY dept;