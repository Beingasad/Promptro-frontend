import { useNavigate } from 'react-router-dom';

export default function AIStyleMixerBanner() {
  const navigate = useNavigate();

  return (
    <section 
      className="w-full px-2 sm:px-4 md:px-6 relative -mt-2 sm:-mt-2.5 -mb-2 sm:-mb-2.5 select-none"
      aria-label="AI Style Mixer Feature"
    >
      <div className="relative w-full -mx-0.5 md:mx-0 scale-[1.02] md:scale-100">
        
        {/* Clean Banner Container with Continuous Rotating Flowing Border Beam */}
        <div
          className="relative z-10 w-full p-[1.5px] sm:p-[2px] overflow-hidden rounded-[1.35rem] md:rounded-[2rem]
            shadow-[0_4px_20px_rgba(139,92,246,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          {/* MOBILE VIEW: Old Traveling Single Light Orbit Beam (Colour change hote huye dheere dheere chakkar lagata hai) */}
          <div 
            className="lg:hidden pointer-events-none absolute w-[120px] h-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-85 blur-[1.5px] animate-perimeter-orbit"
            aria-hidden="true"
          />
          <div 
            className="lg:hidden pointer-events-none absolute w-[150px] h-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-lg animate-perimeter-orbit"
            aria-hidden="true"
          />

          {/* DESKTOP VIEW: Subtle Liquid Glass Aurora Border Flow */}
          <div 
            className="hidden lg:block pointer-events-none absolute -inset-[150%] rounded-full opacity-[0.20] dark:opacity-[0.24] blur-xl sm:blur-2xl animate-aurora-flow"
            style={{
              background: 'conic-gradient(from 0deg, #8b5cf6 0%, #7c3aed 18%, #6366f1 36%, #c084fc 50%, #f472b6 65%, #fb923c 82%, #f97316 92%, #8b5cf6 100%)',
            }}
            aria-hidden="true"
          />
          <div 
            className="hidden lg:block pointer-events-none absolute -inset-[150%] rounded-full opacity-60 dark:opacity-50 animate-aurora-flow"
            style={{
              background: 'conic-gradient(from 0deg, #8b5cf6 0%, #7c3aed 18%, #6366f1 36%, #c084fc 50%, #f472b6 65%, #fb923c 82%, #f97316 92%, #8b5cf6 100%)',
            }}
            aria-hidden="true"
          />

          {/* Inner Card Body with High-Clarity Liquid Glass & Prominent Content (Slimmer padding from top) */}
          <div
            className="relative z-10 w-full h-full overflow-hidden pt-1 pb-1.5 px-2.5 sm:pt-1.5 sm:pb-2 sm:px-5 md:py-3.5 md:px-7 lg:px-9 backdrop-blur-2xl rounded-[calc(1.35rem-1.5px)] md:rounded-[calc(2rem-2px)]
              bg-gradient-to-br from-[#f9f5ff]/98 via-[#fcfaff]/98 to-[#fff6f0]/98
              dark:bg-gradient-to-br dark:from-[#140c2a]/97 dark:via-[#191034]/97 dark:to-[#200d2b]/97"
          >
            {/* Ambient Multi-Hue Soft Gradient Wash */}
            <div 
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/6 via-pink-500/4 to-orange-500/6 dark:from-purple-500/10 dark:via-pink-500/6 dark:to-orange-500/8"
              aria-hidden="true" 
            />

            {/* Synchronized 4-Side Internal Illumination (Animation ke chalte andar banner me colour change hote aage badhta hai) */}
            {/* 1. Top Side: Cyan / Blue Light Wash */}
            <div 
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(56,189,248,0.22),rgba(129,140,248,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(56,189,248,0.28),rgba(129,140,248,0.12),transparent_75%)]"
              style={{ animation: 'sideGlowTopSync 13s linear infinite' }}
              aria-hidden="true" 
            />
            {/* 2. Right Side: Vivid Rose / Pink Light Wash */}
            <div 
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_75%_at_100%_50%,rgba(244,63,94,0.22),rgba(236,72,153,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_50%_75%_at_100%_50%,rgba(244,63,94,0.28),rgba(236,72,153,0.12),transparent_75%)]"
              style={{ animation: 'sideGlowRightSync 13s linear infinite' }}
              aria-hidden="true" 
            />
            {/* 3. Bottom Side: Warm Orange / Amber Light Wash */}
            <div 
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,rgba(249,115,22,0.22),rgba(250,204,21,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,rgba(249,115,22,0.28),rgba(250,204,21,0.12),transparent_75%)]"
              style={{ animation: 'sideGlowBottomSync 13s linear infinite' }}
              aria-hidden="true" 
            />
            {/* 4. Left Side: Rich Purple / Violet Light Wash */}
            <div 
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_75%_at_0%_50%,rgba(168,85,247,0.22),rgba(129,140,248,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_50%_75%_at_0%_50%,rgba(168,85,247,0.28),rgba(129,140,248,0.12),transparent_75%)]"
              style={{ animation: 'sideGlowLeftSync 13s linear infinite' }}
              aria-hidden="true" 
            />

            {/* Card Layout: Left Content & Middle Feature Chips & Right Artwork */}
            <div className="relative z-10 flex flex-row items-center justify-between gap-2 sm:gap-4 md:gap-6 w-full">
              
              {/* LEFT CONTENT COLUMN: Responsive for mobile and wide on desktop */}
              <div className="flex-1 min-w-0 sm:min-w-[240px] max-w-full sm:max-w-[340px] md:max-w-[400px] lg:max-w-[430px] flex flex-col items-start pl-0.5 sm:pl-1 shrink-0">
                
                {/* Badge: "NEW" (Clean text without any icon/animation, positioned close to heading) */}
                <div className="pt-0.5 sm:pt-0 mb-0 leading-none">
                  <span className="sm:hidden text-[8.5px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 select-none">
                    NEW
                  </span>
                  <div className="hidden sm:inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md
                    bg-purple-500/15 border border-purple-500/30 text-purple-700
                    dark:bg-[#7c3aed]/30 dark:border-white/30 dark:text-white"
                  >
                    NEW
                  </div>
                </div>

                {/* Title (Spans horizontally matching the subtext width, tight to NEW) */}
                <h2 className="text-[20px] sm:text-[26px] md:text-[32px] lg:text-[38px] xl:text-[42px] font-[900] tracking-tight leading-tight whitespace-nowrap mt-0 sm:mt-1">
                  <span className="text-[#171421] dark:text-white">AI Style </span>
                  <span className="text-[#f97316] drop-shadow-sm">
                    Mixer
                  </span>
                </h2>

                {/* Subtitle - Mobile */}
                <p className="lg:hidden text-[10.5px] sm:text-[12px] md:text-[13.5px] font-normal leading-tight sm:leading-snug mt-0.5 sm:mt-1 max-w-[260px] sm:max-w-[320px] md:max-w-[380px]
                  text-[#524a66] dark:text-white/85"
                >
                  Mix styles, lighting, and camera looks to generate perfect prompts for ChatGPT, Gemini & AI art.
                </p>

                {/* Subtitle & Rich Details - Desktop (fills left column) */}
                <div className="hidden lg:flex flex-col gap-1.5 mt-1.5 text-[#524a66] dark:text-white/90">
                  <p className="text-[13px] xl:text-[14px] leading-snug font-medium max-w-[360px] xl:max-w-[400px]">
                    Mix styles, lighting, camera looks and mood presets to craft high-impact prompts for ChatGPT, Google Gemini & Next-Gen AI.
                  </p>
                  <p className="text-[11.5px] xl:text-[12px] leading-snug text-[#736b8e] dark:text-white/70 max-w-[360px] xl:max-w-[400px]">
                    Combine vibrant visual aesthetics with smart AI prompt engineering for stunning photorealistic results.
                  </p>
                  {/* Feature Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xl:text-[10.5px] font-bold bg-purple-500/10 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      ✦ ChatGPT & Gemini
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xl:text-[10.5px] font-bold bg-pink-500/10 dark:bg-pink-400/20 text-pink-700 dark:text-pink-300 border border-pink-500/20">
                      ✦ Smart Prompt Writer
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xl:text-[10.5px] font-bold bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      ✦ Instant 1-Click Copy
                    </span>
                  </div>
                </div>

                {/* LIQUID GLASS CTA BUTTON - Mobile / Tablet only (Subtle colorful gradient + Professional SVG) */}
                <button
                  type="button"
                  onClick={() => navigate('/style-mixer')}
                  className="group relative overflow-hidden lg:hidden cursor-pointer mt-1.5 sm:mt-2.5 inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12.5px] font-black px-3.5 py-1.5 sm:py-2 w-full max-w-[250px] sm:max-w-[310px] md:max-w-[360px] rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 outline-none
                    backdrop-blur-xl
                    bg-gradient-to-r from-purple-500/18 via-pink-500/16 to-amber-500/20
                    dark:from-purple-500/28 dark:via-pink-500/22 dark:to-orange-500/26
                    hover:from-purple-500/30 hover:via-pink-500/25 hover:to-amber-500/30
                    border border-purple-400/40 dark:border-purple-400/30
                    shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_4px_14px_-2px_rgba(168,85,247,0.22)]
                    hover:shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.85),0_6px_18px_-2px_rgba(168,85,247,0.3)]
                    whitespace-nowrap tracking-wide"
                  aria-label="Mix Your Style"
                >
                  {/* Top curved specular gloss */}
                  <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-full pointer-events-none" />
                  
                  {/* Shimmer light sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  <span className="relative z-10 font-black bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600 dark:from-white dark:via-purple-100 dark:to-amber-200 bg-clip-text text-transparent">
                    Mix Your Style
                  </span>
                  
                  {/* Professional Sparkles SVG Icon */}
                  <svg className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 dark:text-amber-300 shrink-0 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                  </svg>
                </button>

              </div>

              {/* MIDDLE KEY FEATURES (Desktop View - Stretched vertically from top to bottom) */}
              <div className="hidden lg:flex flex-col justify-between items-center self-stretch flex-1 min-w-0 px-2 xl:px-3 py-0.5 select-none">
                {/* Top caption */}
                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-1.5 text-[11.5px] xl:text-[12.5px] font-semibold italic text-purple-700 dark:text-purple-300 tracking-wide">
                    <span>Combine. Create. Imagine.</span>
                    <span className="text-amber-400 not-italic text-sm drop-shadow-sm">✦</span>
                  </div>
                  <span className="text-[10px] xl:text-[11px] italic font-medium text-[#524a66] dark:text-white/80">
                    Click any style to start ⤵
                  </span>
                </div>

                {/* 4 Feature Chips in a row (Clickable to open Style Mixer page) */}
                <div className="flex items-center justify-center gap-2.5 xl:gap-3 w-full my-auto">
                  {/* 1. Style - Cinematic */}
                  <div
                    onClick={() => navigate('/style-mixer')}
                    role="button"
                    tabIndex={0}
                    title="Click to open AI Style Mixer"
                    className="flex-1 max-w-[125px] xl:max-w-[140px] h-[68px] xl:h-[78px] bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-violet-500/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-900/20 border border-purple-300/60 dark:border-purple-500/30 rounded-2xl p-2 shadow-[0_4px_16px_rgba(147,51,234,0.12)] backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.06] hover:shadow-lg active:scale-95"
                  >
                    <div className="text-[10.5px] xl:text-[11.5px] font-bold text-purple-900 dark:text-purple-200 px-1 flex items-center justify-between">
                      <span>Style</span>
                      <span className="text-purple-600 dark:text-purple-400 font-extrabold text-xs leading-none">+</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-md border border-white/20 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[12px] xl:text-[13px] font-black tracking-wide">
                      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.2 6 3 11l-.9-2.4c-.4-1.1.2-2.4 1.3-2.8l13.7-4.9c1.1-.4 2.4.2 2.8 1.3l.3.8z" />
                        <path d="m6.2 5.3 3.1 4.3" />
                        <path d="m11.2 3.5 3.1 4.3" />
                        <path d="m16.2 1.8 3.1 4.3" />
                        <rect x="2" y="10" width="20" height="12" rx="2" />
                      </svg>
                      <span>Cinematic</span>
                    </div>
                  </div>

                  {/* 2. Lighting - Neon */}
                  <div
                    onClick={() => navigate('/style-mixer')}
                    role="button"
                    tabIndex={0}
                    title="Click to open AI Style Mixer"
                    className="flex-1 max-w-[125px] xl:max-w-[140px] h-[68px] xl:h-[78px] bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-amber-500/10 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-pink-900/20 border border-pink-300/60 dark:border-pink-500/30 rounded-2xl p-2 shadow-[0_4px_16px_rgba(244,63,94,0.12)] backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.06] hover:shadow-lg active:scale-95"
                  >
                    <div className="text-[10.5px] xl:text-[11.5px] font-bold text-rose-900 dark:text-pink-200 px-1 flex items-center justify-between">
                      <span>Lighting</span>
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold text-xs leading-none">+</span>
                    </div>
                    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-md border border-white/20 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[12px] xl:text-[13px] font-black tracking-wide">
                      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                      <span>Neon</span>
                    </div>
                  </div>

                  {/* 3. Camera - 85mm */}
                  <div
                    onClick={() => navigate('/style-mixer')}
                    role="button"
                    tabIndex={0}
                    title="Click to open AI Style Mixer"
                    className="flex-1 max-w-[125px] xl:max-w-[140px] h-[68px] xl:h-[78px] bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/20 border border-amber-300/60 dark:border-amber-500/30 rounded-2xl p-2 shadow-[0_4px_16px_rgba(245,158,11,0.12)] backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.06] hover:shadow-lg active:scale-95"
                  >
                    <div className="text-[10.5px] xl:text-[11.5px] font-bold text-amber-950 dark:text-amber-200 px-1">
                      <span>Camera</span>
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md border border-white/20 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[12px] xl:text-[13px] font-black tracking-wide">
                      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>85mm</span>
                    </div>
                  </div>

                  {/* 4. Mood - Dreamy */}
                  <div
                    onClick={() => navigate('/style-mixer')}
                    role="button"
                    tabIndex={0}
                    title="Click to open AI Style Mixer"
                    className="flex-1 max-w-[125px] xl:max-w-[140px] h-[68px] xl:h-[78px] bg-gradient-to-br from-cyan-500/20 via-teal-500/15 to-blue-500/10 dark:from-cyan-950/40 dark:via-teal-950/30 dark:to-blue-900/20 border border-cyan-300/60 dark:border-cyan-500/30 rounded-2xl p-2 shadow-[0_4px_16px_rgba(6,182,212,0.12)] backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.06] hover:shadow-lg active:scale-95"
                  >
                    <div className="text-[10.5px] xl:text-[11.5px] font-bold text-cyan-950 dark:text-cyan-200 px-1 flex items-center justify-between">
                      <span>Mood</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-xs leading-none">+</span>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white shadow-md border border-white/20 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[12px] xl:text-[13px] font-black tracking-wide">
                      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                      <span>Dreamy</span>
                    </div>
                  </div>
                </div>

                {/* DESKTOP LIQUID GLASS CTA BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate('/style-mixer')}
                  className="group relative overflow-hidden cursor-pointer w-full mt-1.5 xl:mt-2 inline-flex items-center justify-center gap-2.5 py-2.5 xl:py-3 px-5 rounded-2xl transition-all duration-300 hover:scale-[1.015] active:scale-95 outline-none
                    backdrop-blur-2xl
                    bg-gradient-to-r from-white/35 via-purple-100/25 to-white/30
                    dark:from-white/15 dark:via-purple-400/10 dark:to-white/12
                    hover:from-white/55 hover:via-purple-150/35 hover:to-white/50
                    dark:hover:from-white/25 dark:hover:via-purple-400/20 dark:hover:to-white/20
                    border border-white/60 dark:border-white/30
                    shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.85),inset_0_-1px_1px_0_rgba(255,255,255,0.2),0_6px_20px_-2px_rgba(147,51,234,0.16)]
                    hover:shadow-[inset_0_2px_1px_0_rgba(255,255,255,0.95),0_10px_28px_-2px_rgba(147,51,234,0.25)]
                    tracking-wide"
                  aria-label="Mix Your Style"
                >
                  {/* Top curved specular gloss */}
                  <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/50 via-white/15 to-transparent rounded-t-2xl pointer-events-none" />

                  {/* Shimmer light sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="font-black text-[13.5px] xl:text-[14.5px] bg-gradient-to-r from-purple-800 via-pink-700 to-amber-700 dark:from-white dark:via-purple-100 dark:to-amber-200 bg-clip-text text-transparent">
                      Mix Your Style
                    </span>
                    <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-500 dark:text-amber-300 shrink-0 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      <path d="M5 3v4" />
                      <path d="M19 17v4" />
                    </svg>
                    <span className="text-[11px] xl:text-[12.5px] font-semibold text-purple-950/70 dark:text-white/80 ml-1">
                      Open AI Mixer Engine →
                    </span>
                  </div>
                </button>
              </div>

              {/* RIGHT VISUAL COLUMN: User's Uploaded "Ai mixer image.png" Artwork (Enlarged on mobile) */}
              <div className="shrink-0 flex flex-col items-center pr-0.5 sm:pr-1">
                <img
                  src="/Ai%20mixer%20image.png"
                  alt="AI Style Mixer"
                  loading="eager"
                  decoding="sync"
                  className="h-[102px] sm:h-[120px] md:h-[142px] lg:h-[168px] xl:h-[188px] w-auto max-w-[155px] sm:max-w-[205px] md:max-w-[270px] lg:max-w-[320px] xl:max-w-[360px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] select-none pointer-events-none hover:scale-105 transition-transform duration-500"
                />

                {/* Text and arrow directly under the artwork image */}
                <div className="flex items-center justify-center gap-1 mt-0.5 select-none">
                  <span className="text-[7px] sm:text-[8.5px] md:text-[10.5px] lg:text-[11px] xl:text-[11.5px] italic font-medium whitespace-nowrap text-[#524a66] dark:text-white/85">
                    Turn your ideas into stunning prompts
                  </span>
                  <svg className="w-3.5 h-2.5 sm:w-4.5 sm:h-3.5 lg:w-6 lg:h-4 text-purple-500 dark:text-purple-400 shrink-0 transform -rotate-12" viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 26 C 25 30, 42 20, 52 8" />
                    <path d="M40 8 L 52 8 L 49 18" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
