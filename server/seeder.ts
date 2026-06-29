/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase.js';
import { db, hashPassword } from './db.js';

// ============================================================================
// REALISTIC USER PERSONAS
// ============================================================================

const PERSONAS = {
  developer: {
    titles: ['Frontend Engineer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Mobile Developer', 'Site Reliability Engineer', 'Security Engineer', 'Data Engineer', 'Cloud Architect', 'AI Researcher'],
    bios: [
      'Building things that scale. Currently exploring distributed systems and real-time architectures.',
      'TypeScript enthusiast. React ecosystem contributor. Passionate about clean code and developer experience.',
      'Former game dev turned fintech engineer. Building payment systems at scale.',
      'Open source contributor. Maintainer of 3 popular npm packages. Coffee > sleep.',
      'Working on infrastructure at a startup. Kubernetes, Docker, and chaos engineering.',
      'Self-taught developer. Bootstrapped my first SaaS to $10k MRR. Now building tools for indie hackers.',
      'Rustacean at heart. Building high-performance web services and systems.',
      'Full-stack engineer with a love for beautiful UI. React, Next.js, and Tailwind CSS.',
      'Python-first developer. Data pipelines, ML pipelines, and automation. Building in public.',
      'Mobile dev obsessed with performance. Flutter, React Native, and native iOS.',
      'Former physics PhD turned software engineer. Applying mathematical rigor to code.',
      'JavaScript veteran since 2009. Building developer tools and browser extensions.',
      'Infrastructure engineer at a cloud company. Terraform, Pulumi, and the art of reliable systems.',
      'Platform engineer building internal tools. Making other developers more productive.',
      'WebAssembly enthusiast. Bringing high-performance computing to the browser.',
      'GraphQL architect. API design, schema stitching, and developer experience.',
    ],
    interests: ['open source', 'distributed systems', 'web development', 'AI', 'cloud computing', 'developer tools', 'performance engineering', 'systems design', 'cybersecurity', 'blockchain'],
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
    ],
  },
  designer: {
    titles: ['Product Designer', 'UI Designer', 'UX Researcher', 'Brand Designer', 'Motion Designer', 'Design Systems Lead', 'Visual Designer', 'Art Director', 'Creative Technologist', 'Design Manager'],
    bios: [
      'Design systems architect. Building cohesive, scalable design languages. Color obsessed.',
      'Product designer at a fast-growing startup. Figma is my home.',
      'Bridging design and code. React + Tailwind designer who prototypes in production.',
      'Typography nerd. Crafting reading experiences that people actually enjoy.',
      'Illustrator turned product designer. Bringing warmth and storytelling into software.',
      'Designing for accessibility. WCAG compliance is not optional.',
      'Former architect turned digital product designer. Spatial thinking meets interfaces.',
      'Motion design enthusiast. Every micro-interaction should tell a story.',
      'Brand designer working with startups. Helping early-stage companies find their visual voice.',
      'UX researcher with an anthropology background. Understanding people before designing for them.',
      'Design systems specialist. Scaling design across 200+ engineers.',
      'Creative technologist. Where design, code, and art converge.',
      'Digital product designer obsessed with craft. Every pixel matters.',
      'Design lead at a social platform. Shaping how people connect visually.',
      'Experiential designer. Physical and digital installations.',
    ],
    interests: ['design systems', 'typography', 'user experience', 'motion design', 'brand identity', 'design thinking', 'accessibility', 'illustration', 'creative coding', 'color theory'],
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    ],
  },
  photographer: {
    titles: ['Street Photographer', 'Landscape Photographer', 'Portrait Photographer', 'Wildlife Photographer', 'Travel Photographer', 'Food Photographer', 'Documentary Photographer', 'Fine Art Photographer', 'Fashion Photographer', 'Drone Photographer'],
    bios: [
      'Chasing light in the mountains. 6am golden hour is non-negotiable.',
      'Street photographer based in Tokyo. Documenting everyday moments with intention.',
      'Fashion and portrait photography. Capturing stories in a single frame.',
      'Wildlife photographer. Spending more time in the wilderness than in cities.',
      'Food photographer turned cookbook creator. Making food look as good as it tastes.',
      'Documentary photographer. Telling stories that matter.',
      'Aerial photographer. The world looks different from above.',
      'Fine art photographer. Exploring light, texture, and emotion.',
      'Travel photographer. Currently on year 3 of a world tour.',
      'Night sky photographer. The universe is my studio.',
      'Editorial photographer for magazines and brands. Documenting culture.',
      'Pet photographer. Yes, that is a real thing. And it is amazing.',
      'Underwater photographer. Exploring the world beneath the waves.',
      'Architecture photographer. Lines, curves, and the play of shadow.',
      'Wedding and elopement photographer. Capturing the unscripted moments.',
    ],
    interests: ['photography', 'lighting', 'composition', 'film photography', 'editing', 'travel', 'visual storytelling', 'nature', 'portrait', 'architecture'],
    avatars: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
    ],
  },
  traveler: {
    titles: ['Travel Writer', 'Digital Nomad', 'Tour Guide', 'Solo Traveler', 'Travel Photographer', 'Cultural Explorer', 'Adventure Seeker', 'Slow Traveler', 'Backpacker', 'Expat'],
    bios: [
      'Slow travel advocate. 3 months per city. Learning the language. Making local friends.',
      'Digital nomad for 7 years. 42 countries. Still searching for the perfect wifi.',
      'Adventure travel specialist. Mountains, jungles, and everything in between.',
      'Cultural anthropology graduate turned travel writer. Curious about how people live.',
      'Backpacker who never unpacked. Living out of a 40L bag. 5 continents down.',
      'Luxury travel curator. Finding the extraordinary in the world.',
      'Solo female traveler. Empowering women to explore independently.',
      'Food-first traveler. The world through its flavors and markets.',
      'Van life enthusiast. Converting vans into homes. The open road is freedom.',
      'Travel photographer and writer. The words are the story, the photo is the proof.',
      'Expat in Lisbon. Teaching English, learning Portuguese, eating pasteis de nata.',
      'Overland traveler. Driving from Alaska to Argentina. Currently in Colombia.',
      'Family travel blogger. Traveling with two kids under 5. It is possible.',
      'Sustainable travel advocate. Traveling without leaving a footprint.',
      'History nerd who travels to ancient sites. From Angkor Wat to Machu Picchu.',
    ],
    interests: ['travel', 'culture', 'languages', 'food', 'photography', 'hiking', 'nature', 'adventure', 'history', 'sustainability'],
    avatars: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    ],
  },
  student: {
    titles: ['CS Student', 'Design Student', 'Biology Student', 'Literature Student', 'Physics Student', 'Business Student', 'Law Student', 'Art Student', 'Engineering Student', 'Psychology Student'],
    bios: [
      'CS student learning by building. Every project is a lesson. Every bug is a teacher.',
      'Design student at RISD. Exploring the intersection of craft and technology.',
      'Biology student who codes. Building tools for genetic analysis.',
      'Literature student. Reading the world to understand the world.',
      'Physics student fascinated by quantum mechanics. The universe is weird and beautiful.',
      'Business student building startups. Learning by doing, not just studying.',
      'Law student. Fighting for justice and arguing about precedent.',
      'Art student. Traditional and digital. Finding my voice.',
      'Engineering student. Building robots, solving problems, breaking things.',
      'Psychology student. Understanding the human mind one paper at a time.',
      'Grad student researching climate science. The data is clear. The action is urgent.',
      'Medical student. Surviving rotations, one 12-hour shift at a time.',
      'Math student who sees beauty in proofs. Pure and abstract.',
      'Journalism student. The truth is out there. I will find it.',
      'Music student. Composition, performance, and the theory behind it.',
    ],
    interests: ['studying', 'research', 'coding', 'design', 'science', 'writing', 'music', 'activism', 'learning', 'student life'],
    avatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    ],
  },
  musician: {
    titles: ['Composer', 'Guitarist', 'Pianist', 'Electronic Music Producer', 'Singer-Songwriter', 'Jazz Musician', 'Drummer', 'Violinist', 'Music Producer', 'DJ'],
    bios: [
      'Composer for film and media. The right music makes the scene.',
      'Fingerstyle guitarist. Writing songs that feel like conversations.',
      'Classical pianist. Performing Chopin, composing my own.',
      'Electronic music producer. Analog synths and digital dreams.',
      'Singer-songwriter. Writing about the things I cannot say.',
      'Jazz pianist. Improvising the soundtrack of life.',
      'Session drummer. 10 years of studio work. The groove is everything.',
      'Classical violinist turned indie artist. Breaking the rules beautifully.',
      'Music producer for indie artists. Making raw talent sound polished.',
      'DJ and curator. Finding the perfect beat for every moment.',
      'Choral conductor. Bringing voices together in harmony.',
      'Music educator. Teaching the next generation of creators.',
      'Ambient music composer. Sound as texture. Silence as structure.',
      'Orchestrator and arranger. Making ideas work for 40 musicians.',
      'Bassist. The foundation of the band. Understated but essential.',
    ],
    interests: ['music', 'composition', 'production', 'performance', 'music theory', 'sound design', 'instruments', 'live shows', 'recording', 'music history'],
    avatars: [
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    ],
  },
  teacher: {
    titles: ['Computer Science Teacher', 'Art Teacher', 'Language Teacher', 'Math Teacher', 'History Teacher', 'Science Teacher', 'Music Teacher', 'Literature Teacher', 'Design Mentor', 'STEM Educator'],
    bios: [
      'Teaching CS to the next generation. Everyone deserves to understand how technology works.',
      'Art teacher. Nurturing creativity in every student.',
      'Language teacher. Spanish, English, and French. Polyglot and proud.',
      'Math teacher making abstract concepts tangible. The beauty of numbers.',
      'History teacher. The past explains the present. The present shapes the future.',
      'Science teacher. Curiosity is the most important skill.',
      'Music teacher. Turning noise into melody, one student at a time.',
      'Literature teacher. Words have power. Teaching students to use it.',
      'Design mentor. Guiding the next generation of visual thinkers.',
      'STEM educator. Girls who code, kids who build, minds that wonder.',
      'Teaching philosophy. Questioning the answers, answering the questions.',
      'Career educator. Helping people find their path.',
      'Teaching by doing. Project-based learning that sticks.',
      'Educational technologist. Using tech to make learning more human.',
      'Early childhood educator. The first years are the most important.',
    ],
    interests: ['education', 'teaching', 'mentoring', 'learning', 'books', 'writing', 'culture', 'science', 'art', 'philosophy'],
    avatars: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    ],
  },
  chef: {
    titles: ['Chef', 'Pastry Chef', 'Food Blogger', 'Food Photographer', 'Recipe Developer', 'Nutritionist', 'Baker', 'Sommelier', 'Food Writer', 'Restaurateur'],
    bios: [
      'Chef at a farm-to-table restaurant. The ingredients tell the story.',
      'Pastry chef. Sugar is my medium. Butter is my friend.',
      'Food blogger exploring the world one meal at a time.',
      'Food photographer and stylist. Making food look irresistible.',
      'Recipe developer. Creating recipes that work in real kitchens.',
      'Nutritionist and chef. Healthy food should taste amazing.',
      'Artisan baker. Sourdough, croissants, and the smell of fresh bread.',
      'Sommelier. Wine is geography in a bottle.',
      'Food writer. The story behind the recipe.',
      'Restaurateur. Building a place where people gather.',
      'Home cook turned content creator. Simple recipes for busy people.',
      'Chef specializing in fermentation. Preserving the seasons.',
      'Plant-based chef. Cooking without compromise.',
      'BBQ pitmaster. Low and slow. The smoke is the secret.',
      'Chef instructor. Teaching the fundamentals.',
    ],
    interests: ['cooking', 'food', 'baking', 'nutrition', 'wine', 'recipes', 'food photography', 'cuisine', 'sustainability', 'restaurants'],
    avatars: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
    ],
  },
  writer: {
    titles: ['Novelist', 'Screenwriter', 'Journalist', 'Poet', 'Copywriter', 'Technical Writer', 'Travel Writer', 'Essayist', 'Ghostwriter', 'Editor'],
    bios: [
      'Novelist. Currently writing my third book. The first two are on your shelf.',
      'Screenwriter. Turning ideas into scripts. The page is the screen.',
      'Journalist. Investigative reporting. The story is always bigger than it seems.',
      'Poet. Finding the extraordinary in the ordinary.',
      'Copywriter. The right words sell the right ideas.',
      'Technical writer. Making complex things understandable.',
      'Travel writer. The story of a place, the people who make it.',
      'Essayist. Thinking in paragraphs. Writing in themes.',
      'Ghostwriter. Giving voice to stories that need to be told.',
      'Editor and publisher. Curating voices that matter.',
      'Fantasy writer. Building worlds that people want to live in.',
      'Science journalist. Explaining the complex to the curious.',
      'Literary translator. Bridging cultures through language.',
      'Non-fiction writer. The truth is stranger than fiction.',
      'Creative writing teacher. Inspiring the next generation of storytellers.',
    ],
    interests: ['writing', 'reading', 'storytelling', 'journalism', 'books', 'poetry', 'language', 'creativity', 'literature', 'editing'],
    avatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    ],
  },
  scientist: {
    titles: ['Biologist', 'Chemist', 'Physicist', 'Astronomer', 'Data Scientist', 'Neuroscientist', 'Climate Scientist', 'Materials Scientist', 'Geneticist', 'Mathematician'],
    bios: [
      'Biologist studying biodiversity. Every species tells a story.',
      'Chemist. Atoms, molecules, and the reactions between them.',
      'Physicist exploring quantum mechanics. The universe is a beautiful puzzle.',
      'Astronomer. Looking at the stars and finding our place among them.',
      'Data scientist. Finding patterns in the noise. Making decisions with data.',
      'Neuroscientist. Understanding the brain, one neuron at a time.',
      'Climate scientist. The data is clear. The action is urgent.',
      'Materials scientist. Designing the future, atom by atom.',
      'Geneticist. The code of life. The ethics of editing it.',
      'Mathematician. Proving the impossible. Simplifying the complex.',
      'Marine biologist. The ocean is the final frontier.',
      'Science communicator. Making science accessible to everyone.',
      'Researcher in artificial intelligence. The future is being built today.',
      'Paleontologist. Digging up the past to understand the future.',
      'Astrobiologist. Searching for life beyond Earth.',
    ],
    interests: ['science', 'research', 'data', 'nature', 'technology', 'discovery', 'innovation', 'space', 'biology', 'mathematics'],
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
    ],
  },
  artist: {
    titles: ['Painter', 'Sculptor', 'Digital Artist', 'Illustrator', 'Concept Artist', 'Ceramicist', 'Mixed Media Artist', 'Printmaker', 'Textile Artist', 'Installation Artist'],
    bios: [
      'Painter. Oil on canvas. The world as I see it.',
      'Sculptor. Stone and metal. Giving shape to ideas.',
      'Digital artist. The screen is my canvas. The stylus is my brush.',
      'Illustrator. Telling stories through images.',
      'Concept artist. Designing the worlds you want to explore.',
      'Ceramicist. Shaping earth with fire. Simple and ancient.',
      'Mixed media artist. Breaking boundaries. Combining the unexpected.',
      'Printmaker. The beauty of the process. The joy of the result.',
      'Textile artist. Weaving stories with thread and fiber.',
      'Installation artist. Making spaces that move people.',
      'Watercolor artist. Capturing light and transparency.',
      'Street artist. Making art accessible to everyone.',
      'Art therapist. Using creativity for healing.',
      'Gallery owner. Curating spaces that inspire.',
      'Art educator. Teaching the joy of making.',
    ],
    interests: ['art', 'drawing', 'painting', 'digital art', 'creativity', 'exhibitions', 'craft', 'design', 'culture', 'expression'],
    avatars: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    ],
  },
  creator: {
    titles: ['YouTuber', 'TikTok Creator', 'Podcaster', 'Influencer', 'Twitch Streamer', 'Content Strategist', 'Brand Ambassador', 'Vlogger', 'Lifestyle Creator', 'Tech Reviewer'],
    bios: [
      'YouTuber. 200k subscribers. Tech reviews and unboxings.',
      'TikTok creator. Making science fun. 1M followers.',
      'Podcaster. Deep conversations with interesting people.',
      'Content strategist. Building brands that people care about.',
      'Twitch streamer. Gaming with community. 50k concurrent.',
      'Tech reviewer. Testing so you do not have to.',
      'Lifestyle creator. The daily life of a creative professional.',
      'Vlogger. Documenting the journey. The good and the hard.',
      'Brand ambassador. Authentic partnerships. Real recommendations.',
      'Creative director. Building visual identities for brands.',
      'Audio creator. Podcasts, audiobooks, and sound design.',
      'Fashion creator. Styling, reviews, and brand partnerships.',
      'Food creator. Recipe videos and kitchen hacks.',
      'Fitness creator. Training content that actually works.',
      'Travel creator. The world through my lens.',
    ],
    interests: ['content creation', 'social media', 'video', 'branding', 'production', 'audience', 'creativity', 'trends', 'storytelling', 'engagement'],
    avatars: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    ],
  },
  fitness: {
    titles: ['Personal Trainer', 'Yoga Instructor', 'CrossFit Coach', 'Runner', 'Swimmer', 'Nutrition Coach', 'Marathon Runner', 'Rock Climber', 'Cyclist', 'Sports Coach'],
    bios: [
      'Personal trainer. Building strength, inside and out.',
      'Yoga instructor. Finding balance on and off the mat.',
      'CrossFit coach. Pushing limits. Building community.',
      'Marathon runner. 26.2 miles. The longest short distance.',
      'Swimmer. The pool is my happy place.',
      'Nutrition coach. Fuel for performance. Food for life.',
      'Rock climber. The wall is my meditation.',
      'Cyclist. 100 miles is a good day.',
      'Sports coach. Developing athletes, not just players.',
      'Fitness content creator. Real workouts, real results.',
      'Pilates instructor. Core strength, flexibility, and control.',
      'Hiking guide. The summit is always worth the climb.',
      'Triathlete. Swim, bike, run. Repeat.',
      'Strength coach. Building power and resilience.',
      'Mindfulness and movement teacher. Body and mind.',
    ],
    interests: ['fitness', 'health', 'running', 'yoga', 'strength', 'nutrition', 'outdoors', 'sports', 'wellness', 'meditation'],
    avatars: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    ],
  },
  nature: {
    titles: ['Hiker', 'Botanist', 'Naturalist', 'Wildlife Conservationist', 'Park Ranger', 'Gardener', 'Environmental Activist', 'Bird Watcher', 'Forager', 'Geologist'],
    bios: [
      'Naturalist. Exploring the wild. Documenting what I find.',
      'Botanist. Plants are more interesting than people.',
      'Wildlife conservationist. Protecting the creatures we share the planet with.',
      'Park ranger. Keeping the wilderness wild.',
      'Gardener. Growing food, flowers, and patience.',
      'Environmental activist. The planet is worth fighting for.',
      'Bird watcher. 400 species and counting.',
      'Forager. Finding food in the wild. Nature is the grocery store.',
      'Geologist. Rocks are the history of the planet.',
      'Marine biologist. The ocean is the final frontier.',
      'Permaculture designer. Growing food that grows the ecosystem.',
      'Nature photographer. Capturing the beauty of the untamed.',
      'Forest guide. Teaching people to find peace in the woods.',
      'Beekeeper. Small creatures, big impact.',
      'Sustainable farmer. The soil is the foundation.',
    ],
    interests: ['nature', 'conservation', 'hiking', 'wildlife', 'plants', 'sustainability', 'outdoors', 'gardening', 'ecology', 'environment'],
    avatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1519345182560-3d291ad244a8',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    ],
  },
};

