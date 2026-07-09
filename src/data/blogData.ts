export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  authorTitle: string;
  publishDate: string; // ISO
  updatedDate: string; // ISO
  readingTime: string;
  category: string;
  tags: string[];
  excerpt: string;
  toc: TocItem[];
  faqs: FaqItem[];
  relatedSlugs: string[];
  content: string; // HTML string — rendered with dangerouslySetInnerHTML
}

const posts: BlogPost[] = [
  {
    slug: 'what-is-an-ai-image-prompt',
    title: 'What Is an AI Image Prompt? A Real-World Guide for Creators',
    metaTitle: 'What Is an AI Image Prompt? Real Guide for Creators 2026 | Promptro',
    metaDescription: 'Frustrated by bad AI images? Learn what AI image prompts actually are, how they work behind the scenes, and how to write them like a pro. Indian creator context.',
    keywords: 'AI image prompt, how to write AI prompts, Midjourney prompts India, DALL-E prompts, AI design guide, Promptro tutorials',
    featuredImage: '/blog_ai_prompt_guide.png',
    featuredImageAlt: 'Colorful and detailed AI-generated artwork showing the creative journey of prompt engineering',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-01T00:00:00Z',
    updatedDate: '2026-06-06T12:00:00Z',
    readingTime: '12 min read',
    category: 'Beginner Guides',
    tags: ['AI prompts', 'beginners', 'Midjourney', 'DALL-E', 'guide'],
    excerpt: 'An empty text box can be intimidating. Here is a no-nonsense, human-to-human guide explaining what AI prompts are, why simple words fail, and how to write descriptions that generate jaw-dropping visuals.',
    toc: [
      { id: 'why-empty-box', title: 'The Empty Text Box Struggle', level: 2 },
      { id: 'how-prompts-work', title: 'What Actually Happens Behind the Prompt?', level: 2 },
      { id: 'anatomy-of-prompt', title: 'The Five Pillars of a Perfect Prompt', level: 2 },
      { id: 'camera-lighting-cheat-sheet', title: 'Camera and Lighting Cheat Sheet', level: 3 },
      { id: 'style-cheat-sheet', title: 'Style and Aesthetic Cheat Sheet', level: 3 },
      { id: 'real-examples', title: 'Real Prompt Transformations: Before and After', level: 2 },
      { id: 'human-best-practices', title: 'My Personal Rules for Better Prompting', level: 2 },
      { id: 'negative-prompts-intro', title: 'What About Negative Prompts?', level: 2 },
      { id: 'skip-the-struggle', title: 'Skip the Grind: Where to Find Ready-Made Prompts', level: 2 },
    ],
    faqs: [
      {
        question: 'What is an AI image prompt in simple terms?',
        answer: 'Think of it as giving directions to a highly talented freelance artist who doesn\'t know your client. You describe the subject, the lighting, the mood, and the camera angle. The more details you provide, the closer the result will be to what\'s in your head.',
      },
      {
        question: 'Why do my prompts look like cheap plastic 3D renders?',
        answer: 'By default, AI models fall back on generic patterns. If you just type "a car," the AI generates a clinical, standard 3D asset. You need to supply descriptive terms like "shot on 35mm film," "cinematic golden hour light," or specific textures to break that clinical AI look.',
      },
      {
        question: 'How long should my prompt be?',
        answer: 'Longer isn\'t always better. For DALL-E 3 (ChatGPT), 20 to 50 descriptive words work best because it understands conversational English. For Midjourney, focusing on comma-separated stylistic keywords rather than long sentences prevents the model from ignoring half your prompt.',
      },
      {
        question: 'Can I write prompts in Hindi or Hinglish?',
        answer: 'Yes! Modern image models, especially Google\'s Gemini (Imagen 3), have excellent regional language databases. Writing "Mumbai street food tapri during heavy rain, cinematic" works surprisingly well.',
      },
    ],
    relatedSlugs: ['best-midjourney-prompts-2026', 'how-to-use-negative-prompts', 'chatgpt-vs-gemini-ai-image-comparison'],
    content: `
<section id="why-empty-box">
  <h2>The Empty Text Box Struggle</h2>
  <p>Let’s be honest. When you first open Midjourney, DALL-E, or Stable Diffusion and see that blank text box staring back at you, it’s intimidating. You type something simple like <em>"a cool sports car"</em> or <em>"a house in the hills"</em>, hit enter, and wait. What you get back usually looks like a cheap plastic toy or a generic stock photo. It’s frustrating.</p>
  <p>When our team first started experimenting with generative AI in a small, cramped co-working desk in Bengaluru back in 2024, our early outputs were, frankly, laughable. We quickly realized a fundamental truth: <strong>the quality of the image is directly tied to how clearly you communicate your vision to the AI</strong>. That communication is what we call an <strong>AI Image Prompt</strong>.</p>
  <p>It isn't about code or math; it is about learning a new language—part creative direction, part photography vocabulary, and part raw imagination. If you've been struggling to make your AI images look professional, this guide is for you. We'll strip away the academic jargon and look at how things work in the real world.</p>
</section>

<section id="how-prompts-work">
  <h2>What Actually Happens Behind the Prompt?</h2>
  <p>AI image generators don't "think" or understand the world the way humans do. They are trained on millions of images paired with text captions. When you enter a prompt, the AI matches the statistical patterns of your words against its massive library to draw pixels that correspond to those patterns.</p>
  <p>Because it's a game of statistics, generic words yield generic images. If you write <em>"a woman"</em>, the AI will pull a statistical average of what a woman looks like in stock photos. But if you write <em>"a candid portrait of an elderly Varanasi weaver, deep facial wrinkles, soft window light, shot on a 50mm lens, film grain,"</em> you force the AI to pull from highly specific, artistic, and rich datasets.</p>
  <p>Understanding this is your superpower. You aren't coding the image; you are steering a probability engine. By choosing your words carefully, you guide the engine away from generic stock-photo aesthetics and toward cinematic masterpiece status.</p>
</section>

<section id="anatomy-of-prompt">
  <h2>The Five Pillars of a Perfect Prompt</h2>
  <p>After generating thousands of images for client campaigns and social media grids, we’ve found that the best prompts usually follow a simple, logical structure. You don't need all these elements every single time, but keeping them in mind makes a world of difference:</p>
  <ol>
    <li><strong>The Subject:</strong> Who or what is the main focus? Be specific. Instead of "a dog," try "a golden retriever puppy."</li>
    <li><strong>The Environment &amp; Background:</strong> Where is this happening? Describe the weather, the setting, and the background elements. (e.g., *a rain-slicked street in South Mumbai at night*, *a misty tea garden in Darjeeling*)</li>
    <li><strong>The Medium &amp; Style:</strong> Is it a photo, an oil painting, an anime sketch, or a 3D render? (e.g., *analog film photography*, *watercolor illustration*)</li>
    <li><strong>Lighting:</strong> Lighting defines the mood. (e.g., *dramatic side lighting*, *harsh afternoon sun with sharp shadows*, *neon reflections*)</li>
    <li><strong>Camera Specs:</strong> Using real photography terms tells the AI how to frame the shot. (e.g., *macro lens*, *85mm portrait lens*, *wide-angle panoramic*)</li>
  </ol>
  <em>Pro Tip: AI models read from left to right. The words at the very beginning of your prompt carry the most weight. Always put your main subject first, and leave style and technical settings for the end.</em>
</section>

<section id="camera-lighting-cheat-sheet">
  <h3>Camera and Lighting Cheat Sheet</h3>
  <p>If you want your AI images to look like real photographs, you need to use the language of photographers. Here is a quick cheat sheet of terms that modern AI models understand exceptionally well:</p>
  <ul>
    <li><strong>85mm Lens / f/1.8 Aperture:</strong> This is the holy grail for portraits. It creates a tack-sharp subject with a beautifully blurred, out-of-focus background (bokeh).</li>
    <li><strong>35mm Film / Analog Grain:</strong> Excellent for street photography. It adds a textured, retro, authentic look that breaks the clinical digital smoothness.</li>
    <li><strong>Volumetric Lighting / Cinematic Haze:</strong> Perfect for adding drama. It makes light rays visible through dust or fog, creating depth.</li>
    <li><strong>Rembrandt Lighting:</strong> A classic portrait lighting setup where light comes from the side, creating a small triangle of light on the shadowed cheek.</li>
    <li><strong>Golden Hour:</strong> The hour just after sunrise or before sunset. It floods the scene with warm, soft, orange light.</li>
  </ul>
</section>

<section id="style-cheat-sheet">
  <h3>Style and Aesthetic Cheat Sheet</h3>
  <p>Not everything has to be a photo. Sometimes you need a stylized vector icon, a storyboard sketch, or an illustration. Here is what to write:</p>
  <ul>
    <li><strong>Minimalist Flat Vector Illustration:</strong> Clean lines, solid colors, no gradients. Perfect for modern SaaS websites and UI designs.</li>
    <li><strong>Studio Ghibli Aesthetic:</strong> Soft hand-painted backgrounds, nostalgic clouds, anime characters, cozy colors.</li>
    <li><strong>Ukiyo-e Woodblock Print:</strong> Traditional Japanese art style with bold outlines and flat colors.</li>
    <li><strong>Double Exposure:</strong> Merges two images into one (e.g., a silhouette of a face filled with a dense pine forest).</li>
  </ul>
</section>

<section id="real-examples">
  <h2>Real Prompt Transformations: Before and After</h2>
  <p>To see how this works in practice, let’s look at how we can transform basic, robotic prompts into detailed, human-crafted descriptions:</p>
  
  <h3>Example 1: Food Photography</h3>
  <p><strong>Robotic Prompt:</strong> <code>Indian food samosa on a plate.</code></p>
  <p><strong>What's wrong:</strong> The AI will likely generate a clean, sterile samosa on a white plate with harsh white studio light. It will look like a cheap menu photo.</p>
  <p><strong>Polished Prompt:</strong> <code>A macro close-up shot of a golden-brown, crispy samosa, broken open in the middle with steam visibly rising, potato and pea filling showing, mint chutney dripping from the edge, placed on a rustic wooden board, red copper cups in the background, cinematic side lighting, shallow depth of field, warm color grading.</code></p>

  <h3>Example 2: Portrait Photography</h3>
  <p><strong>Robotic Prompt:</strong> <code>An Indian woman.</code></p>
  <p><strong>What's wrong:</strong> Too generic. The AI will output a stock portrait of a model with perfect, smoothed-out skin looking straight at the camera.</p>
  <p><strong>Polished Prompt:</strong> <code>A close-up candid portrait of an Indian woman laughing, wearing a traditional embroidered silk saree, soft monsoon rain in the background, warm golden hour sun filtering through leaves, shot on a Hasselblad 80mm lens, highly detailed skin textures, authentic look, film grain.</code></p>

  <h3>Example 3: Landscape & Architecture</h3>
  <p><strong>Robotic Prompt:</strong> <code>A mountain house.</code></p>
  <p><strong>What's wrong:</strong> A simple house on a mountain. Very boring layout.</p>
  <p><strong>Polished Prompt:</strong> <code>An architectural photograph of a modern glass-and-timber cabin perched on a rocky cliff in the Himalayas, surrounded by towering pine trees, dense morning mist rolling through the valley, warm lights glowing from inside the cabin, reflection on the wet wooden deck, wide-angle lens, shot on Fujifilm X-T5.</code></p>

  <p>By expanding your description to cover the surrounding environment, lighting, and camera details, you give the AI a rich canvas to work with.</p>
</section>

<section id="human-best-practices">
  <h2>My Personal Rules for Better Prompting</h2>
  <p>If you want to save time and credits, here are a few hard-won rules from our design desk:</p>
  <ol>
    <li><strong>Drop the Jargon:</strong> Don't stuff your prompts with terms like "hyperrealistic," "photorealistic," or "8K." Modern models like Midjourney V7 and Flux already generate high-quality outputs. Instead, describe real-world details like *skin pores*, *dust particles*, or *lens flare* to imply high quality.</li>
    <li><strong>Specify the Era:</strong> If you want a specific vibe, mention the year or decade. *“Mumbai street scene in 1970”* will automatically pull retro color grading, vintage cars, and period-accurate clothing.</li>
    <li><strong>Embrace the Monsoons and Gold:</strong> Especially for Indian-themed visuals, specifying weather like *monsoon rain*, *overcast sky*, or *golden hour sun* adds an authentic, rich atmosphere that standard studio lighting can't match.</li>
  </ol>
</section>

<section id="negative-prompts-intro">
  <h2>What About Negative Prompts?</h2>
  <p>Sometimes, telling the AI what <em>not</em> to draw is more important than telling it what you want. A negative prompt is simply a list of things you want excluded. While DALL-E 3 doesn't support dedicated negative fields, tools like Midjourney (using the <code>--no</code> flag) and Stable Diffusion let you filter out common AI artifacts like extra limbs, weird watermarks, or blurry backgrounds.</p>
  <em>If your characters keep turning up with weirdly warped hands or extra fingers, adding a quick negative list is the easiest way to force the AI to clean up its act.</em>
</section>

<section id="skip-the-struggle">
  <h2>Skip the Grind: Where to Find Ready-Made Prompts</h2>
  <p>Prompt engineering is fun, but it takes time. When you are working on a deadline for a client or trying to get social media creatives out, you don't always have hours to tweak words. That’s exactly why we built <strong>Promptro</strong>.</p>
  <p>We’ve created India's largest library of hand-tested, production-ready prompts designed for Midjourney, DALL-E 3, and Stable Diffusion. You can browse categories ranging from cinematic portraits and food styling to local festival creatives, copy the prompt with one click, swap in your own details, and get stunning results instantly.</p>
</section>
    `,
  },
  {
    slug: 'best-midjourney-prompts-2026',
    title: '50 Best Midjourney Prompts (From Cinematic to Real Indian Portraits)',
    metaTitle: '50 Best Midjourney Prompts: Portrait, Cinematic & Aesthetic | Promptro',
    metaDescription: 'Don\'t waste your Midjourney subscription credits. Copy our hand-tested Midjourney V7 prompts for cinematic street scenes, authentic Indian portraits, and abstract art.',
    keywords: 'best Midjourney prompts, Midjourney V7 prompts India, cinematic Midjourney prompts, portrait prompts, Midjourney guide',
    featuredImage: '/blog_midjourney_prompts.png',
    featuredImageAlt: 'A cinematic, highly detailed atmospheric portrait generated using Midjourney V7',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-15T00:00:00Z',
    updatedDate: '2026-06-06T12:00:00Z',
    readingTime: '15 min read',
    category: 'Prompt Libraries',
    tags: ['Midjourney', 'cinematic', 'portrait', 'fantasy', 'prompts 2026'],
    excerpt: 'At ₹800 to ₹2500+ a month, you don\'t want to waste your Midjourney GPU credits on trial and error. Here are 50 of our absolute best, copy-paste prompts that work in the real world.',
    toc: [
      { id: 'midjourney-pricing-reality', title: 'Why Midjourney Is Still Worth the INR Cost', level: 2 },
      { id: 'cinematic-prompts', title: 'Cinematic & Film Noir Prompts', level: 2 },
      { id: 'indian-portraits', title: 'Authentic Indian Portraits', level: 2 },
      { id: 'architectural-gems', title: 'Architecture & Dream Spaces', level: 2 },
      { id: 'sci-fi-fantasy', title: 'Fantasy & Sci-Fi Worldbuilding', level: 2 },
      { id: 'anime-prompts', title: 'Anime & Illustration Styles', level: 2 },
      { id: 'practical-parameters', title: 'Parameters You Actually Need to Know', level: 2 },
    ],
    faqs: [
      {
        question: 'Which Midjourney version should I be using?',
        answer: 'Always default to Midjourney V7 for standard prompts. However, if you are generating anime, manga, or flat vector illustrations, add the --niji 6 parameter at the end of your prompt for the best aesthetic translation.',
      },
      {
        question: 'How do I change the aspect ratio of my Midjourney image?',
        answer: 'Add the --ar parameter followed by the ratio at the very end of your prompt. For example, use --ar 16:9 for landscape banners, --ar 2:3 for mobile screens or portraits, and --ar 1:1 for Instagram posts.',
      },
      {
        question: 'Can I use Midjourney images for commercial client projects in India?',
        answer: 'Yes, but you must be on a paid subscription plan (Basic, Standard, or Pro). If you are generating images on a paid tier, you own the assets and can use them for commercial work, social media management, or website design.',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'how-to-use-negative-prompts', 'chatgpt-vs-gemini-ai-image-comparison'],
    content: `
<section id="midjourney-pricing-reality">
  <h2>Why Midjourney Is Still Worth the INR Cost</h2>
  <p>Let's talk money. With subscriptions starting at around $10/month (which translates to roughly ₹900+ after bank currency conversion fees and GST), Midjourney isn't cheap for freelance designers and boutique agencies in India. When you're paying out of pocket, every single click of the generate button costs you real money.</p>
  <p>Despite the cost, Midjourney V7 remains our studio's absolute favorite tool. Its aesthetic intelligence is unmatched. While DALL-E 3 is great at following instructions, it can look a bit too clinical or "cartoony." Midjourney understands texture, camera lenses, and cinematic styling in a way that feels genuinely artistic. To help you get your money's worth, we've compiled 50 of our most reliable, hand-tested prompts.</p>
</section>

<section id="cinematic-prompts">
  <h2>Cinematic &amp; Film Noir Prompts</h2>
  <p>These prompts are designed to create high-contrast, moody scenes that look like screenshots from a big-budget film. They work beautifully for website banners and landing pages.</p>
  <ol>
    <li><code>A lone yellow taxi cab driving through a rain-soaked Kolkata street at night, neon street signs reflecting in dark puddles, cinematic mood lighting, shot on 35mm lens, atmospheric haze, volumetric fog --ar 16:9 --v 7</code></li>
    <li><code>An aerial cinematic wide shot of a traveler standing at the edge of a vast Himalayan cliff during sunrise, golden mist filling the valley below, cool blue and warm gold color grade, shot on RED camera --ar 16:9 --v 7</code></li>
    <li><code>A cozy antique bookstore interior, dust particles floating in columns of afternoon sunlight, wooden shelves filled with old leather books, cinematic depth, vintage aesthetic --ar 16:9 --v 7</code></li>
    <li><code>A cyber-punk tea stall in a futuristic Mumbai bazaar, holographic advertisements glowing on wet asphalt, steam rising from a kettle, rich textures, volumetric lighting --ar 16:9 --v 7</code></li>
    <li><code>A moody jazz club, a saxophonist illuminated under a single spotlight, smoke swirling in the air, deep blue background, silhouette of the audience, cinematic lighting --ar 16:9 --v 7</code></li>
    <li><code>A train speeding past a crossing in rural Rajasthan during golden hour, dust kick-up, dramatic sunburst, retro warm grading, motion blur --ar 16:9 --v 7</code></li>
    <li><code>A detective in a trench coat standing under a flickering street lamp, rain-swept alley, dramatic shadows, noir style, high contrast --ar 16:9 --v 7</code></li>
    <li><code>A cyberpunk street market, colorful neon signs, steam rising from local food stalls, busy crowd, futuristic details, shot on 35mm film --ar 16:9 --v 7</code></li>
    <li><code>An abandoned glass greenhouse in a forest, overgrown vines, shafts of sunlight breaking through broken glass, dusty atmosphere, moody grading --ar 16:9 --v 7</code></li>
    <li><code>A futuristic control room, massive screens displaying blue data grids, neon rim lighting, operator sitting in silhouette, modern sci-fi look --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="indian-portraits">
  <h2>Authentic Indian Portraits</h2>
  <p>Creating realistic faces that look natural and avoid the creepy "polished plastic" look is hard. The secret is to specify raw textures, camera lenses, and authentic expressions.</p>
  <ol>
    <li><code>A close-up documentary portrait of an elderly Rajasthani man, deep laugh lines, weathered skin texture, wearing a colorful turban, soft natural window light, shot on an 85mm lens, f/1.8, shallow depth of field --ar 2:3 --v 7</code></li>
    <li><code>A candid street photo of a young Indian classical dancer sitting backstage, wearing traditional jewelry and a silk lehenga, dramatic side lighting casting soft shadows, quiet reflective expression, film grain, analog aesthetic --ar 2:3 --v 7</code></li>
    <li><code>A professional corporate headshot of a young female tech entrepreneur in a modern Bangalore office, blurred office background with green plants, confident smile, clean studio lighting, high-end commercial style --ar 2:3 --v 7</code></li>
    <li><code>A joyful portrait of children playing holi in a village courtyard, colorful powder explosion in mid-air, dynamic action freeze, sunlight catching water droplets, authentic candid smiles, shot on 50mm lens --ar 4:5 --v 7</code></li>
    <li><code>Portrait of a Kathakali dancer applying face paint, extreme close-up, dramatic side studio lighting, rich colors of green and red paint, fine details of skin and costume --ar 2:3 --v 7</code></li>
    <li><code>An Indian farmer in a mustard field, standing tall, warm sunlight hitting his face, vibrant yellow background, documentary style, realistic texture --ar 2:3 --v 7</code></li>
    <li><code>A street vendor in Delhi during winter, steam from his tea kettle wrapping around his face, warm smile, candid portrait, shot on 35mm film --ar 2:3 --v 7</code></li>
    <li><code>A high-fashion portrait of an Indian male model, modern designer kurta, neutral background, editorial lighting, sharp focus, 85mm lens --ar 2:3 --v 7</code></li>
    <li><code>A smiling grandmother in a rural village weaving basket on a porch, warm sunlight, gentle expression, highly detailed textures --ar 2:3 --v 7</code></li>
    <li><code>Close-up portrait of a young Indian groom in traditional sherwani, soft bokeh background of wedding lights, warm lighting, elegant style --ar 2:3 --v 7</code></li>
  </ol>
  <em>Pro Tip: If you get too much artificial smoothing on faces, try adding the parameter <code>--style raw</code> to your prompt. It reduces Midjourney's default artistic embellishments and gives you a much cleaner, photographic texture.</em>
</section>

<section id="architectural-gems">
  <h2>Architecture &amp; Dream Spaces</h2>
  <p>Perfect for interior designers, mood boards, and real estate concept renders.</p>
  <ol>
    <li><code>A minimalist wabi-sabi living room design, large arched concrete windows overlooking a rain-soaked courtyard, natural light, raw wood textures, beige linen sofa, serene interior photography --ar 16:9 --v 7</code></li>
    <li><code>A futuristic eco-friendly luxury villa built into a jungle cliff, cascading waterfalls, solar panels integrated into glass domes, lush greenery, photorealistic architectural concept render --ar 16:9 --v 7</code></li>
    <li><code>A luxury resort lobby inspired by Rajasthani palace architecture, white marble floors reflecting intricate archways, modern luxury furniture, soft warm ambient lighting, grand scale --ar 16:9 --v 7</code></li>
    <li><code>A modern apartment balcony in South Mumbai during monsoon, glass railing, wet wooden decking, plants, cozy seating with warm lights, view of the sea in background --ar 16:9 --v 7</code></li>
    <li><code>A concrete brutalist library interior, massive columns, towering bookshelves, skylight throwing long shadows on reading desks, silent atmospheric feel --ar 16:9 --v 7</code></li>
    <li><code>A luxury spa room, stone textures, running water, warm candle light, tropical plants, minimalist layout, photorealistic render --ar 16:9 --v 7</code></li>
    <li><code>A cozy attic bedroom, skylight window showing rain drops, bed with thick blankets, warm string lights, nostalgic mood --ar 16:9 --v 7</code></li>
    <li><code>A modern museum gallery, high ceilings, large abstract painting on a concrete wall, single visitor standing in silhouette, minimalist composition --ar 16:9 --v 7</code></li>
    <li><code>A mountain lodge dining room, stone fireplace with burning logs, large wooden dining table, panoramic glass window showing snow peaks --ar 16:9 --v 7</code></li>
    <li><code>A rooftop garden restaurant at night, string lights, city skyline in background, cozy seating, warm atmosphere --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="sci-fi-fantasy">
  <h2>Fantasy &amp; Sci-Fi Worldbuilding</h2>
  <p>Let your imagination run wild with these concepts designed for gaming grids, storyboards, and digital art projects.</p>
  <ol>
    <li><code>An ancient dragon perched on top of a futuristic skyscraper, glowing cybernetic wings, rainy night, neon reflections on scales, cyberpunk city skyline --ar 16:9 --v 7</code></li>
    <li><code>A floating island city in the sky, cascading waterfalls falling into the clouds below, fantasy stone architecture, flying ships, golden hour sun --ar 16:9 --v 7</code></li>
    <li><code>An astronaut sitting on a mossy stone throne in an ancient jungle temple, overgrown vines on spacesuit, shafts of light breaking through canopy --ar 16:9 --v 7</code></li>
    <li><code>A mystical glowing portal in the middle of a snowy pine forest, purple energy swirl, realistic lighting reflection on snow, mysterious mood --ar 16:9 --v 7</code></li>
    <li><code>An underwater kingdom with massive bioluminescent glass domes, futuristic submarines navigating between coral towers, deep blue gradient --ar 16:9 --v 7</code></li>
    <li><code>A giant ancient mechanical golem sitting in a desert valley, covered in sand and ruins, lone traveler standing in front looking up, scale and awe --ar 16:9 --v 7</code></li>
    <li><code>A magical forest pathway at night, glowing bioluminescent mushrooms, floating dust particles, soft purple and blue ambient light --ar 16:9 --v 7</code></li>
    <li><code>A futuristic city built inside a massive canyon, layers of suspended bridges, hover cars, vertical gardens, sunny clear sky, high-tech render --ar 16:9 --v 7</code></li>
    <li><code>A mystical wizard\'s library, floating spellbooks, glowing crystal balls, magical dust in the air, dark cozy study room --ar 16:9 --v 7</code></li>
    <li><code>A post-apocalyptic overgrown city, skyscrapers covered in ivy, deer grazing on a cracked highway, warm golden sun --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="anime-prompts">
  <h2>Anime &amp; Illustration Styles</h2>
  <p>For these, always remember to add <code>--niji 6</code> at the end. It changes Midjourney's rendering engine entirely to focus on hand-drawn, illustrated aesthetics.</p>
  <ol>
    <li><code>A young girl sitting on her balcony during a warm summer evening, eating fresh mangoes, soft pastel colors, Studio Ghibli style, nostalgic and peaceful mood --ar 16:9 --niji 6</code></li>
    <li><code>A slice-of-life anime scene of a busy train station in Tokyo during cherry blossom season, soft sunlight filtering through windows, vibrant colors, detailed background illustration --ar 16:9 --niji 6</code></li>
    <li><code>A samurai standing on a cliff overlooking a sea of clouds, hand-drawn manga style, ink sketch details, bold lines --ar 16:9 --niji 6</code></li>
    <li><code>A cozy kitchen with fresh baked bread on the table, soft steam, warm colors, anime movie keyframe, detailed layout --ar 16:9 --niji 6</code></li>
    <li><code>A futuristic anime city, flying cars, glowing billboards, dynamic camera angle, vibrant digital illustration --ar 16:9 --niji 6</code></li>
    <li><code>A wizard casting a spell, glowing magical circle, colorful particles, epic battle manga keyframe --ar 16:9 --niji 6</code></li>
    <li><code>A retro anime character portrait, 90s style, grainy cel animation look, soft eyes, detailed hair --ar 2:3 --niji 6</code></li>
    <li><code>A magical library with floating lanterns, warm colors, watercolor anime background, fantasy illustration --ar 16:9 --niji 6</code></li>
    <li><code>A giant robot standing in a grassy meadow under a blue sky, nostalgic clouds, anime movie style --ar 16:9 --niji 6</code></li>
    <li><code>A quiet street in Japan during night, soft vending machine glow, rainy reflections, slice-of-life anime aesthetic --ar 16:9 --niji 6</code></li>
  </ol>
</section>

<section id="practical-parameters">
  <h2>Parameters You Actually Need to Know</h2>
  <p>You don't need to memorize dozens of parameters. These four will do 95% of the heavy lifting:</p>
  <ul>
    <li><strong>--ar [X:Y]</strong> — Aspect ratio. Mandatory for anything that isn't a square.</li>
    <li><strong>--stylize [0-1000]</strong> — How artistic do you want the AI to be? Lower values (e.g. 50-100) stick closer to your prompt words. Higher values (e.g. 600-800) give Midjourney creative freedom to make it look prettier, though it might ignore some details.</li>
    <li><strong>--chaos [0-100]</strong> — Controls how different the 4 initial options are. Set it to 30 or 40 if you're stuck and want to see wild, varied ideas.</li>
    <li><strong>--v 7</strong> — The latest model version. Keep it on by default for the cleanest details and best text rendering.</li>
  </ul>
</section>
    `,
  },
  {
    slug: 'how-to-use-negative-prompts',
    title: 'How to Use Negative Prompts: Stop Letting AI Ruin Your Images',
    metaTitle: 'Mastering AI Negative Prompts: Fix Weird Hands & Faces | Promptro',
    metaDescription: 'Fed up with AI images having extra fingers, weird watermarks, or blurry faces? Learn how to use negative prompts to clean up your art in Stable Diffusion & Midjourney.',
    keywords: 'negative prompts list, how to fix AI hands, Stable Diffusion negative prompts, improve AI images, Midjourney no parameter',
    featuredImage: '/blog_negative_prompts.png',
    featuredImageAlt: 'Graphic illustration showing how a negative prompt filters out unwanted elements like blurry faces and extra fingers',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-28T00:00:00Z',
    updatedDate: '2026-06-06T12:00:00Z',
    readingTime: '12 min read',
    category: 'Tips & Techniques',
    tags: ['negative prompts', 'Stable Diffusion', 'tips', 'AI image quality'],
    excerpt: 'There is nothing worse than generating a gorgeous portrait only to find out the character has six fingers or a distorted face. Here is how to use negative prompts to fix it.',
    toc: [
      { id: 'anatomy-frustrations', title: 'The Ultimate Mood Killer', level: 2 },
      { id: 'how-it-works-practically', title: 'How Negative Prompting Actually Works', level: 2 },
      { id: 'cfg-guidance-science', title: 'The Science of CFG Scale and Vector Steering', level: 3 },
      { id: 'universal-negative-list', title: 'The Universal "Clean-Up" List', level: 2 },
      { id: 'negative-by-tool', title: 'How to Use Negatives in Different Tools', level: 2 },
      { id: 'stablediffusion-parentheses', title: 'Stable Diffusion: Parentheses and Weights', level: 3 },
      { id: 'dalle3-workarounds', title: 'DALL-E 3: Exclusions in Positive Prompts', level: 3 },
      { id: 'avoid-overloading', title: 'The Danger of Prompt Overloading', level: 2 },
    ],
    faqs: [
      {
        question: 'Does DALL-E 3 support negative prompts?',
        answer: 'No, DALL-E 3 doesn\'t have a separate box for negative inputs. Instead, you have to write exclusion rules inside your main prompt, like: "Create a kitchen scene. Do not include any people, pets, or text on the walls."',
      },
      {
        question: 'What is the best negative prompt to fix weird hands and fingers?',
        answer: 'Use a combinations of: "extra limbs, extra fingers, missing fingers, fused fingers, poorly drawn hands, malformed limbs, distorted hand structure." It forces the AI model to avoid those specific pixel arrangements.',
      },
      {
        question: 'Will negative prompts slow down my image generation time?',
        answer: 'No. Negative prompting runs in parallel during the diffusion denoising steps. It does not add any rendering time or cost more credits.',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'best-midjourney-prompts-2026', 'chatgpt-vs-gemini-ai-image-comparison'],
    content: `
<section id="anatomy-frustrations">
  <h2>The Ultimate Mood Killer</h2>
  <p>We’ve all been there. You write a perfect, detailed prompt, wait anxiously for the rendering bar to hit 100%, and see a stunning image—except the character has six fingers, two heads, or a weird, distorted face. It's the ultimate mood killer.</p>
  <p>In the professional design world—whether you are making social media creatives for a startup in Delhi or storyboards for a production house in Mumbai—you can’t hand over messy, anatomically incorrect images to a client. They will notice immediately. This is where <strong>Negative Prompts</strong> come in. They are literally the "exclusion list" that tells the AI what to avoid at all costs.</p>
  <p>By understanding how to use them, you transition from someone who just gets lucky with random generations to a professional who controls the AI output.</p>
</section>

<section id="how-it-works-practically">
  <h2>How Negative Prompting Actually Works</h2>
  <p>AI image models (like Stable Diffusion) work through a process called "diffusion." They start with a block of random static noise and gradually clean up that noise, step-by-step, until it matches the patterns in your positive prompt. </p>
  <p>A negative prompt works by applying guidance in the opposite direction. If you add <em>"blurry"</em> to your negative prompt, the AI mathematically pushes the pixels away from anything it learned was blurry during training. By combining specific exclusion terms, you can dramatically improve the clarity, composition, and anatomy of your generations.</p>
</section>

<section id="cfg-guidance-science">
  <h3>The Science of CFG Scale and Vector Steering</h3>
  <p>When you generate an image, the AI uses a parameter called **CFG Scale (Classifier Free Guidance)**. This scale decides how strictly the model follows your prompt. If your CFG scale is high, the model tries very hard to fit every positive word you wrote while pushing away from the negative words. </p>
  <p>However, if your CFG scale is too high, the image can look burned, over-saturated, or full of weird artifacts. For most models, a CFG scale of **5 to 8** is the sweet spot. It provides enough guidance to follow your positive/negative prompt vectors without distorting the pixels.</p>
</section>

<section id="universal-negative-list">
  <h2>The Universal "Clean-Up" List</h2>
  <p>We keep a text file pinned on our desktop containing a set of universal terms. Whenever a model starts outputting weird proportions or low-resolution textures, we copy and paste this directly into the negative prompt field:</p>
  
  <h3>1. To Fix Bad Anatomy and Faces</h3>
  <p><code>extra limbs, extra fingers, missing fingers, deformed hands, poorly drawn face, asymmetric eyes, bad anatomy, double faces, disfigured, malformed body parts, fused fingers, bad proportions, distorted fingers</code></p>
  
  <h3>2. To Fix Low-Resolution and Artificial Smoothness</h3>
  <p><code>blurry, low quality, pixelated, jpeg artifacts, compression noise, grainy, low-res, generic render, plastic skin, smoothed skin, flat colors, out of focus</code></p>

  <h3>3. To Prevent Unwanted Branding</h3>
  <p><code>watermark, signature, text, logo, username, frame, border, stamp, copyright marks, margins, letters, words</code></p>
  
  <em>Pro Tip: If you are using Stable Diffusion, you can use "embeddings" or "textual inversions" (like EasyNegative or BadHandv4) which package dozens of these negative terms into a single word shortcut. It saves a lot of typing!</em>
</section>

<section id="negative-by-tool">
  <h2>How to Use Negatives in Different Tools</h2>
  <p>Different tools handle negative prompting differently. Here is how to use them without getting confused:</p>
  
  <h3>Midjourney V7</h3>
  <p>Midjourney doesn't have a separate text box. Instead, you add the <code>--no</code> flag at the very end of your prompt, followed by the things you want to exclude. Keep it simple and comma-separated.</p>
  <p><strong>Example:</strong> <code>A futuristic office lounge in Noida, glass walls, lush indoor plants --no people, desks, computers, watermarks --ar 16:9</code></p>
</section>

<section id="stablediffusion-parentheses">
  <h3>Stable Diffusion: Parentheses and Weights</h3>
  <p>In Stable Diffusion (using interfaces like Automatic1111, ComfyUI, or Forge), you can control the importance of individual negative words by wrapping them in parentheses and assigning numerical weights. </p>
  <ul>
    <li>Wrapping a word in parentheses increases its weight by 1.1x. For example: <code>(blurry)</code></li>
    <li>Adding a colon and a number allows exact weighting. For example: <code>(extra limbs:1.35)</code> tells the AI to avoid extra limbs with 1.35 times the normal priority.</li>
    <li>Conversely, using weights below 1.0 reduces the priority. For example: <code>(vintage:0.8)</code> subtly discourages retro aesthetics without banning them completely.</li>
  </ul>
  <p>If you find that a universal negative list is ruining your positive styling (e.g., making a gloomy, rainy scene too bright), try reducing the weights of contrast-altering words like "shadows" or "darkness" in your negative field.</p>
</section>

<section id="dalle3-workarounds">
  <h3>DALL-E 3: Exclusions in Positive Prompts</h3>
  <p>Since DALL-E 3 (via ChatGPT) doesn't have a negative input box, you must integrate exclusion rules directly into your natural language prompt. However, DALL-E 3 sometimes gets confused when you use negative words like "no" or "without," because it occasionally associates the noun with the scene anyway (e.g., "no apples" might generate apples because the word "apples" is present). </p>
  <p>To bypass this, use active positive language to describe the absence. Instead of writing <em>"a park with no people,"</em> write <em>"an empty, desolate park, silent and completely deserted."</em> This guides the probability engine toward empty settings without using words that might trigger unwanted details.</p>
</section>

<section id="avoid-overloading">
  <h2>The Danger of Prompt Overloading</h2>
  <p>A common mistake beginners make is pasting a 200-word block of negative prompts they found on a forum. Overloading the negative prompt confuses the model. If you tell it to avoid "everything," it will start ignoring your main positive prompt or create weird, dull color palettes.</p>
  <p>Start with a short, clean positive prompt. Only add negative terms when you notice a specific problem (like watermarks appearing, or bad hands). Treat negative prompting as a troubleshooting tool, not a default essay.</p>
</section>
    `,
  },
  {
    slug: 'chatgpt-vs-gemini-ai-image-comparison',
    title: 'ChatGPT vs Gemini: The Honest AI Image Generation Showdown (2026)',
    metaTitle: 'ChatGPT vs Gemini AI Image Comparison: DALL-E 3 vs Imagen 3 | Promptro',
    metaDescription: 'DALL-E 3 vs Imagen 3. We test ChatGPT and Gemini head-to-head. Read our honest review on face consistency, regional Hinglish prompts, and inpainting.',
    keywords: 'ChatGPT vs Gemini image generator, DALL-E 3 vs Imagen 3, AI face consistency, Hinglish prompts, best AI image generator India',
    featuredImage: '/blog_chatgpt_vs_gemini.png',
    featuredImageAlt: 'OpenAI ChatGPT and Google Gemini image generation comparison graphic showing character consistency differences',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-06-06T12:00:00Z',
    updatedDate: '2026-06-06T12:00:00Z',
    readingTime: '12 min read',
    category: 'Comparison Guides',
    tags: ['ChatGPT', 'Gemini', 'DALL-E 3', 'Imagen 3', 'Face Consistency'],
    excerpt: 'ChatGPT or Gemini? If you are trying to build consistent characters or edit details on a canvas, there is a clear winner. We break down the real-world comparison.',
    toc: [
      { id: 'cut-the-pr-talk', title: 'Cutting Through the Marketing Hype', level: 2 },
      { id: 'face-consistency-showdown', title: 'The Character & Face Consistency Test', level: 2 },
      { id: 'locking-seeds-chatgpt', title: 'Deep Dive: How to Extract and Lock Seeds in DALL-E 3', level: 3 },
      { id: 'inpainting-brush-wars', title: 'The Selective Inpainting Brush', level: 2 },
      { id: 'regional-language-test', title: 'GEO Edge: Gemini\'s Hinglish and Hindi Translation', level: 2 },
      { id: 'detail-and-lighting', title: 'Where Gemini Actually Wins: Lighting & Textures', level: 2 },
      { id: 'comparison-matrix-table', title: 'Quick Comparison Matrix', level: 2 },
      { id: 'final-verdict', title: 'My Final Verdict for Creators', level: 2 },
    ],
    faqs: [
      {
        question: 'Why does Gemini make characters look different in every prompt?',
        answer: 'Gemini (Imagen 3) generates a completely new random noise seed for every single prompt. It doesn\'t allow you to lock or reference previous image IDs, and it lacks the continuous conversational context required to lock facial features.',
      },
      {
        question: 'How does ChatGPT keep faces consistent?',
        answer: 'ChatGPT combines DALL-E 3 with GPT-4o. GPT-4o dynamically rewrites your prompt to include the exact description of the original character (hair pattern, eye color, nose shape, clothing) and can pass the exact seed number behind the scenes to keep the face consistent.',
      },
      {
        question: 'Which tool is better for spelling words correctly?',
        answer: 'ChatGPT (DALL-E 3) is much more reliable at text rendering. If you ask it to write "CHAI POINT" on a shop sign, it gets the spelling right almost every time. Gemini has improved but still occasionally drops letters or introduces typos.',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'how-to-use-negative-prompts'],
    content: `
<section id="cut-the-pr-talk">
  <h2>Cutting Through the Marketing Hype</h2>
  <p>If you're deciding between a ChatGPT Plus subscription and Gemini Advanced for design work, you’ve probably read the glowing corporate press releases. Both Google and OpenAI claim their models generate "breathtaking photorealistic art" and follow "complex natural language instructions."</p>
  <p>But let's cut through the marketing jargon. Our team spent a week testing ChatGPT (DALL-E 3) and Gemini (Imagen 3) head-to-head on real-world projects—like creating storyboards for an Indian startup campaign and generating food mockups. Here is our honest, hands-on review on who actually wins for real design work in 2026.</p>
</section>

<section id="face-consistency-showdown">
  <h2>The Character &amp; Face Consistency Test</h2>
  <p>If you're trying to build a brand mascot, illustrate a story, or design a multi-post Instagram campaign for a local business, you need <strong>face consistency</strong>. You need the exact same character to appear in different scenes, with different poses and clothes, without their face morphing into a different person.</p>
  <p>This is where <strong>ChatGPT wins by a landslide</strong>, while Google Gemini is practically unusable:</p>
  <ul>
    <li><strong>ChatGPT (DALL-E 3 + GPT-4o):</strong> When you ask ChatGPT to modify an image, GPT-4o acts as an intelligent intermediary. It remembers your character's exact features (e.g., hair texture, skin tone, clothing style) and rewrites the prompt internally. It also supports seed tracking, allowing you to reference the specific generation ID to maintain facial consistency across the conversation.</li>
    <li><strong>Google Gemini (Imagen 3):</strong> Gemini generates every image from scratch. Even if you ask it to "use the same person from the previous image," it starts with a completely new random noise seed. The result? Your character will have a different jawline, nose, and eye shape in the next generation. For storyboards or mascot creation, this "face shifting" is a massive dealbreaker.</li>
  </ul>
</section>

<section id="locking-seeds-chatgpt">
  <h3>Deep Dive: How to Extract and Lock Seeds in DALL-E 3</h3>
  <p>To successfully lock character faces in ChatGPT, you need to understand how to pull seed values. DALL-E 3 assigns a unique number to every generated image, representing the mathematical starting point of the diffusion process. Here is how you can use it:</p>
  <ol>
    <li>Ask ChatGPT to generate your character (e.g., *a young Indian boy in a school uniform reading a book*).</li>
    <li>Once generated, click the image. In the top right corner, click the 'Info' icon. It will display the raw prompt that GPT-4o generated and the seed number (e.g., <code>Seed: 382910471</code>).</li>
    <li>In your next prompt, reference this seed directly: <em>"Using seed 382910471 and maintaining the identical character details, show him walking home from school, waving at a friend."</em></li>
  </ol>
  <p>This method restricts the DALL-E 3 noise generator to the same initial vector space, resulting in near-perfect facial structure preservation.</p>
</section>

<section id="inpainting-brush-wars">
  <h2>The Selective Inpainting Brush</h2>
  <p>Imagine you generate a perfect character, but you want to change just their shirt, or swap the background from a modern office to a cafe in Noida. You shouldn't have to regenerate the entire image from scratch.</p>
  <p>ChatGPT has a built-in <strong>Select &amp; Edit canvas brush</strong>. You click the image, highlight the area you want to change (like a shirt), and type <em>"change to a blue kurta"</em>. DALL-E 3 edits only the highlighted pixels, leaving the character's face and background 100% untouched. Gemini does not offer an in-canvas brush editor that matches this level of precision, forcing you to rely on complex text prompts that often regenerate the entire layout anyway.</p>
</section>

<section id="regional-language-test">
  <h2>GEO Edge: Gemini's Hinglish and Hindi Translation</h2>
  <p>It’s not a complete defeat for Google. One area where Gemini genuinely shines is its understanding of regional Indian languages and Hinglish (Hindi written in the English script).</p>
  <p>Google has spent years mapping regional search queries in India. If you prompt Gemini with something like: <br/>
  <code>"Ek purana Rajasthani killa during monsoon season, dramatic sunset, highly realistic"</code><br/>
  Gemini understands the cultural context of "purana killa" (old fort) perfectly and renders a gorgeous ancient sandstone fortress with dark monsoon clouds. ChatGPT can handle this, but it sometimes gets confused by the Hinglish phrasing and defaults to generic western-style medieval castles.</p>
</section>

<section id="detail-and-lighting">
  <h2>Where Gemini Actually Wins: Lighting &amp; Textures</h2>
  <p>When it comes to standalone images where you don't need character consistency, Gemini (Imagen 3) has a major aesthetic advantage:</p>
  <ul>
    <li><strong>Photorealistic Skin:</strong> Gemini renders skin pores, sweat droplets, hair strands, and fabric weaves with jaw-dropping accuracy. DALL-E 3 has a habit of over-smoothing skin, giving it a plastic, cartoon-like "vector art" finish unless you write very complex photographic prompts.</li>
    <li><strong>Light Physics:</strong> Gemini handles reflections, refraction through glass, and complex shadows (like light filtering through tree leaves) with high physical accuracy.</li>
  </ul>
  <em>If your workflow is focused on standalone architectural visualizations, landscape art, or product shots (like a cosmetic bottle mockup), Gemini's output looks significantly more premium and less "AI-generated."</em>
</section>

<section id="comparison-matrix-table">
  <h2>Quick Comparison Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>ChatGPT (DALL-E 3 / GPT-4o)</th>
        <th>Gemini (Imagen 3)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Face Consistency</strong></td>
        <td>Excellent (via Seed locking and GPT-4o memory)</td>
        <td>Poor (faces shift completely between prompts)</td>
      </tr>
      <tr>
        <td><strong>Selective Editing</strong></td>
        <td>Yes (Canvas brush tool to change specific details)</td>
        <td>No (Requires text-only regenerations)</td>
      </tr>
      <tr>
        <td><strong>Hinglish/Hindi Prompts</strong></td>
        <td>Good, but occasionally yields generic western details</td>
        <td>Excellent (Very strong local cultural context)</td>
      </tr>
      <tr>
        <td><strong>Text in Image</strong></td>
        <td>Outstanding (spells signs and labels correctly)</td>
        <td>Moderate (improved, but still prone to typos)</td>
      </tr>
      <tr>
        <td><strong>Skin &amp; Fabric Texture</strong></td>
        <td>Good (tends to look plastic or illustrative)</td>
        <td>Outstanding (highly realistic pores and weaves)</td>
      </tr>
      <tr>
        <td><strong>Conversational Refinement</strong></td>
        <td>Seamless (keeps track of changes over 10+ turns)</td>
        <td>Good, but resets styles after a few turns</td>
      </tr>
    </tbody>
  </table>
</section>

<section id="final-verdict">
  <h2>My Final Verdict for Creators</h2>
  <p>The choice comes down to what you are building:</p>
  <p>Choose <strong>ChatGPT</strong> if you are a content creator, storyboard artist, or brand designer who needs consistent characters, sequential storytelling, or precise text labels. The combination of conversation memory, seed control, and the canvas edit brush makes it the only tool that can deliver professional character workflows.</p>
  <p>Choose <strong>Gemini</strong> if you are an interior designer, landscape artist, or photographer who needs standalone, high-fidelity renders with perfect lighting and realistic textures. It produces the most beautiful single-shot outputs in the industry.</p>
</section>
    `,
  },
  {
    slug: 'muharram-ai-image-prompts-guide',
    title: 'Muharram AI Image Prompts: Cinematic Karbala & Calligraphy Templates (2026)',
    metaTitle: 'Muharram AI Image Prompts: Cinematic Karbala & Calligraphy | Promptro',
    metaDescription: 'Create emotional and high-quality Muharram images with our copy-paste Midjourney, DALL-E, and Stable Diffusion prompts. Includes Karbala scene templates and Arabic calligraphy guides.',
    keywords: 'Muharram AI prompts, Ashura Midjourney prompts, Ya Hussain calligraphy AI, Karbala image prompts, Islamic AI art',
    featuredImage: '/blog_muharram_prompts.png',
    featuredImageAlt: 'A high-quality cinematic illustration of a Muharram procession under a moody dark sky',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-06-13T12:00:00Z',
    updatedDate: '2026-06-13T12:00:00Z',
    readingTime: '10 min read',
    category: 'Prompt Libraries',
    tags: ['Muharram', 'Midjourney', 'calligraphy', 'Karbala', 'prompts'],
    excerpt: 'Learn how to write and copy high-quality AI prompts to generate cinematic Muharram art, Tazia processions, and beautiful Islamic calligraphy using Midjourney and DALL-E 3.',
    toc: [
      { id: 'importance-muharram-visuals', title: 'The Importance of Muharram Visuals in AI', level: 2 },
      { id: 'cinematic-karbala-prompts', title: 'Cinematic Karbala & Ashura Scene Prompts', level: 2 },
      { id: 'procession-tazia-prompts', title: 'Tazia & Mourning Procession Prompts', level: 2 },
      { id: 'arabic-calligraphy-prompts', title: 'Ya Hussain & Ashura Arabic Calligraphy Prompts', level: 2 },
      { id: 'best-parameters-tips', title: 'Best Parameters & Tips for Muharram AI Art', level: 2 },
      { id: 'skip-the-grind-muharram', title: 'Generate Premium Muharram Art Instantly on Promptro', level: 2 },
    ],
    faqs: [
      {
        question: 'Which AI tool is best for generating Arabic Calligraphy for Muharram?',
        answer: 'DALL-E 3 (via ChatGPT) is the most reliable tool for rendering correct letters. However, Midjourney V7 with --style raw can generate stunning stylized calligraphy backgrounds, which you can later touch up with design tools.',
      },
      {
        question: 'How can I make the Muharram images look cinematic instead of cartoonish?',
        answer: 'Use keywords like "cinematic lighting", "dust particles in light rays", "volumetric fog", "shot on 35mm film", and avoid words like "photorealistic" or "8K".',
      },
      {
        question: 'Are these AI prompts free to use commercially?',
        answer: 'Yes, you can copy, edit, and use these prompts for creating Muharram banners, posters, and social media posts for your clients or pages.',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'best-midjourney-prompts-2026', 'how-to-use-negative-prompts'],
    content: `
<section id="importance-muharram-visuals">
  <h2>The Importance of Muharram Visuals in AI</h2>
  <p>Muharram marks the beginning of the Islamic Hijri calendar. It holds deep religious and historical significance for Muslims, especially Shia communities who commemorate the martyrdom of Imam Hussain (AS), the grandson of Prophet Muhammad, at the Battle of Karbala. The period of mourning (Aza) calls for solemn, respectful, and emotionally moving imagery.</p>
  <p>With the rise of generative AI, creators, social media managers, and community leaders often look for stunning visuals representing this period of mourning. Whether you need a digital banner for a Majlis, a flyer for a procession, or respectful artistic illustrations of historical themes, using Midjourney, DALL-E, or Stable Diffusion can help you design beautiful, high-quality graphics. In this guide, we provide hand-tested prompts that respectfully capture the essence of Muharram.</p>
</section>

<section id="cinematic-karbala-prompts">
  <h2>Cinematic Karbala &amp; Ashura Scene Prompts</h2>
  <p>Karbala visual representations carry deep emotional weight. These prompts focus on cinematic landscape and symbolic representations of the desert of Karbala, the shrine of Imam Hussain, or historical symbols like a lone horse or tent under a dramatic sky.</p>
  <ol>
    <li><strong>The Shrine of Imam Hussain:</strong> <code>A cinematic wide shot of the holy shrine of Imam Hussain in Karbala at dusk, warm golden lights reflecting on the marble floor, dark cloudy sky with a crescent moon, atmospheric haze, volumetric lighting, shot on 35mm lens, high contrast, respect and solemn mood --ar 16:9 --v 7</code></li>
    <li><strong>The Desert of Karbala:</strong> <code>A historical cinematic shot of a lone white tent standing in the middle of a vast sand desert under a dramatic dark red sunset sky, dust particles in the air, sunset glow, cinematic lighting, historical art direction, high detail, shot on RED camera --ar 16:9 --v 7</code></li>
    <li><strong>Symbolic Zuljanah:</strong> <code>A highly detailed, emotional close-up shot of a majestic white horse standing in a desert, looking down in sorrow, dark storm clouds in the background, warm light breaking through the clouds, dramatic side lighting, cinematic composition, film grain --ar 16:9 --v 7</code></li>
    <li><strong>The Golden Dome of Karbala:</strong> <code>A macro shot of the golden dome of Hazrat Abbas shrine, detailed calligraphy on the dome, warm ambient light, blue hour sky with stars, cinematic depth of field, photorealistic texture --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="procession-tazia-prompts">
  <h2>Tazia &amp; Mourning Procession Prompts</h2>
  <p>Tazias (models of the tomb of Imam Hussain) and Alam banners are prominent parts of Muharram processions (Julus). These prompts capture the atmospheric details of these processions with respect and accuracy.</p>
  <ol>
    <li><strong>The Alam Banner:</strong> <code>A powerful close-up of a black silk banner (Alam) with golden Arabic calligraphy, flapping in the wind, a metallic hand (Panjetan symbol) on top of the banner, dark moody sky with warm sun rays filtering through, shallow depth of field, high contrast, cinematic atmosphere --ar 2:3 --v 7</code></li>
    <li><strong>Tazia Procession at Night:</strong> <code>An atmospheric documentary photograph of a large Tazia procession on the streets of Lucknow at night, warm yellow street lamps, crowds in dark clothing walking in silhouette, smoke and mist, shot on 50mm f/1.8 lens, analog film grain, authentic street photography style --ar 16:9 --v 7</code></li>
    <li><strong>Majlis Gathering (Solemn Atmosphere):</strong> <code>A wide shot of a traditional Majlis (mourning assembly) inside an old Islamic hall, black carpets and tapestries on walls, people sitting respectfully in low-key warm lighting, shadows and depth, peaceful and solemn atmosphere, soft lighting --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="arabic-calligraphy-prompts">
  <h2>Ya Hussain &amp; Ashura Arabic Calligraphy Prompts</h2>
  <p>Text generation in AI has improved dramatically with models like DALL-E 3 and Midjourney V7. You can now generate beautiful calligraphic text in Arabic for Muharram banners.</p>
  <ol>
    <li><strong>"Ya Hussain" in Golden Thuluth Script:</strong> <code>Beautiful, intricate Arabic calligraphy of the words 'Ya Hussain' in glowing golden Thuluth script, set against a dark black textured stone background, dynamic red fluid light leaks, premium studio lighting, high contrast, clean vector style details --ar 1:1 --v 7</code></li>
    <li><strong>"Ashura" Arabic Typography Poster:</strong> <code>A minimalist design poster featuring the word 'Ashura' written in elegant white Arabic calligraphy, centered on a deep red and charcoal black gradient background, fine paper texture, premium minimalist aesthetic, modern Islamic graphic design --ar 2:3 --v 7</code></li>
    <li><strong>Islamic Calligraphy Banner:</strong> <code>A horizontal digital banner with beautiful Arabic calligraphy expressing condolences for Ashura, gold lettering, dark green silk texture background with soft patterns, high-end commercial graphic design look --ar 16:9 --v 7</code></li>
  </ol>
</section>

<section id="best-parameters-tips">
  <h2>Best Parameters &amp; Tips for Muharram AI Art</h2>
  <p>To ensure your generated images remain respectful and look highly professional, follow these simple guidelines:</p>
  <ul>
    <li><strong>Keep the colors dark and rich:</strong> Muharram visuals rely on dark colors like black, charcoal grey, deep red, forest green, and gold. Specify these in your prompts to set the correct tone (e.g., *dark moody atmosphere*, *low-key lighting*).</li>
    <li><strong>Use the style raw parameter:</strong> When using Midjourney, add <code>--style raw</code> at the end. This prevents the model from generating over-saturated or cartoonish colors and keeps the visual output realistic and respect-appropriate.</li>
    <li><strong>Control aspect ratios:</strong> Use <code>--ar 16:9</code> for banners and desktop backgrounds, or <code>--ar 2:3</code> for posters, status updates, and mobile wallpapers.</li>
  </ul>
</section>

<section id="skip-the-grind-muharram">
  <h2>Generate Premium Muharram Art Instantly on Promptro</h2>
  <p>Designing custom festival cards and event flyers during Muharram takes time. If you want to skip the prompt tweaking and trial-and-error, you can browse and copy hand-tested AI prompts directly from <strong><a href="https://promptro.in" target="_blank" rel="noopener noreferrer">Promptro</a></strong>.</p>
  <p>Promptro is India&#39;s premier prompt directory. It features hundreds of curated, copy-paste prompts tailored for Midjourney V7, DALL-E 3, and Stable Diffusion. You can browse specific regional, religious, and commercial styling templates, copy them with one click, swap in your custom text, and generate breathtaking visuals instantly.</p>
</section>
    `,
  },
  {
    slug: 'top-ai-prompts-for-virtual-travel-cityscapes',
    title: 'Top AI Prompts for Virtual Travel & Cityscapes',
    metaTitle: 'Best AI Travel Prompts for Midjourney & DALL-E | Promptro',
    metaDescription: 'Discover the best AI prompts for creating stunning virtual travel destinations, futuristic cityscapes, and minimalist architecture.',
    keywords: 'AI travel prompts, cityscapes, Midjourney travel, DALL-E architecture, Promptro',
    featuredImage: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop',
    featuredImageAlt: 'Futuristic Cyberpunk Cityscape at night',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-07-09T00:00:00Z',
    updatedDate: '2026-07-09T00:00:00Z',
    readingTime: '5 min read',
    category: 'Inspiration',
    tags: ['Travel', 'Architecture', 'Sci-Fi', 'Cityscapes'],
    excerpt: 'Want to travel the world (and the future) without leaving your desk? Here are the top travel and cityscape AI prompts directly from the Promptro community.',
    toc: [
      { id: 'intro', title: 'Virtual Travel with AI', level: 2 },
      { id: 'cyberpunk-city', title: 'The Cyberpunk Cityscape', level: 2 },
      { id: 'minimalist-arch', title: 'Minimalist Architecture Escapes', level: 2 },
    ],
    faqs: [
      {
        question: 'How do I use these travel prompts?',
        answer: 'Simply copy the prompt text and paste it into your favorite AI image generator like Midjourney or DALL-E 3.',
      }
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt'],
    content: `
<section id="intro">
  <h2>Virtual Travel with AI</h2>
  <p>AI image generation has opened up a whole new world of virtual travel. Whether you want to visualize a highly advanced futuristic Tokyo or a serene, minimalist concrete villa in the hills, AI can take you there in seconds. In this post, we showcase some of the most loved travel and architecture prompts uploaded right here on Promptro.</p>
</section>

<section id="cyberpunk-city">
  <h2>The Cyberpunk Cityscape</h2>
  <p>If you're a fan of Sci-Fi travel, this prompt is a must-try. It generates incredibly detailed, neon-drenched futuristic cities that look straight out of a high-budget movie.</p>
  <figure>
    <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop" alt="Cyberpunk Cityscape" />
    <figcaption>A highly detailed cyberpunk cityscape at night.</figcaption>
  </figure>
  <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 my-6">
    <h4 class="text-sm font-bold text-primary mb-2">Prompt:</h4>
    <code class="text-sm text-[#4a445f] dark:text-[#c4bed6] block p-3 bg-white/50 dark:bg-black/20 rounded-lg">A highly detailed cyberpunk cityscape at night, flying cars, neon lights reflecting on wet streets, cinematic lighting, 8k resolution, unreal engine 5 render --ar 16:9 --v 6.0</code>
    <a href="/prompt/82cbce5b-14ce-406f-8d89-36293aa3dca1" class="mt-4 inline-block text-xs font-bold text-white bg-primary px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">View Prompt Details</a>
  </div>
</section>

<section id="minimalist-arch">
  <h2>Minimalist Architecture Escapes</h2>
  <p>For those who prefer a calm, modern aesthetic for their virtual getaways, this minimalist architecture prompt delivers clean lines and beautiful concrete textures. Perfect for visualizing a modern luxury travel destination.</p>
  <figure>
    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop" alt="Minimalist Architecture" />
    <figcaption>Clean minimalist concrete architecture.</figcaption>
  </figure>
  <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 my-6">
    <h4 class="text-sm font-bold text-primary mb-2">Prompt:</h4>
    <code class="text-sm text-[#4a445f] dark:text-[#c4bed6] block p-3 bg-white/50 dark:bg-black/20 rounded-lg">Clean minimalist concrete architecture, modern villa overlooking the ocean, golden hour lighting, architectural photography, hyper-realistic, 8k --ar 16:9</code>
    <a href="/prompt/e970645d-9699-47df-ad52-b45974007b1b" class="mt-4 inline-block text-xs font-bold text-white bg-primary px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">View Prompt Details</a>
  </div>
</section>
    `,
  },
];

export default posts;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slugs: string[]): BlogPost[] {
  return posts.filter((p) => slugs.includes(p.slug));
}
