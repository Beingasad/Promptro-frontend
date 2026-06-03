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
    title: 'What Is an AI Image Prompt? A Complete Beginner\'s Guide',
    metaTitle: 'What Is an AI Image Prompt? Complete Guide 2026 | Promptro',
    metaDescription: 'Learn what AI image prompts are, how they work, and how to write better prompts for Midjourney, DALL-E and Stable Diffusion. Complete beginner\'s guide by Promptro.',
    keywords: 'AI image prompt, what is a prompt, how to write AI prompts, Midjourney prompts, DALL-E prompts, beginner AI guide',
    featuredImage: '/blog_ai_prompt_guide.png',
    featuredImageAlt: 'Colorful AI-generated digital artwork showing the power of AI image prompts',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-01T00:00:00Z',
    updatedDate: '2026-06-03T00:00:00Z',
    readingTime: '6 min read',
    category: 'Beginner Guides',
    tags: ['AI prompts', 'beginners', 'Midjourney', 'DALL-E', 'guide'],
    excerpt: 'An AI image prompt is the text instruction you give to an AI image generator. Discover how prompts work, why they matter, and how to write ones that create stunning visuals every time.',
    toc: [
      { id: 'what-is-a-prompt', title: 'What Is an AI Image Prompt?', level: 2 },
      { id: 'how-prompts-work', title: 'How Prompts Work', level: 2 },
      { id: 'prompt-anatomy', title: 'Anatomy of a Great Prompt', level: 2 },
      { id: 'prompt-examples', title: 'Real Prompt Examples', level: 2 },
      { id: 'best-practices', title: 'Best Practices for Writing Prompts', level: 2 },
      { id: 'negative-prompts', title: 'What Are Negative Prompts?', level: 2 },
      { id: 'where-to-find', title: 'Where to Find Ready-Made Prompts', level: 2 },
    ],
    faqs: [
      {
        question: 'What is an AI image prompt?',
        answer: 'An AI image prompt is a text description that you provide to an AI image generation tool like Midjourney or DALL-E. The AI reads your prompt and generates an image that matches your description. The more specific and detailed your prompt, the better the results.',
      },
      {
        question: 'How long should an AI image prompt be?',
        answer: 'There is no fixed length, but most effective prompts are between 20 and 100 words. Very short prompts give the AI too much freedom; very long prompts can confuse the model. Focus on the most important visual details: subject, style, lighting, mood, and technical settings.',
      },
      {
        question: 'What is the difference between a positive and negative prompt?',
        answer: 'A positive prompt describes what you want to appear in the image. A negative prompt tells the AI what to exclude or avoid — for example "blurry, low quality, extra limbs" are common negative prompt terms used to improve image quality.',
      },
      {
        question: 'Which AI tool is best for image generation?',
        answer: 'The best tool depends on your use case. Midjourney produces highly artistic, stylized images. DALL-E 3 (via ChatGPT) follows instructions very precisely. Stable Diffusion is free and highly customizable. Flux is excellent for photorealism. Promptro provides prompts that work across all of these tools.',
      },
      {
        question: 'Do I need to write my own prompts?',
        answer: 'No! You can use Promptro\'s library of thousands of ready-made, tested prompts across every style and category. Simply copy a prompt, paste it into your AI tool of choice, and generate stunning images instantly.',
      },
    ],
    relatedSlugs: ['best-midjourney-prompts-2026', 'how-to-use-negative-prompts'],
    content: `
<section id="what-is-a-prompt">
  <h2>What Is an AI Image Prompt?</h2>
  <p>An <strong>AI image prompt</strong> is the text instruction you give to an AI image generation tool to tell it what to create. It is the most fundamental concept in AI image generation — without a prompt, the AI has no idea what to draw.</p>
  <p>Think of it like giving directions to an incredibly talented artist who has no prior knowledge of your vision. The more clearly you communicate what you want — the subject, the style, the mood, the lighting — the closer the result will be to your mental image.</p>
  <p>AI image prompts are used with tools like:</p>
  <ul>
    <li><strong>Midjourney</strong> — Known for artistic, highly stylized results</li>
    <li><strong>DALL-E 3</strong> — Excellent at following detailed text instructions</li>
    <li><strong>Stable Diffusion</strong> — Free, open-source, highly customizable</li>
    <li><strong>Flux</strong> — Outstanding photorealism and detail</li>
    <li><strong>Adobe Firefly</strong> — Safe for commercial use, integrated with Adobe tools</li>
  </ul>
</section>

<section id="how-prompts-work">
  <h2>How Prompts Work</h2>
  <p>Modern AI image generators are trained on massive datasets of images paired with text descriptions. When you enter a prompt, the AI uses this training to generate a new image that statistically matches the patterns associated with your words.</p>
  <p>This means the AI does not "understand" your prompt the way a human would — it processes patterns and probabilities. That is why prompt engineering (the craft of writing effective prompts) is so important. A small change in wording can dramatically change the output.</p>
  <p>For example, the difference between "a woman" and "a woman in dramatic cinematic lighting, shallow depth of field, film grain, 85mm lens" is enormous. The second prompt gives the AI much more to work with and produces a far more compelling image.</p>
</section>

<section id="prompt-anatomy">
  <h2>Anatomy of a Great Prompt</h2>
  <p>Every great AI image prompt typically contains several key components. You do not need all of them for every prompt, but including more detail generally produces better results:</p>
  <ol>
    <li><strong>Subject</strong> — Who or what is in the image? ("a lone samurai", "a futuristic cityscape", "a golden retriever puppy")</li>
    <li><strong>Style</strong> — What artistic style should it follow? ("photorealistic", "oil painting", "anime illustration", "cinematic")</li>
    <li><strong>Lighting</strong> — How is the scene lit? ("golden hour sunlight", "dramatic side lighting", "neon glow", "studio lighting")</li>
    <li><strong>Mood / Atmosphere</strong> — What feeling does the image convey? ("epic", "melancholic", "cozy", "mysterious")</li>
    <li><strong>Camera / Lens</strong> — What technical perspective? ("85mm portrait lens", "wide angle", "aerial view", "macro photography")</li>
    <li><strong>Quality Modifiers</strong> — Signals for output quality ("8K resolution", "ultra-detailed", "award-winning photography", "sharp focus")</li>
  </ol>
</section>

<section id="prompt-examples">
  <h2>Real Prompt Examples</h2>
  <p>Here are examples of AI image prompts from our library — ranging from simple to advanced:</p>
  <p><strong>Simple (Beginner):</strong><br/>
  <em>A cozy coffee shop interior, warm lighting, empty chairs, rainy window, peaceful atmosphere.</em></p>
  <p><strong>Intermediate:</strong><br/>
  <em>Portrait of a young woman, dramatic cinematic lighting, bokeh background, film grain, 85mm lens, shallow depth of field, editorial photography style.</em></p>
  <p><strong>Advanced (Professional):</strong><br/>
  <em>A cyberpunk street market in Tokyo at night, holographic advertisements, rain-soaked neon reflections on wet asphalt, dense atmospheric fog, ultra-detailed hyperrealistic render, 16:9 cinematic aspect ratio, Blade Runner aesthetic, f/2.8 35mm wide angle, ISO 3200 film grain.</em></p>
  <p>Notice how the advanced prompt specifies not just the scene but the camera settings, film aesthetic, and aspect ratio — giving the AI much more creative direction.</p>
</section>

<section id="best-practices">
  <h2>Best Practices for Writing Prompts</h2>
  <ul>
    <li><strong>Be specific about the subject first</strong> — Start with the most important element of your image</li>
    <li><strong>Use artistic and photographic vocabulary</strong> — Terms like "bokeh", "shallow DoF", "dramatic rim lighting" are understood by AI models</li>
    <li><strong>Specify the style explicitly</strong> — "Cinematic", "anime", "oil painting", "photorealistic" dramatically change the output</li>
    <li><strong>Include quality signals</strong> — "Ultra-detailed", "award-winning", "masterpiece" often improve output quality</li>
    <li><strong>Experiment with order</strong> — Earlier terms generally have more weight in the prompt</li>
    <li><strong>Test and iterate</strong> — AI generation is probabilistic; run the same prompt multiple times to get variations</li>
    <li><strong>Use a tested prompt library</strong> — Save time by starting from proven, tested prompts from Promptro</li>
  </ul>
</section>

<section id="negative-prompts">
  <h2>What Are Negative Prompts?</h2>
  <p>A <strong>negative prompt</strong> tells the AI what to avoid or exclude from the generated image. They are especially powerful with Stable Diffusion and similar models.</p>
  <p>Common negative prompt terms used to improve image quality:</p>
  <p><em>blurry, low quality, low resolution, poorly drawn, extra limbs, deformed, disfigured, watermark, text, signature, bad anatomy, out of frame, cropped, worst quality.</em></p>
  <p>On Promptro, many of our prompts include a suggested negative prompt below the main prompt text. This saves you the research and lets you get clean, high-quality results faster.</p>
</section>

<section id="where-to-find">
  <h2>Where to Find Ready-Made Prompts</h2>
  <p>Writing great AI image prompts from scratch takes practice and knowledge. If you are just starting out, or want to save time, using a curated prompt library is the fastest way to get professional results.</p>
  <p><strong>Promptro</strong> is India's leading AI image prompt library with thousands of tested, high-quality prompts across every category — cinematic, portrait, anime, sci-fi, fantasy, architecture, nature and more.</p>
  <p>Each prompt on Promptro includes:</p>
  <ul>
    <li>The full prompt text (ready to copy)</li>
    <li>The recommended negative prompt</li>
    <li>The best AI model to use</li>
    <li>Style tags and category</li>
    <li>Example output images</li>
  </ul>
</section>
    `,
  },
  {
    slug: 'best-midjourney-prompts-2026',
    title: '50 Best Midjourney Prompts in 2026 (Cinematic, Portrait & More)',
    metaTitle: '50 Best Midjourney Prompts 2026 — Cinematic, Portrait & Fantasy | Promptro',
    metaDescription: 'Discover the 50 best Midjourney prompts of 2026 for cinematic, portrait, fantasy, sci-fi and anime styles. Copy and use instantly. Curated by Promptro.',
    keywords: 'best Midjourney prompts 2026, Midjourney V7 prompts, cinematic Midjourney prompts, portrait prompts Midjourney, fantasy prompts',
    featuredImage: '/blog_midjourney_prompts.png',
    featuredImageAlt: 'Stunning AI-generated cinematic portrait created using Midjourney',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-15T00:00:00Z',
    updatedDate: '2026-06-03T00:00:00Z',
    readingTime: '10 min read',
    category: 'Prompt Libraries',
    tags: ['Midjourney', 'cinematic', 'portrait', 'fantasy', 'prompts 2026'],
    excerpt: 'Hand-picked and tested: 50 of the best Midjourney prompts for 2026 across cinematic, portrait, fantasy, sci-fi and anime styles. Copy any prompt and create stunning images instantly.',
    toc: [
      { id: 'why-midjourney', title: 'Why Midjourney Is Still the Best', level: 2 },
      { id: 'cinematic-prompts', title: 'Cinematic Prompts', level: 2 },
      { id: 'portrait-prompts', title: 'Portrait Prompts', level: 2 },
      { id: 'fantasy-prompts', title: 'Fantasy & Sci-Fi Prompts', level: 2 },
      { id: 'anime-prompts', title: 'Anime Prompts', level: 2 },
      { id: 'architecture-prompts', title: 'Architecture & Interior Prompts', level: 2 },
      { id: 'tips', title: 'Pro Tips for Midjourney in 2026', level: 2 },
    ],
    faqs: [
      {
        question: 'What version of Midjourney should I use in 2026?',
        answer: 'Midjourney V7 is the latest model in 2026 and produces the most detailed, coherent results. For stylized or artistic images, you may also try the Niji journey model which excels at anime and illustration styles.',
      },
      {
        question: 'How do I use these Midjourney prompts?',
        answer: 'Copy the prompt from Promptro, open Midjourney (via Discord or the web app), type /imagine and paste the prompt. Midjourney will generate four variations of your image within seconds.',
      },
      {
        question: 'Can I use Midjourney images commercially?',
        answer: 'Midjourney Pro and higher subscription plans allow commercial use of generated images. Always check the current Midjourney terms of service for the latest commercial usage rights.',
      },
      {
        question: 'What aspect ratio should I use in Midjourney?',
        answer: 'For portraits use --ar 2:3, for landscapes and cinematic images use --ar 16:9, for square social media posts use --ar 1:1. Add the aspect ratio parameter at the end of your prompt.',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'how-to-use-negative-prompts'],
    content: `
<section id="why-midjourney">
  <h2>Why Midjourney Is Still the Best AI Image Tool in 2026</h2>
  <p>Despite fierce competition from DALL-E 3, Stable Diffusion XL, and Flux, <strong>Midjourney</strong> remains the gold standard for artistic AI image generation in 2026. Its V7 model produces images with unparalleled aesthetic quality, coherent compositions, and a distinctive cinematic style that other models struggle to match.</p>
  <p>The key advantage of Midjourney is its <em>aesthetic intelligence</em> — it seems to understand what makes an image visually compelling, not just technically accurate. This makes it perfect for creative, artistic, and commercial work.</p>
</section>

<section id="cinematic-prompts">
  <h2>Best Cinematic Midjourney Prompts</h2>
  <p>Cinematic prompts are designed to evoke the look and feel of film — dramatic lighting, shallow depth of field, and a strong narrative mood.</p>
  <ol>
    <li><em>A lone detective standing on a rain-soaked street corner at night, neon signs reflecting in puddles, cinematic lighting, film noir style, 35mm grain, dramatic shadows --ar 16:9 --v 7</em></li>
    <li><em>Aerial view of a vast desert landscape at golden hour, lone figure walking, epic scale, cinematic color grade, dust in the air, wide angle lens --ar 16:9 --v 7</em></li>
    <li><em>Interior of an abandoned cathedral, rays of light through broken stained glass, dust particles floating, atmospheric haze, cinematic drama, ultra-detailed --ar 16:9 --v 7</em></li>
    <li><em>A speeding train through a mountain tunnel in winter, motion blur, dramatic overhead lighting, cinematic composition, photorealistic --ar 16:9 --v 7</em></li>
    <li><em>Close-up of hands holding a glowing compass in a dark forest, mystical fog, cinematic lighting, bokeh background, film grain, adventure mood --ar 4:5 --v 7</em></li>
  </ol>
  <p>Browse hundreds more cinematic prompts on <a href="/explore?category=Cinematic">Promptro's Cinematic category</a>.</p>
</section>

<section id="portrait-prompts">
  <h2>Best Portrait Midjourney Prompts</h2>
  <p>Portrait prompts focus on human subjects with exceptional lighting, skin texture, and emotional depth.</p>
  <ol>
    <li><em>Portrait of a young woman, dramatic side lighting, deep shadows, film grain, 85mm lens, bokeh background, editorial magazine style --ar 2:3 --v 7</em></li>
    <li><em>An elderly man with weathered hands and kind eyes, natural window light, documentary portrait, ultra-detailed skin texture, photorealistic --ar 2:3 --v 7</em></li>
    <li><em>A young warrior woman in golden armor, dramatic rim lighting, epic fantasy portrait, painterly style, intricate details --ar 2:3 --v 7</em></li>
    <li><em>Street portrait of a musician in Tokyo, neon reflections on face, documentary style, 35mm film, authentic, candid --ar 2:3 --v 7</em></li>
    <li><em>Fashion portrait, model in flowing white fabric, studio lighting, clean white background, high fashion editorial, sharp focus --ar 2:3 --v 7</em></li>
  </ol>
</section>

<section id="fantasy-prompts">
  <h2>Best Fantasy &amp; Sci-Fi Midjourney Prompts</h2>
  <p>Fantasy and sci-fi prompts unlock Midjourney's ability to create entirely new worlds.</p>
  <ol>
    <li><em>An ancient dragon perched on a mountain peak at sunset, scales glistening, clouds below, epic fantasy landscape, ultra-detailed, painterly --ar 16:9 --v 7</em></li>
    <li><em>A glowing underwater city with bioluminescent sea creatures, blue-green palette, ethereal atmosphere, sci-fi fantasy, ultra-detailed --ar 16:9 --v 7</em></li>
    <li><em>A cyberpunk city in 2147, holographic advertisements, flying vehicles, rainy night, neon lights, Blade Runner aesthetic, photorealistic --ar 16:9 --v 7</em></li>
    <li><em>A forest spirit emerging from ancient tree roots, glowing particles, mystical fog, magical realism, painterly illustration style --ar 2:3 --v 7</em></li>
    <li><em>Interior of a massive alien spacecraft, scale and grandeur, soft blue ambient lighting, futuristic architecture, ultra-detailed render --ar 16:9 --v 7</em></li>
  </ol>
</section>

<section id="anime-prompts">
  <h2>Best Anime Midjourney Prompts</h2>
  <p>For anime-style images, use the <code>--niji 6</code> parameter for best results.</p>
  <ol>
    <li><em>A samurai girl standing in cherry blossom rain, soft pastel colors, Studio Ghibli style, peaceful mood --ar 2:3 --niji 6</em></li>
    <li><em>A young hero charging forward with a glowing sword, dynamic action pose, vibrant colors, shonen manga style, speed lines --ar 16:9 --niji 6</em></li>
    <li><em>A cozy café scene with two friends sharing coffee, soft warm lighting, slice of life anime style --ar 4:5 --niji 6</em></li>
  </ol>
</section>

<section id="architecture-prompts">
  <h2>Architecture &amp; Interior Design Prompts</h2>
  <ol>
    <li><em>A minimalist Japanese house interior, natural light, bamboo, stone, wood textures, wabi-sabi aesthetic, ultra-detailed architectural render --ar 16:9 --v 7</em></li>
    <li><em>A floating sky island city with cascading waterfalls, lush greenery, fantasy architecture, golden hour lighting, epic scale --ar 16:9 --v 7</em></li>
    <li><em>Brutalist concrete apartment building facade, dramatic shadows, monochrome, architectural photography, ultra-detailed --ar 2:3 --v 7</em></li>
  </ol>
</section>

<section id="tips">
  <h2>Pro Tips for Midjourney in 2026</h2>
  <ul>
    <li><strong>Use --v 7</strong> for the latest model quality</li>
    <li><strong>Add --ar</strong> to specify aspect ratio (16:9, 2:3, 1:1)</li>
    <li><strong>Use --stylize</strong> (0–1000) to control how "artistic" the output is — higher values are more stylized</li>
    <li><strong>Use --chaos</strong> (0–100) to increase variety between the 4 generated images</li>
    <li><strong>Use /blend</strong> to combine two images with a new prompt</li>
    <li><strong>Add quality modifiers</strong>: "ultra-detailed", "masterpiece", "award-winning" generally improve results</li>
    <li><strong>Browse Promptro</strong> to find tested prompts for every category instead of starting from scratch</li>
  </ul>
</section>
    `,
  },
  {
    slug: 'how-to-use-negative-prompts',
    title: 'How to Use Negative Prompts to Get Better AI Images',
    metaTitle: 'How to Use Negative Prompts for Better AI Images | Promptro',
    metaDescription: 'Master negative prompts to dramatically improve your AI-generated images. Learn the best negative prompts for Stable Diffusion, Midjourney and DALL-E with real examples.',
    keywords: 'negative prompts, AI negative prompts, Stable Diffusion negative prompts, improve AI images, best negative prompt list',
    featuredImage: '/blog_negative_prompts.png',
    featuredImageAlt: 'AI image generation interface showing prompt and negative prompt fields',
    author: 'Mohammad Asad Ansari',
    authorTitle: 'Founder of Promptro',
    publishDate: '2026-05-28T00:00:00Z',
    updatedDate: '2026-06-03T00:00:00Z',
    readingTime: '7 min read',
    category: 'Tips & Techniques',
    tags: ['negative prompts', 'Stable Diffusion', 'tips', 'AI image quality'],
    excerpt: 'Negative prompts are the secret weapon for dramatically better AI-generated images. Learn exactly which negative prompt terms work, why they help, and how to use them across every major AI tool.',
    toc: [
      { id: 'what-are-negative', title: 'What Are Negative Prompts?', level: 2 },
      { id: 'how-they-work', title: 'How Negative Prompts Work', level: 2 },
      { id: 'universal-list', title: 'Universal Negative Prompt List', level: 2 },
      { id: 'by-tool', title: 'Negative Prompts by AI Tool', level: 2 },
      { id: 'by-category', title: 'Category-Specific Negative Prompts', level: 2 },
      { id: 'common-mistakes', title: 'Common Mistakes to Avoid', level: 2 },
    ],
    faqs: [
      {
        question: 'Do negative prompts work in Midjourney?',
        answer: 'Yes, but differently than in Stable Diffusion. In Midjourney, you add negative prompts using the --no parameter. For example: "a forest scene --no people, cars, text". The effect is more subtle in Midjourney than in Stable Diffusion.',
      },
      {
        question: 'What is the best negative prompt for portraits?',
        answer: 'For portrait AI images, the most effective negative prompt is: "blurry, low quality, extra limbs, deformed face, bad anatomy, worst quality, watermark, text, poorly drawn hands, asymmetric face, ugly, disfigured".',
      },
      {
        question: 'Can negative prompts make images worse?',
        answer: 'Yes — over-loading negative prompts with too many terms can sometimes confuse the AI model and produce worse results. Start with a short, focused negative prompt and only add terms when needed.',
      },
      {
        question: 'Does DALL-E 3 support negative prompts?',
        answer: 'DALL-E 3 does not have a dedicated negative prompt field like Stable Diffusion. Instead, include exclusion instructions in your main prompt: "Do not include text, watermarks, or blurry backgrounds."',
      },
    ],
    relatedSlugs: ['what-is-an-ai-image-prompt', 'best-midjourney-prompts-2026'],
    content: `
<section id="what-are-negative">
  <h2>What Are Negative Prompts?</h2>
  <p>A <strong>negative prompt</strong> is a list of terms you tell the AI image generator to avoid or exclude from the generated image. While your main prompt tells the AI what you want, the negative prompt tells it what you don't want.</p>
  <p>Think of it like ordering food — your main prompt is your order ("I'd like a steak, medium-rare"), and the negative prompt is your dietary restriction ("no onions, no sauce"). The AI will try its best to avoid those elements.</p>
  <p>Negative prompts are most powerful in <strong>Stable Diffusion</strong> and similar models where they have a direct mathematical effect on the generation process. In Midjourney, they work via the <code>--no</code> parameter with a somewhat less dramatic effect.</p>
</section>

<section id="how-they-work">
  <h2>How Negative Prompts Work</h2>
  <p>In Stable Diffusion, the generation process works by gradually transforming random noise into an image that matches your positive prompt. Negative prompts work by also applying guidance in the opposite direction — pushing the generation away from the concepts you specify.</p>
  <p>This is why negative prompts are so powerful for quality control. Terms like "blurry" and "low quality" help the model avoid the lower-quality patterns it learned during training. Terms like "extra limbs" and "deformed hands" help correct the well-known weakness of AI models with human anatomy.</p>
</section>

<section id="universal-list">
  <h2>Universal Negative Prompt List</h2>
  <p>This is a general-purpose negative prompt that works well across most AI image generation scenarios:</p>
  <p><strong>Quality improvements:</strong><br/>
  <em>blurry, low quality, low resolution, pixelated, jpeg artifacts, compression artifacts, noisy, grainy, worst quality, bad quality, normal quality</em></p>
  <p><strong>Anatomy fixes:</strong><br/>
  <em>extra limbs, extra fingers, missing fingers, deformed hands, bad anatomy, poorly drawn face, asymmetric eyes, deformed, disfigured, malformed</em></p>
  <p><strong>Content exclusions:</strong><br/>
  <em>watermark, text, signature, username, logo, brand, frame, border, crop marks</em></p>
  <p><strong>Composition fixes:</strong><br/>
  <em>out of frame, cropped, cut off, multiple views, duplicate, collage, split image</em></p>
</section>

<section id="by-tool">
  <h2>Negative Prompts by AI Tool</h2>
  <h3>Stable Diffusion</h3>
  <p>Stable Diffusion has a dedicated "Negative prompt" field in both Automatic1111 and ComfyUI. Simply paste your negative prompt list there. The effect is very strong — even basic negative prompts dramatically improve output quality.</p>
  <p><strong>Recommended negative prompt for Stable Diffusion:</strong><br/>
  <em>(worst quality, low quality, normal quality:1.4), (blurry:1.2), poorly drawn face, bad anatomy, extra limbs, deformed hands, watermark, text, signature</em></p>
  <h3>Midjourney</h3>
  <p>Use the <code>--no</code> parameter at the end of your prompt:<br/>
  <em>a portrait of a woman in a forest --no text, watermarks, blurry backgrounds, extra limbs</em></p>
  <h3>DALL-E 3</h3>
  <p>Include exclusions directly in your prompt:<br/>
  <em>...Do not include any text, watermarks, or low-quality elements.</em></p>
</section>

<section id="by-category">
  <h2>Category-Specific Negative Prompts</h2>
  <p><strong>For portrait/character images:</strong><br/>
  <em>extra fingers, missing fingers, deformed hands, bad anatomy, asymmetric face, multiple faces, ugly, disfigured, old, aged, wrinkled (unless desired)</em></p>
  <p><strong>For landscape/environment images:</strong><br/>
  <em>people, text, signs, logos, watermarks, unrealistic colors (unless stylized)</em></p>
  <p><strong>For product/architecture images:</strong><br/>
  <em>people, reflections (unless wanted), distorted perspective, blurry, low detail</em></p>
  <p><strong>For anime style:</strong><br/>
  <em>photorealistic, 3D render, western cartoon style, low detail, simple background (unless desired)</em></p>
</section>

<section id="common-mistakes">
  <h2>Common Mistakes to Avoid</h2>
  <ul>
    <li><strong>Too many terms</strong> — More than 20-30 negative prompt terms can confuse the model. Focus on the most important exclusions for your specific image.</li>
    <li><strong>Contradicting your main prompt</strong> — If your main prompt says "dark and moody" and your negative prompt says "dark shadows", you'll get inconsistent results.</li>
    <li><strong>Using negative prompts to fix everything</strong> — If your positive prompt is weak, no amount of negative prompting will fix it. Fix the positive prompt first.</li>
    <li><strong>Forgetting to adjust per use-case</strong> — A great portrait negative prompt doesn't work as well for landscapes. Customize for your specific image type.</li>
  </ul>
  <p>All prompts on <a href="/explore">Promptro</a> include a recommended negative prompt tailored specifically for that image style. Copy both together for the best results.</p>
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