// ============================================================================
// COMMUNITY DEFINITIONS
// ============================================================================

const COMMUNITIES = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend, backend, and everything in between. A community for developers building the modern web.',
    category: 'Technology',
    isPrivate: false,
    rules: [
      { title: 'Be kind and constructive', description: 'Critique ideas, not people. Help others learn and grow.' },
      { title: 'No job postings without context', description: 'Share job opportunities with meaningful context about the role and team.' },
      { title: 'Share your knowledge', description: 'When you learn something, teach it. The community grows together.' },
    ],
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'Where form meets function. Discuss design systems, user research, and the craft of digital interfaces.',
    category: 'Design',
    isPrivate: false,
    rules: [
      { title: 'Show your work', description: 'Share designs, case studies, and the process behind your decisions.' },
      { title: 'Constructive feedback only', description: 'Explain why something works or does not. Empty praise is not helpful.' },
      { title: 'Accessibility is required', description: 'All design discussions should consider users of all abilities.' },
    ],
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    avatar: 'https://images.unsplash.com/photo-1542744094-24638eff58bb',
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Chasing light, composition, and the decisive moment. From film to digital, beginner to pro.',
    category: 'Photography',
    isPrivate: false,
    rules: [
      { title: 'Credit your work', description: 'Always specify your camera, lens, and settings when sharing.' },
      { title: 'Critique the craft', description: 'Discuss technical and artistic choices. Help others grow.' },
      { title: 'No watermark spam', description: 'Share your work freely. The community is for learning, not advertising.' },
    ],
    cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
    avatar: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5',
  },
  {
    name: 'Travel Diaries',
    slug: 'travel-diaries',
    description: 'Stories from the road. Hidden gems, travel tips, and the beauty of different cultures.',
    category: 'Travel',
    isPrivate: false,
    rules: [
      { title: 'Share real experiences', description: 'Authentic stories over curated highlight reels. The real travel is what happens in between.' },
      { title: 'Respect local cultures', description: 'Travel is a privilege. Respect the people and places you visit.' },
      { title: 'Sustainable travel', description: 'Discuss how to travel with minimal environmental impact.' },
    ],
    cover: 'https://images.unsplash.com/photo-1488646953014-87e44a82f66e',
    avatar: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  },
  {
    name: 'Literature & Books',
    slug: 'literature-books',
    description: 'For those who find themselves in the pages. Book recommendations, reviews, and literary discussions.',
    category: 'Books',
    isPrivate: false,
    rules: [
      { title: 'Spoiler warnings', description: 'Always warn before discussing plot details. Respect the reading experience.' },
      { title: 'Diverse voices', description: 'Recommend authors from all backgrounds and cultures.' },
      { title: 'Thoughtful discussion', description: 'Go beyond whether you liked it. Discuss why it matters.' },
    ],
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb2c59005',
    avatar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
  },
  {
    name: 'Music Production',
    slug: 'music-production',
    description: 'Composers, producers, and musicians. From DAWs to live performance, creating the soundtrack.',
    category: 'Music',
    isPrivate: false,
    rules: [
      { title: 'Share your process', description: 'Talk about how you made it. Gear, techniques, and creative choices.' },
      { title: 'Give feedback', description: 'Listen to others and offer constructive feedback. We grow together.' },
      { title: 'No self-promotion spam', description: 'Share your work, but focus on the craft, not just the product.' },
    ],
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
  },
  {
    name: 'Science & Discovery',
    slug: 'science-discovery',
    description: 'Latest research, breakthroughs, and the beauty of scientific inquiry. From astrophysics to biology.',
    category: 'Science',
    isPrivate: false,
    rules: [
      { title: 'Cite your sources', description: 'Share links to papers and articles. Trust but verify.' },
      { title: 'Accessible language', description: 'Explain complex concepts clearly. Science is for everyone.' },
      { title: 'Healthy skepticism', description: 'Question claims, demand evidence, but stay open-minded.' },
    ],
    cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    avatar: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
  },
  {
    name: 'Nature & Outdoors',
    slug: 'nature-outdoors',
    description: 'Hiking, camping, wildlife, and the beauty of the natural world. Leave no trace, take only memories.',
    category: 'Nature',
    isPrivate: false,
    rules: [
      { title: 'Leave no trace', description: 'Nature is not a backdrop. Respect the environment in all posts.' },
      { title: 'Share locations responsibly', description: 'Some places are fragile. Consider the impact of sharing exact locations.' },
      { title: 'Wildlife safety', description: 'Do not disturb wildlife for a photo. Keep your distance.' },
    ],
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    avatar: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  },
  {
    name: 'Culinary Arts',
    slug: 'culinary-arts',
    description: 'Recipes, techniques, and the joy of cooking. From home kitchens to professional restaurants.',
    category: 'Cooking',
    isPrivate: false,
    rules: [
      { title: 'Share the recipe', description: 'If you post food, share the recipe. The community loves to recreate.' },
      { title: 'Food photography tips', description: 'Discuss lighting, plating, and styling. Make food look as good as it tastes.' },
      { title: 'Dietary respect', description: 'Respect all dietary choices. Vegan, gluten-free, and everything in between.' },
    ],
    cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    avatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  },
  {
    name: 'Art & Illustration',
    slug: 'art-illustration',
    description: 'Digital, traditional, mixed media. The creative process, techniques, and finished works.',
    category: 'Art',
    isPrivate: false,
    rules: [
      { title: 'Show the process', description: 'WIPs, sketches, and final pieces. The journey is as important as the destination.' },
      { title: 'Constructive critique', description: 'Help others grow. Point out what works and what could be improved.' },
      { title: 'Credit references', description: 'If you used a reference, credit it. Respect other artists.' },
    ],
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8f',
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
  },
  {
    name: 'Game Development',
    slug: 'game-development',
    description: 'Indie and AAA game dev. Programming, art, design, sound, and the business of games.',
    category: 'Gaming',
    isPrivate: false,
    rules: [
      { title: 'Show your game', description: 'Share progress, screenshots, and builds. The community wants to see your work.' },
      { title: 'Technical discussion', description: 'Engines, pipelines, optimization. The craft behind the fun.' },
      { title: 'Ethical monetization', description: 'Discuss fair practices. Respect players and their time.' },
    ],
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    avatar: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a',
  },
  {
    name: 'Fitness & Wellness',
    slug: 'fitness-wellness',
    description: 'Training, nutrition, mental health, and the pursuit of a balanced life.',
    category: 'Fitness',
    isPrivate: false,
    rules: [
      { title: 'Body positivity', description: 'All bodies are welcome. Fitness is not about appearance. It is about health.' },
      { title: 'Evidence-based advice', description: 'Share training and nutrition advice backed by science. Myths are not welcome.' },
      { title: 'Mental health matters', description: 'Wellness is more than physical. Mental health is part of the conversation.' },
    ],
    cover: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
  },
  {
    name: 'Film & Cinema',
    slug: 'film-cinema',
    description: 'Movies, TV, documentaries, and the craft of visual storytelling. From blockbusters to indie gems.',
    category: 'Movies',
    isPrivate: false,
    rules: [
      { title: 'Spoiler etiquette', description: 'Use spoiler tags for recent releases. Everyone deserves to experience the story.' },
      { title: 'Beyond the rating', description: 'Discuss why a film works. Do not just say it is good or bad.' },
      { title: 'Diverse cinema', description: 'Recommend films from all cultures and languages. The world is bigger than Hollywood.' },
    ],
    cover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    avatar: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'Machine learning, LLMs, computer vision, and the ethics of AI. The future is being built here.',
    category: 'Technology',
    isPrivate: false,
    rules: [
      { title: 'Ethical discussion', description: 'AI has real-world impact. Discuss ethics, bias, and responsibility.' },
      { title: 'Share resources', description: 'Papers, courses, tools. The community learns together.' },
      { title: 'Beginner-friendly', description: 'No question is too basic. We all started somewhere.' },
    ],
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
  },
  {
    name: 'History & Culture',
    slug: 'history-culture',
    description: 'The stories that shaped us. Ancient civilizations, modern history, and cultural heritage.',
    category: 'History',
    isPrivate: false,
    rules: [
      { title: 'Source your claims', description: 'History is evidence-based. Share your sources and welcome scrutiny.' },
      { title: 'Multiple perspectives', description: 'History has many sides. Consider different viewpoints and cultures.' },
      { title: 'Respectful discourse', description: 'Discuss controversial topics with respect. Learning is the goal.' },
    ],
    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12a74',
    avatar: 'https://images.unsplash.com/photo-1552831388-6a0b3575b32a',
  },
  {
    name: 'Entrepreneurship',
    slug: 'entrepreneurship',
    description: 'Building businesses, startups, and side projects. From idea to revenue.',
    category: 'Business',
    isPrivate: false,
    rules: [
      { title: 'Share the journey', description: 'Wins and losses. The real story is more valuable than the highlight reel.' },
      { title: 'No spam or self-promotion', description: 'Share insights, not just links. The community values depth.' },
      { title: 'Helpful feedback', description: 'When someone shares their project, give them thoughtful feedback.' },
    ],
    cover: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    avatar: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d',
  },
  {
    name: 'Education & Learning',
    slug: 'education-learning',
    description: 'Teaching, learning, and the pursuit of knowledge. For educators and lifelong learners.',
    category: 'Education',
    isPrivate: false,
    rules: [
      { title: 'Share resources', description: 'Books, courses, tools. Help others learn what you have learned.' },
      { title: 'Inclusive education', description: 'Education is for everyone. Discuss accessibility and equity.' },
      { title: 'Teaching methods', description: 'What works? What does not? Share your teaching experience.' },
    ],
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    avatar: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
  },
  {
    name: 'Sustainability',
    slug: 'sustainability',
    description: 'Climate action, sustainable living, renewable energy, and environmental justice. The planet is our home.',
    category: 'Nature',
    isPrivate: false,
    rules: [
      { title: 'Science-based discussion', description: 'Climate science is settled. Discuss solutions, not denial.' },
      { title: 'Actionable advice', description: 'Share what people can actually do. Small changes matter.' },
      { title: 'Hope and action', description: 'The situation is serious, but despair is not helpful. Focus on solutions.' },
    ],
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
  },
  {
    name: 'Space Exploration',
    slug: 'space-exploration',
    description: 'Rockets, planets, stars, and the final frontier. The universe is waiting.',
    category: 'Science',
    isPrivate: false,
    rules: [
      { title: 'Share the latest', description: 'News, launches, and discoveries. Space moves fast.' },
      { title: 'Accessible explanations', description: 'Make complex astronomy understandable. Everyone should be able to look up.' },
      { title: 'Wonder over fear', description: 'Space is awe-inspiring. Keep the discussion optimistic and curious.' },
    ],
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
    avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  },
  {
    name: 'Coffee & Tea',
    slug: 'coffee-tea',
    description: 'The ritual of the cup. Brewing methods, beans, leaves, and the perfect morning.',
    category: 'Food',
    isPrivate: false,
    rules: [
      { title: 'Share your setup', description: 'Equipment, beans, techniques. The community is curious about your process.' },
      { title: 'Respect all brews', description: 'Instant coffee, pour over, espresso, tea. All are valid. No snobbery.' },
      { title: 'Local roasters', description: 'Support local and share your favorite coffee spots around the world.' },
    ],
    cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    avatar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda',
  },
];

