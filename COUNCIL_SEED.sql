-- Council seed data
-- Paste into Supabase SQL Editor and run

-- Clear existing rows first (optional – comment out if you want to keep existing data)
-- DELETE FROM public.council;

INSERT INTO public.council (name, role, photo, bio, linkedin, github, instagram, sort_order) VALUES
(
  'Harini S',
  'President',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948100/harini_vyw8mk.jpg',
  'Adding value, Subtracting doubts, Multiplying ideas, Dividing tasks.',
  '', '', '', 1
),
(
  'Gowshick S',
  'Vice President',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948101/gowshick_lqvrcf.png',
  'Proofs are cool, but have you questioned the axioms?',
  '', '', '', 2
),
(
  'Shreyavarshini Subramanian',
  'General Secretary',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948470/shreya_na7ya9.jpg',
  'In the world of opinions we deal in theorems.',
  '', '', '', 3
),
(
  'Menmangai M',
  'Technical Lead',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948099/mangai_mfejr3.jpg',
  'What I love about math is its certainty. Every problem has a unique path to the solution.',
  '', '', '', 4
),
(
  'Priyanka Kaliraj',
  'Content Lead',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948097/priyanka_mk7jnf.jpg',
  'My sleep schedule is just an unsolvable equation powered by espresso.',
  '', '', '', 5
),
(
  'Arkita Barua',
  'Social Media Lead',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948100/arkita_t9qxol.jpg',
  'You call it overthinking, I call it analyzing the full solution space.',
  '', '', '', 6
),
(
  'Dheer Saruparia',
  'Treasurer',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948100/dheer_iyfhgi.jpg',
  'Balancing equations and budgets because precision isn''t just math its leadership.',
  '', '', '', 7
),
(
  'Rishabh Jain',
  'Event Management Lead',
  'https://res.cloudinary.com/degzlfwcu/image/upload/v1762948100/rjain_ievb7k.jpg',
  'Driven by logic. United by purpose.',
  '', '', '', 8
),
(
  'Ritvik Anish',
  'Marketing Lead',
  '/council/placeholder.jpg',
  'Plotting points, building purpose — that''s our graph to growth.',
  '', '', '', 9
);