// ============================================================================
// POST CONTENT
// ============================================================================

const POST_TEMPLATES = {
  photos: [
    'Just got back from {location}. The light at golden hour was absolutely unreal. {hashtag}',
    'Morning walk in the {location}. Sometimes the simplest moments are the most beautiful. {hashtag}',
    'Finally visited the {location}. Worth every step of the hike. {hashtag}',
    'The {location} at sunrise. No filter needed. {hashtag}',
    'Documenting the {location} project. Months of work, captured in one frame. {hashtag}',
    'Spent the weekend shooting at {location}. The textures, the shadows, the stories. {hashtag}',
    'Street scene in {location}. The colors here are unlike anywhere else. {hashtag}',
    'The architecture in {location} never ceases to amaze me. {hashtag}',
    'A quiet moment in {location}. The world slowed down for a second. {hashtag}',
    'The food scene in {location} is something else. This plate tells a whole story. {hashtag}',
  ],
  stories: [
    'Three years ago I was working a job I hated. Today I am building something I believe in. The journey is the story. {hashtag}',
    'When I started {activity}, everyone said I was too late. Now I am doing it full time. {hashtag}',
    'The first time I failed at {activity}, it broke me. The fifth time, I learned. The tenth time, I succeeded. {hashtag}',
    'I moved to {location} with no plan and no job. Six months later, I found my community. {hashtag}',
    'I used to think {topic} was too complex for me. Then I found the right resources and started small. {hashtag}',
    'The moment everything clicked for me was when I stopped trying to be perfect and started being consistent. {hashtag}',
    'I spent two years teaching myself {topic}. Every day, one hour. The compound effect is real. {hashtag}',
    'From my first {activity} to my hundredth, the difference is not talent. It is showing up. {hashtag}',
    'Last year I said I would {activity}. Today I did. The difference was a calendar reminder and a decision. {hashtag}',
    'The best thing I did for my career was join a community of people who push me to be better. {hashtag}',
  ],
  questions: [
    'What is the best way to learn {topic} in 2026? I have been trying {method} but would love to hear what worked for you. {hashtag}',
    'I am building a {project} and stuck on {problem}. Has anyone solved this before? What approach did you take? {hashtag}',
    'What camera do you recommend for {activity}? Looking to upgrade from my current setup. {hashtag}',
    'Moving to {location} next month. Any recommendations for {activity} in the area? {hashtag}',
    'What is your morning routine? I am trying to build a better one and would love some inspiration. {hashtag}',
    'For those who switched to {topic}: what was the hardest part? What would you do differently? {hashtag}',
    'What book changed how you think about {topic}? I am looking for something that goes deeper than the basics. {hashtag}',
    'I am debating between {option1} and {option2} for my next project. Any strong opinions? {hashtag}',
    'What is the most underrated tool in your {topic} workflow? I am always looking for hidden gems. {hashtag}',
    'How do you balance {topic} with your day job? I am struggling to find time and would love strategies. {hashtag}',
  ],
  discussions: [
    'The future of {topic} is being shaped right now. Here are the trends I am watching closely. {hashtag}',
    'After three years of {activity}, here is what I wish I knew on day one. {hashtag}',
    'The debate about {topic} often misses the point. Here is the conversation we should be having. {hashtag}',
    'I spent a month researching {topic}. Here is what I learned, and what surprised me. {hashtag}',
    'The difference between good {topic} and great {topic} is not what you think. {hashtag}',
    'Why I changed my mind about {topic}. Sometimes the evidence leads you somewhere unexpected. {hashtag}',
    'The most important skill in {topic} is not technical. It is the ability to communicate clearly. {hashtag}',
    'I have been thinking about {topic} differently lately. Here is the shift that changed everything. {hashtag}',
    'What the {topic} community gets wrong about {subtopic}. A respectful but firm disagreement. {hashtag}',
    'The state of {topic} in 2026. What is working, what is broken, and where we are going. {hashtag}',
  ],
  tutorials: [
    'How I built a {project} in 30 days. Step by step, from idea to deployment. {hashtag}',
    'A complete guide to {topic} for beginners. Everything I wish I had when I started. {hashtag}',
    'The {topic} workflow that saves me 5 hours a week. Simple setup, massive results. {hashtag}',
    'How to {activity} like a pro. The techniques that took me years to learn. {hashtag}',
    'Building a {project} from scratch. No frameworks, no shortcuts. Just fundamentals. {hashtag}',
    'The {topic} checklist I use before every project. Catches 90% of issues before they happen. {hashtag}',
    'How to {activity} on a budget. Quality does not require expensive equipment. {hashtag}',
    'Understanding {topic} by building it yourself. The best way to learn is to do. {hashtag}',
    'A practical guide to {topic}. Not theory. Real-world examples and common pitfalls. {hashtag}',
    'From zero to {topic} in 60 days. The exact resources I used and the path I took. {hashtag}',
  ],
  personal: [
    'Today marks 6 months of {activity}. The progress is small but the consistency is real. {hashtag}',
    'Just finished {project}. The relief is real. The pride is bigger. {hashtag}',
    'Had a rough week but {activity} pulled me through. Sometimes the smallest routines keep us grounded. {hashtag}',
    'Celebrating a small win: I finally {achievement}. The big wins are made of these. {hashtag}',
    'Reflecting on {topic} this morning. The journey has been more valuable than the destination. {hashtag}',
    'New chapter: I am starting {activity}. Scared and excited in equal measure. {hashtag}',
    'The best thing about {activity} is the community. The people make it worth it. {hashtag}',
    'Taking a break from {activity} to focus on {newFocus}. Sometimes you need to step back to move forward. {hashtag}',
    'I have been thinking about {topic} a lot lately. It is changing how I approach everything. {hashtag}',
    'Grateful for the people who pushed me to start {activity}. The support makes all the difference. {hashtag}',
  ],
  travel: [
    'First day in {location}. The culture, the food, the energy. Everything is different and everything is inspiring. {hashtag}',
    'Spent a week in {location} and already planning my return. Here is what I learned. {hashtag}',
    'The best way to experience {location} is to walk. No itinerary, just curiosity. {hashtag}',
    'Hidden gem in {location}: {place}. The kind of place you only find when you get lost. {hashtag}',
    'The {activity} in {location} is unlike anything I have experienced. The community is what makes it. {hashtag}',
    'Budget travel in {location}: How I spent 3 weeks for less than most people spend in 3 days. {hashtag}',
    'The {location} you do not see in guidebooks. The neighborhoods, the people, the real culture. {hashtag}',
    'Traveling solo in {location} was the best decision I made this year. The freedom is unmatched. {hashtag}',
    'The food in {location} deserves its own trip. Every meal was a lesson in culture. {hashtag}',
    'Just returned from {location}. Already dreaming about the next trip. The travel bug is real. {hashtag}',
  ],
  code: [
    'Refactored a critical {topic} service today. Reduced complexity by 40%. The codebase breathes easier now. {hashtag}',
    'After a week of debugging, I found the bug. It was a single missing semicolon. The journey was the lesson. {hashtag}',
    'Optimizing {topic} performance. 200ms to 20ms. The satisfaction of a clean solution. {hashtag}',
    'Shipped a new feature today. The PR had 47 comments. The code is better for every single one. {hashtag}',
    'Learning {topic} by building a real project. The theory is fine but the bugs teach you the most. {hashtag}',
    'The code review that changed how I think about {topic}. Sometimes feedback is the best feature. {hashtag}',
    'Writing {topic} tests that actually catch bugs. The difference between confident and reckless shipping. {hashtag}',
    'Exploring {topic} this weekend. Building a small project to understand the concepts. {hashtag}',
    'The best debugging tool is a rubber duck and 20 minutes of silence. {hashtag}',
    'Just migrated from {oldTech} to {newTech}. The learning curve was steep but the payoff is worth it. {hashtag}',
  ],
  art: [
    'New piece: {title}. Started as a sketch, evolved into something I did not plan. The best kind of art. {hashtag}',
    'The creative process for this piece took 3 weeks. The actual painting took 3 hours. {hashtag}',
    'Experimenting with {technique}. The results are unexpected and that is the point. {hashtag}',
    'This piece is about {topic}. The meaning changed as I worked on it. Art is a conversation. {hashtag}',
    'The palette for this piece was inspired by {location}. The colors are the story. {hashtag}',
    'Digital art vs traditional. I use both. The medium is the message, but the message is what matters. {hashtag}',
    'The most difficult part of this piece was knowing when to stop. {hashtag}',
    'Studying {topic} for this piece. The research is as important as the creation. {hashtag}',
    'The sketch is always messier than the final. Do not judge the process by the early stages. {hashtag}',
    'Art block is real. The solution is usually to work on something else for a day. {hashtag}',
  ],
  reviews: [
    'Used {product} for 3 months. Here is the honest review: the good, the bad, and the dealbreaker. {hashtag}',
    'The {product} is not perfect, but it solved a real problem for me. Here is my experience. {hashtag}',
    'After comparing {product1} and {product2}, I chose {winner}. Here is why. {hashtag}',
    'The {product} changed my workflow. Here is the before and after. {hashtag}',
    'A week with the {product}. First impressions, daily use, and the verdict. {hashtag}',
    'Why I switched from {product1} to {product2}. The reason is not what you would expect. {hashtag}',
    'The {product} is overhyped. Here is the honest assessment after real use. {hashtag}',
    'The {product} does one thing perfectly. That is enough. {hashtag}',
    'Long-term review: {product} after one year. What held up and what did not. {hashtag}',
    'The {product} is not for everyone. But if it is for you, it is perfect. {hashtag}',
  ],
  announcements: [
    'I am excited to announce that I am starting {project}. After months of planning, it is finally happening. {hashtag}',
    'New chapter: I am joining {company} as {role}. Grateful for the journey that led here. {hashtag}',
    'My {project} is now live. The feedback from the beta testers was incredible. Thank you all. {hashtag}',
    'I have been working on {project} for 6 months. Today, I am sharing it with the world. {hashtag}',
    'The {project} hit {milestone}. Thank you to everyone who supported this journey. {hashtag}',
    'Exciting news: I am launching {project} next month. The pre-launch community has been amazing. {hashtag}',
    'I wrote a book about {topic}. It is called {title}. Available now. {hashtag}',
    'The {project} is open source. I have been building it in private for a year. Now it is yours. {hashtag}',
    'I am teaching a course on {topic}. Enrollment opens today. The curriculum is everything I wish I had. {hashtag}',
    'The {project} just got a major update. Here is everything that is new. {hashtag}',
  ],
};

// ============================================================================
// COMMENTS
// ============================================================================

const COMMENT_TEMPLATES = [
  'This is exactly the perspective I needed. I have been struggling with {topic} and your approach makes so much sense.',
  'I tried something similar last year but took a different approach. The way you handled {topic} is more elegant than what I did.',
  'The part about {topic} really resonates with me. I have been thinking about this differently lately.',
  'Great post! I especially appreciate the section on {topic}. It is the part most people skip.',
  'I have a slightly different take on {topic}. While I agree with the overall direction, I think the implementation needs more nuance.',
  'This is incredibly helpful. I have been looking for a practical guide on {topic} and this is the best one I have found.',
  'Your experience with {topic} mirrors mine almost exactly. The difference was in the execution.',
  'I shared this with my team. The discussion about {topic} sparked a whole new approach for us.',
  'The visual style here is stunning. The composition, the color, the light. I would love to know your setup.',
  'This is beautifully written. The way you describe {topic} makes me want to experience it myself.',
  'I have a question about {topic}. In your experience, how long did it take before you saw results?',
  'The {topic} insight is the key takeaway here. Everything else builds on that foundation.',
  'I disagree with the {topic} point. I have found the opposite in my experience. But I love the overall framework.',
  'This is the kind of content I come to this platform for. Real experience, honest reflection, and practical advice.',
  'The before and after comparison is striking. The transformation in {topic} is exactly what I needed to see.',
  'I bookmarked this for later. The section on {topic} is something I need to revisit when I have more time.',
  'The authenticity in this post is what makes it stand out. No fluff, no hype. Just real experience.',
  'Your journey with {topic} gives me hope. I am at the same starting point you described.',
  'The {topic} tip is pure gold. I implemented it immediately and already see the difference.',
  'I have been following your work for a while. This might be your best post yet. The {topic} section is exceptional.',
];

const COMMENT_REPLIES = [
  'I am glad you found it helpful! Let me know if you have questions about the implementation.',
  'Thanks for the thoughtful feedback. I actually updated the approach based on similar comments.',
  'That is a great point. I have been thinking about that too. What is your experience?',
  'I appreciate the disagreement. Healthy debate is how we all get better.',
  'Thank you! The setup is actually quite simple. I will share more details in a follow-up.',
  'You are right to ask. It took me about 6 months to see meaningful results. Consistency was the key.',
  'That means a lot coming from you. I have learned so much from your work as well.',
  'I am so glad you shared it with your team. That is exactly the kind of community this should be.',
  'Interesting! I would love to hear more about your different approach. Different paths can lead to the same destination.',
  'The authenticity is the goal. I have learned that people connect with real stories more than polished ones.',
];

// ============================================================================
// LOCATIONS, TOPICS, HASHTAGS
// ============================================================================

const LOCATIONS = [
  'Tokyo', 'Paris', 'New York', 'London', 'Berlin', 'Kyoto', 'Santorini', 'Iceland', 'Patagonia', 'Bali',
  'Marrakech', 'Lisbon', 'Barcelona', 'Hanoi', 'Chiang Mai', 'Reykjavik', 'Queenstown', 'Dubai', 'Amsterdam', 'Prague',
  'Seoul', 'Mexico City', 'Cape Town', 'Vancouver', 'Melbourne', 'Edinburgh', 'Havana', 'Kathmandu', 'Maldives', 'Siem Reap',
  'Vienna', 'Florence', 'Copenhagen', 'Singapore', 'Helsinki', 'Dubrovnik', 'Oaxaca', 'Nairobi', 'Kerala', 'Svalbard',
];

const TOPICS = [
  'design systems', 'React', 'TypeScript', 'Python', 'photography', 'travel', 'cooking', 'fitness', 'writing', 'music',
  'AI', 'blockchain', 'cloud computing', 'data visualization', 'user research', 'brand identity', 'typography', 'illustration', 'animation', 'code reviews',
  'accessibility', 'performance', 'security', 'database design', 'microservices', 'DevOps', 'machine learning', 'computer vision', 'webAssembly', 'CSS architecture',
  'sustainability', 'minimalism', 'productivity', 'remote work', 'mental health', 'finance', 'investing', 'entrepreneurship', 'public speaking', 'networking',
];

const HASHTAG_POOLS = {
  developer: ['webdev', 'javascript', 'react', 'typescript', 'coding', 'programming', 'frontend', 'backend', 'fullstack', 'developer', 'code', 'tech', 'software', 'engineering', 'opensource', 'ai', 'cloud', 'devops', 'startup', 'productivity'],
  designer: ['design', 'ui', 'ux', 'designsystem', 'typography', 'branding', 'creative', 'visual', 'illustration', 'designer', 'figma', 'motion', 'interaction', 'artdirection', 'designthinking', 'color', 'layout', 'composition', 'minimalism'],
  photographer: ['photography', 'landscape', 'portrait', 'street', 'film', 'nature', 'travel', 'light', 'composition', 'camera', 'photographer', 'goldenhour', 'blackandwhite', 'analog', 'digital', 'photooftheday', 'visual', 'aesthetic', 'wanderlust'],
  traveler: ['travel', 'adventure', 'wanderlust', 'explore', 'backpacking', 'culture', 'food', 'solotravel', 'digitalnomad', 'journey', 'discovery', 'landscape', 'travelphotography', 'hidden', 'local', 'experience', 'nomad', 'expat', 'sustainability'],
  student: ['study', 'learning', 'student', 'coding', 'design', 'science', 'research', 'growth', 'university', 'education', 'books', 'knowledge', 'career', 'internship', 'project', 'startup', 'community', 'motivation', 'progress'],
  musician: ['music', 'producer', 'composer', 'artist', 'live', 'sound', 'studio', 'instrument', 'melody', 'harmony', 'recording', 'mixing', 'electronic', 'acoustic', 'jazz', 'classical', 'indie', 'performance', 'creative', 'passion'],
  teacher: ['teaching', 'education', 'learning', 'mentorship', 'growth', 'student', 'knowledge', 'pedagogy', 'classroom', 'curriculum', 'inspiration', 'impact', 'community', 'future', 'empower', 'change', 'books', 'wisdom', 'guide'],
  chef: ['food', 'cooking', 'recipe', 'chef', 'foodie', 'kitchen', 'flavor', 'ingredients', 'baking', 'culinary', 'taste', 'fresh', 'homemade', 'restaurant', 'gourmet', 'healthy', 'sustainable', 'local', 'seasonal'],
  writer: ['writing', 'story', 'literature', 'poetry', 'novel', 'essay', 'journalism', 'creative', 'words', 'author', 'book', 'reading', 'manuscript', 'editing', 'publishing', 'storytelling', 'imagination', 'craft', 'language'],
  scientist: ['science', 'research', 'discovery', 'data', 'analysis', 'experiment', 'biology', 'physics', 'chemistry', 'astronomy', 'innovation', 'technology', 'nature', 'evidence', 'hypothesis', 'theory', 'publication', 'lab', 'fieldwork'],
  artist: ['art', 'painting', 'digital', 'illustration', 'creative', 'studio', 'gallery', 'exhibition', 'canvas', 'color', 'texture', 'expression', 'contemporary', 'fineart', 'sketch', 'process', 'inspiration', 'craft', 'visual'],
  creator: ['content', 'creator', 'youtube', 'podcast', 'video', 'social', 'brand', 'growth', 'engagement', 'creative', 'production', 'editing', 'strategy', 'audience', 'monetization', 'authentic', 'community', 'platform'],
  fitness: ['fitness', 'health', 'workout', 'training', 'running', 'yoga', 'strength', 'nutrition', 'wellness', 'marathon', 'gym', 'motivation', 'discipline', 'progress', 'mindset', 'recovery', 'balance', 'outdoor'],
  nature: ['nature', 'hiking', 'wildlife', 'conservation', 'forest', 'mountain', 'ocean', 'plants', 'garden', 'sustainability', 'ecology', 'green', 'outdoor', 'adventure', 'climate', 'biodiversity', 'preserve', 'earth', 'organic'],
};

// ============================================================================
// PHOTO URLS
// ============================================================================

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1447752875204-b4f97910db1d?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b70?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1508739773434-c45b3c4e3df8?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1434725039720-8d0e3f35e12c?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1494500764479-0b8ce4e24b24?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dd99e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1490730141103-6cac27a4c2b3?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1518098268026-4e8c13f4c096?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-25c5e0b9c9a4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d0193?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1465188162913-8fb5d9e5a6a0?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1504198453319-5ce3f8d3f0b9?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b70?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=800&fit=crop',
];

// ============================================================================
// STORY PHOTOS
// ============================================================================

const STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1490750967868-88aa4426d4?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1517502474097-f9b30659dadb?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1518005052357-e9871951f3a2?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1516575334481-f85287c2c82a?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600&h=1067&fit=crop',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=1067&fit=crop',
];

// ============================================================================
// BANNER URLS
// ============================================================================

const BANNER_URLS = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557682224-5b8590cd6e1b?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557682260-96773eb0b62d?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614854262318-831574f15f1a?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614854262340-ab1ca7d079c7?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&h=400&fit=crop',
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateUsername(name: string, used: Set<string>): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  let username = base;
  let counter = 1;
  while (used.has(username)) {
    username = `${base}.${counter}`;
    counter++;
  }
  used.add(username);
  return username;
}

function generateName(personaKey: string, usedNames: Set<string>): { name: string; title: string } {
  const persona = PERSONAS[personaKey as keyof typeof PERSONAS];
  const firstNames = [
    'Sophia', 'Olivia', 'Emma', 'Ava', 'Isabella', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
    'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
    'Charlotte', 'Luna', 'Camila', 'Gianna', 'Elizabeth', 'Eleanor', 'Ella', 'Scarlett', 'Grace', 'Chloe',
    'Mateo', 'Theodore', 'Daniel', 'Jack', 'Michael', 'Sebastian', 'Ethan', 'Aiden', 'Samuel', 'Owen',
    'Aria', 'Nova', 'Mila', 'Zoe', 'Layla', 'Stella', 'Penelope', 'Hazel', 'Lily', 'Aurora',
    'Leo', 'Hudson', 'Luca', 'Maverick', 'David', 'Joseph', 'Jacob', 'Logan', 'Luke', 'Julian',
    'Levi', 'Wyatt', 'Jayden', 'Grayson', 'Matthew', 'Asher', 'Carter', 'Cameron', 'Ryan', 'Nathan',
    'Emily', 'Madison', 'Victoria', 'Nora', 'Avery', 'Hannah', 'Addison', 'Lillian', 'Brooklyn', 'Savannah',
  ];
  const lastNames = [
    'Sterling', 'Chen', 'Patel', 'Kim', 'Rossi', 'Muller', 'Santos', 'Ivanov', 'Kowalski', 'Okafor',
    'Nakamura', 'Silva', 'Andersson', 'Leroy', 'Papadopoulos', 'Jansen', 'Fischer', 'Moro', 'Bianchi', 'Dubois',
    'Tanaka', 'Singh', 'Khan', 'Zhang', 'Garcia', 'Rodriguez', 'Smith', 'Johnson', 'Williams', 'Brown',
    'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
    'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
    'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
    'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell',
    'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook', 'Rogers', 'Rivera',
  ];
  let name = '';
  let counter = 0;
  do {
    name = `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;
    counter++;
  } while (usedNames.has(name) && counter < 100);
  usedNames.add(name);
  return { name, title: pickRandom(persona.titles) };
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

function generateHashtags(personaKey: string, count: number = 3): string[] {
  const pool = HASHTAG_POOLS[personaKey as keyof typeof HASHTAG_POOLS] || HASHTAG_POOLS.creator;
  return pickRandomN(pool, count);
}

function randomDate(daysBack: number = 365): string {
  const now = Date.now();
  const back = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - back).toISOString();
}

// ============================================================================
// SEED GENERATION
// ============================================================================

export async function seedDatabase(targetUsers: number = 150) {
  console.log('[Seeder] Starting database seed...');

  const usedUsernames = new Set<string>();
  const usedNames = new Set<string>();
  const createdUsers: any[] = [];
  const userIds: string[] = [];

  // Generate users
  const personaKeys = Object.keys(PERSONAS);
  const defaultHash = hashPassword('lantern123');

  for (let i = 0; i < targetUsers; i++) {
    const personaKey = personaKeys[i % personaKeys.length];
    const persona = PERSONAS[personaKey as keyof typeof PERSONAS];
    const { name, title } = generateName(personaKey, usedNames);
    const username = generateUsername(name, usedUsernames);
    const bio = pickRandom(persona.bios);
    const interests = pickRandomN(persona.interests, 3 + Math.floor(Math.random() * 3));
    const avatar = pickRandom(persona.avatars);
    const banner = pickRandom(BANNER_URLS);
    const theme = Math.random() > 0.5 ? 'dark' : 'light';
    const email = `${username}@lantern.local`;
    const joinDays = Math.floor(Math.random() * 730);
    const createdAt = new Date(Date.now() - joinDays * 24 * 60 * 60 * 1000).toISOString();
    const role = Math.random() > 0.97 ? 'admin' : 'user';

    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: defaultHash,
          username,
          name,
          role,
          created_at: createdAt,
        })
        .select()
        .single();

      if (error || !user) {
        console.error('[Seeder] Failed to create user', error);
        continue;
      }

      await supabase.from('profiles').insert({
        user_id: user.id,
        avatar_url: `${avatar}?w=200&h=200&fit=crop`,
        cover_url: `${banner}?w=1200&h=400&fit=crop`,
        bio,
        website: '',
        location: pickRandom(LOCATIONS),
        is_private: Math.random() > 0.85,
        theme_preference: theme,
        settings: { interests, title },
      });

      createdUsers.push({ id: user.id, name, username, persona: personaKey, avatar, createdAt: new Date(createdAt).getTime() });
      userIds.push(user.id);
      if (i % 50 === 0) console.log(`[Seeder] Created ${i + 1} users...`);
    } catch (e) {
      console.error('[Seeder] User creation error:', e);
    }
  }

  console.log(`[Seeder] Created ${createdUsers.length} users`);

  // Create communities
  const createdCommunities: { id: string; slug: string; memberIds: string[] }[] = [];
  for (const communityDef of COMMUNITIES) {
    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name: communityDef.name,
        description: communityDef.description,
        slug: communityDef.slug,
        avatar_url: `${communityDef.avatar}?w=200&h=200&fit=crop`,
        cover_url: `${communityDef.cover}?w=1200&h=400&fit=crop`,
        is_private: communityDef.isPrivate,
        member_count: 0,
        post_count: 0,
      })
      .select()
      .single();

    if (error || !community) {
      console.error('[Seeder] Failed to create community', error);
      continue;
    }

    // Add rules
    for (const rule of communityDef.rules) {
      await supabase.from('community_rules').insert({
        community_id: community.id,
        title: rule.title,
        description: rule.description,
        order: communityDef.rules.indexOf(rule),
      });
    }

    // Add 10-25 random members
    const memberCount = 10 + Math.floor(Math.random() * 15);
    const members = pickRandomN(createdUsers, Math.min(memberCount, createdUsers.length));
    const memberIds: string[] = [];
    for (const member of members) {
      const role = memberIds.length === 0 ? 'owner' : memberIds.length < 3 ? 'moderator' : 'member';
      await supabase.from('community_members').insert({
        community_id: community.id,
        user_id: member.id,
        role,
      });
      memberIds.push(member.id);
    }
    await supabase.from('communities').update({ member_count: memberIds.length }).eq('id', community.id);
    createdCommunities.push({ id: community.id, slug: community.slug, memberIds });
  }
  console.log(`[Seeder] Created ${createdCommunities.length} communities`);

  // Generate posts
  const postCount = Math.max(500, targetUsers * 3);
  const createdPosts: any[] = [];
  const templateKeys = Object.keys(POST_TEMPLATES);

  for (let i = 0; i < postCount; i++) {
    const user = pickRandom(createdUsers);
    const persona = PERSONAS[user.persona as keyof typeof PERSONAS];
    const templateKey = pickRandom(templateKeys);
    const templates = POST_TEMPLATES[templateKey as keyof typeof POST_TEMPLATES];
    const template = pickRandom(templates);
    const hashtags = generateHashtags(user.persona, 2 + Math.floor(Math.random() * 3));
    const hashtagStr = hashtags.map(h => `#${h}`).join(' ');
    const content = fillTemplate(template, {
      location: pickRandom(LOCATIONS),
      topic: pickRandom(TOPICS),
      activity: pickRandom(TOPICS),
      project: pickRandom(TOPICS),
      problem: pickRandom(TOPICS),
      option1: pickRandom(TOPICS),
      option2: pickRandom(TOPICS),
      oldTech: pickRandom(['jQuery', 'Angular', 'PHP', 'Rails', 'Bootstrap']),
      newTech: pickRandom(['React', 'Next.js', 'Svelte', 'Vue', 'Astro']),
      product: pickRandom(['MacBook Pro', 'Sony A7IV', 'Figma', 'Notion', 'Arc Browser']),
      product1: pickRandom(['iPhone', 'Pixel', 'Samsung']),
      product2: pickRandom(['MacBook', 'ThinkPad', 'Dell XPS']),
      winner: pickRandom(['product1', 'product2']),
      achievement: pickRandom(['my first marathon', 'a solo project', 'a book chapter', 'a design system']),
      newFocus: pickRandom(['writing', 'family', 'health', 'learning']),
      technique: pickRandom(['watercolor', 'digital painting', 'oil on canvas', 'mixed media']),
      title: pickRandom(['Serenity', 'The Journey', 'Golden Hour', 'Reflection', 'Ascension']),
      company: pickRandom(['Stripe', 'Notion', 'Vercel', 'Figma', 'Linear']),
      role: pickRandom(['Senior Engineer', 'Product Designer', 'Developer Advocate', 'Engineering Manager']),
      milestone: pickRandom(['1000 users', '500 stars', 'first revenue', '100 posts']),
      place: pickRandom(['a hidden waterfall', 'a local market', 'a century-old library', 'an abandoned temple']),
    }) + ' ' + hashtagStr;

    const hasPhoto = Math.random() > 0.3;
    const mediaUrls = hasPhoto ? [pickRandom(PHOTO_URLS)] : [];

    try {
      const post = await db.createPost(user.id, content, mediaUrls);
      createdPosts.push({ ...post, userId: user.id });
      if (i % 100 === 0) console.log(`[Seeder] Created ${i + 1} posts...`);
    } catch (e) {
      console.error('[Seeder] Post creation error:', e);
    }
  }
  console.log(`[Seeder] Created ${createdPosts.length} posts`);

  // Generate community posts
  for (const community of createdCommunities) {
    const communityPosts = pickRandomN(createdPosts, 10 + Math.floor(Math.random() * 20));
    for (const post of communityPosts) {
      await supabase.from('community_posts').insert({
        community_id: community.id,
        post_id: post.id,
      });
    }
  }

  // Generate comments
  const commentCount = Math.max(1000, targetUsers * 6);
  for (let i = 0; i < commentCount; i++) {
    const post = pickRandom(createdPosts);
    const user = pickRandom(createdUsers);
    if (user.id === post.userId) continue;

    const template = pickRandom(COMMENT_TEMPLATES);
    const content = fillTemplate(template, { topic: pickRandom(TOPICS) });

    try {
      await db.createComment(user.id, post.id, content);
      if (i % 200 === 0) console.log(`[Seeder] Created ${i + 1} comments...`);
    } catch (e) {
      console.error('[Seeder] Comment creation error:', e);
    }
  }
  console.log(`[Seeder] Created ${commentCount} comments`);

  // Generate replies
  const replyCount = Math.floor(commentCount * 0.4);
  const { data: allComments } = await supabase.from('comments').select('*');
  for (let i = 0; i < replyCount; i++) {
    const parent = pickRandom((allComments || []) as any[]);
    const user = pickRandom(createdUsers);
    if (user.id === parent.user_id) continue;

    const template = pickRandom(COMMENT_REPLIES);
    const content = fillTemplate(template, { topic: pickRandom(TOPICS) });

    try {
      await db.createComment(user.id, parent.post_id, content);
    } catch (e) {
      // ignore
    }
  }

  // Generate likes
  const likeCount = Math.max(2000, targetUsers * 12);
  for (let i = 0; i < likeCount; i++) {
    const post = pickRandom(createdPosts);
    const user = pickRandom(createdUsers);
    if (user.id === post.userId) continue;
    try {
      await db.toggleLike(user.id, post.id);
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${likeCount} likes`);

  // Generate follows
  const followCount = Math.max(500, targetUsers * 3);
  for (let i = 0; i < followCount; i++) {
    const userA = pickRandom(createdUsers);
    const userB = pickRandom(createdUsers);
    if (userA.id === userB.id) continue;
    try {
      await db.toggleFollow(userA.id, userB.id);
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${followCount} follows`);

  // Generate stories
  const storyCount = Math.max(100, targetUsers);
  for (let i = 0; i < storyCount; i++) {
    const user = pickRandom(createdUsers);
    const photo = pickRandom(STORY_PHOTOS);
    try {
      await db.createStory(user.id, photo, 'image');
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${storyCount} stories`);

  // Generate messages
  const messageCount = Math.max(500, targetUsers * 3);
  for (let i = 0; i < messageCount; i++) {
    const userA = pickRandom(createdUsers);
    const userB = pickRandom(createdUsers);
    if (userA.id === userB.id) continue;
    try {
      const conv = await db.createConversation([userA.id, userB.id]);
      const messages = [
        'Hey! How is it going?',
        'Have you seen the latest update on that project we were discussing?',
        'I am heading to the cafe later if you want to join.',
        'Thanks for the feedback on my last post. Really appreciate it.',
        'Just wanted to check in and see how you are doing.',
        'That photo you shared was incredible. Where was it taken?',
        'I have been thinking about what you said about work-life balance.',
        'Do you have any recommendations for good resources on this topic?',
        'The event next week looks interesting. Are you planning to go?',
        'I have been working on something new. Would love to get your thoughts.',
      ];
      const count = 2 + Math.floor(Math.random() * 6);
      for (let j = 0; j < count; j++) {
        const sender = Math.random() > 0.5 ? userA : userB;
        await db.createMessage(conv.id, sender.id, pickRandom(messages));
      }
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${messageCount} conversations`);

  // Generate notifications
  const notificationCount = Math.max(200, targetUsers);
  for (let i = 0; i < notificationCount; i++) {
    const sender = pickRandom(createdUsers);
    const receiver = pickRandom(createdUsers);
    if (sender.id === receiver.id) continue;
    const type = pickRandom(['like', 'comment', 'follow', 'mention']);
    const post = Math.random() > 0.5 ? pickRandom(createdPosts) : null;
    try {
      await db.createNotification(sender.id, receiver.id, type as any, post?.id);
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${notificationCount} notifications`);

  // Generate saves
  const saveCount = Math.max(200, targetUsers);
  for (let i = 0; i < saveCount; i++) {
    const user = pickRandom(createdUsers);
    const post = pickRandom(createdPosts);
    if (user.id === post.userId) continue;
    try {
      await db.toggleSavePost(user.id, post.id);
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${saveCount} saved posts`);

  // Generate reports
  const reportCount = 5;
  for (let i = 0; i < reportCount; i++) {
    const reporter = pickRandom(createdUsers);
    const post = pickRandom(createdPosts);
    if (reporter.id === post.userId) continue;
    try {
      await db.createReport(reporter.id, 'post', post.id, 'This content appears to violate community guidelines.');
    } catch (e) {
      // ignore
    }
  }
  console.log(`[Seeder] Created ${reportCount} reports`);

  console.log('[Seeder] Database seed complete!');
  return {
    users: createdUsers.length,
    communities: createdCommunities.length,
    posts: createdPosts.length,
    comments: commentCount,
    likes: likeCount,
    follows: followCount,
    stories: storyCount,
    messages: messageCount,
    notifications: notificationCount,
  };
}
