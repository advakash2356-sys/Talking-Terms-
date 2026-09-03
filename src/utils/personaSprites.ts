import { PersonaExpressions } from '../types';

/**
 * High-Fidelity Discrete Expression Generator & Sprite Cache for Talking Terms
 * Generates crisp, expressive SVG Data URLs for (neutral, serious, joyful) states
 * with distinct facial anatomy, eye shapes, eyebrow angles, mouth expressions, and lighting.
 */

interface PersonaStyleConfig {
  skinTone: string;
  hairColor: string;
  hairStyle: 'short_fade' | 'wavy_long' | 'neat_part' | 'curly_medium' | 'classic_bun' | 'silver_crew' | 'sharp_crop' | 'bob_cut';
  clothingColor: string;
  accessory?: 'glasses' | 'stethoscope' | 'spectacles' | 'earring' | 'tie';
  gender: 'male' | 'female' | 'lgbtq';
  accentTheme: string;
}

const PERSONA_STYLES: Record<string, PersonaStyleConfig> = {
  kabir_upsc: {
    skinTone: '#D49A6A',
    hairColor: '#1A181B',
    hairStyle: 'short_fade',
    clothingColor: '#3B82F6',
    accessory: 'spectacles',
    gender: 'male',
    accentTheme: '#F59E0B',
  },
  rohan_techie: {
    skinTone: '#C6885B',
    hairColor: '#111827',
    hairStyle: 'sharp_crop',
    clothingColor: '#1E293B',
    accessory: 'glasses',
    gender: 'male',
    accentTheme: '#0EA5E9',
  },
  sunita_homemaker: {
    skinTone: '#DE9E74',
    hairColor: '#1C1917',
    hairStyle: 'classic_bun',
    clothingColor: '#BE123C',
    accessory: 'earring',
    gender: 'female',
    accentTheme: '#F43F5E',
  },
  meera_hr: {
    skinTone: '#CE8F63',
    hairColor: '#0F172A',
    hairStyle: 'wavy_long',
    clothingColor: '#581C87',
    accessory: 'earring',
    gender: 'female',
    accentTheme: '#A855F7',
  },
  alex_dei: {
    skinTone: '#E0A882',
    hairColor: '#0D9488',
    hairStyle: 'curly_medium',
    clothingColor: '#0F766E',
    accessory: 'earring',
    gender: 'lgbtq',
    accentTheme: '#10B981',
  },
  aarav_du: {
    skinTone: '#DB9B6B',
    hairColor: '#18181B',
    hairStyle: 'short_fade',
    clothingColor: '#D97706',
    gender: 'male',
    accentTheme: '#EAB308',
  },
  priya_intern: {
    skinTone: '#CCA077',
    hairColor: '#09090B',
    hairStyle: 'bob_cut',
    clothingColor: '#0284C7',
    accessory: 'stethoscope',
    gender: 'female',
    accentTheme: '#06B6D4',
  },
  simran_cabin_crew: {
    skinTone: '#E4A77D',
    hairColor: '#18181B',
    hairStyle: 'classic_bun',
    clothingColor: '#4338CA',
    accessory: 'earring',
    gender: 'female',
    accentTheme: '#6366F1',
  },
  varun_bpo: {
    skinTone: '#B57951',
    hairColor: '#171717',
    hairStyle: 'sharp_crop',
    clothingColor: '#4C1D95',
    gender: 'male',
    accentTheme: '#8B5CF6',
  },
  ananya_freelancer: {
    skinTone: '#DE9C72',
    hairColor: '#701A75',
    hairStyle: 'wavy_long',
    clothingColor: '#A21CAF',
    accessory: 'glasses',
    gender: 'female',
    accentTheme: '#D946EF',
  },
  karan_founder: {
    skinTone: '#C5895B',
    hairColor: '#1E293B',
    hairStyle: 'neat_part',
    clothingColor: '#065F46',
    gender: 'male',
    accentTheme: '#059669',
  },
  divya_lgbtq_lawyer: {
    skinTone: '#CF9166',
    hairColor: '#0F172A',
    hairStyle: 'sharp_crop',
    clothingColor: '#312E81',
    accessory: 'tie',
    gender: 'lgbtq',
    accentTheme: '#818CF8',
  },
  rajesh_uncle: {
    skinTone: '#C88B5E',
    hairColor: '#94A3B8',
    hairStyle: 'silver_crew',
    clothingColor: '#44403C',
    accessory: 'spectacles',
    gender: 'male',
    accentTheme: '#A8A29E',
  },
  natasha_content: {
    skinTone: '#DE9F75',
    hairColor: '#BE185D',
    hairStyle: 'wavy_long',
    clothingColor: '#9D174D',
    accessory: 'earring',
    gender: 'female',
    accentTheme: '#EC4899',
  },
  sam_queer_student: {
    skinTone: '#E4A582',
    hairColor: '#4F46E5',
    hairStyle: 'curly_medium',
    clothingColor: '#4338CA',
    accessory: 'earring',
    gender: 'lgbtq',
    accentTheme: '#818CF8',
  },
  tanya_ca_finalist: {
    skinTone: '#CCA077',
    hairColor: '#18181B',
    hairStyle: 'bob_cut',
    clothingColor: '#0F766E',
    accessory: 'glasses',
    gender: 'female',
    accentTheme: '#14B8A6',
  },
  vicky_gym_coach: {
    skinTone: '#BD7F55',
    hairColor: '#171717',
    hairStyle: 'short_fade',
    clothingColor: '#DC2626',
    gender: 'male',
    accentTheme: '#EF4444',
  },
  pooja_single_mother: {
    skinTone: '#CE9167',
    hairColor: '#1C1917',
    hairStyle: 'classic_bun',
    clothingColor: '#7C3AED',
    accessory: 'earring',
    gender: 'female',
    accentTheme: '#8B5CF6',
  },
  zoya_queer_psych: {
    skinTone: '#DCA179',
    hairColor: '#047857',
    hairStyle: 'bob_cut',
    clothingColor: '#0D9488',
    accessory: 'glasses',
    gender: 'lgbtq',
    accentTheme: '#2DD4BF',
  },
  alok_cab_driver: {
    skinTone: '#B4764D',
    hairColor: '#27272A',
    hairStyle: 'short_fade',
    clothingColor: '#B45309',
    gender: 'male',
    accentTheme: '#F59E0B',
  },
};

/**
 * Generate an expressive SVG for a given persona and emotion state
 */
export function generatePersonaExpressionSVG(
  personaId: string,
  personaName: string,
  emotion: 'neutral' | 'serious' | 'joyful'
): string {
  const config = PERSONA_STYLES[personaId] || {
    skinTone: '#D49A6A',
    hairColor: '#1A181B',
    hairStyle: 'short_fade',
    clothingColor: '#3B82F6',
    gender: 'male',
    accentTheme: '#F59E0B',
  };

  // Facial geometry coordinates
  let leftEyeY = 145;
  let rightEyeY = 145;
  let eyeHeight = 12;
  let pupilRadius = 6;
  let leftBrowY = 126;
  let rightBrowY = 126;
  let leftBrowAngle = 0;
  let rightBrowAngle = 0;
  // Natural pleasant, friendly, welcoming warm smile for default/neutral state
  let mouthPath = 'M 130 193 Q 160 205 190 193'; 
  let mouthFill = 'none';
  let cheekGlowOpacity = 0.18;
  let headTilt = 0;
  let ambientMoodGlow = 'rgba(245, 158, 11, 0.2)';

  if (emotion === 'serious') {
    // Empathetic & Attentive: warm attentive eyes, comforting slight smile, compassionate tilt
    leftEyeY = 145;
    rightEyeY = 143;
    eyeHeight = 11;
    pupilRadius = 5.5;
    leftBrowY = 124;
    rightBrowY = 123;
    leftBrowAngle = 4; // gentle compassionate lift
    rightBrowAngle = -4;
    mouthPath = 'M 132 192 Q 160 202 188 192'; // warm reassuring curve
    headTilt = -2; // attentive forward ear-tilt
    ambientMoodGlow = 'rgba(168, 85, 247, 0.3)';
    cheekGlowOpacity = 0.25;
  } else if (emotion === 'joyful') {
    // Reassuring / Joyful: sparkling crescent eyes, bright open happy smile, rosy glowing cheeks
    leftEyeY = 142;
    rightEyeY = 142;
    eyeHeight = 9;
    pupilRadius = 5;
    leftBrowY = 121;
    rightBrowY = 121;
    leftBrowAngle = -4;
    rightBrowAngle = 4;
    mouthPath = 'M 128 188 Q 160 214 192 188 Q 160 198 128 188 Z'; // bright open smile
    mouthFill = '#991B1B';
    headTilt = 1.5;
    ambientMoodGlow = 'rgba(52, 211, 153, 0.35)';
    cheekGlowOpacity = 0.45;
  }

  // Hair rendering logic
  let hairSVG = '';
  if (config.hairStyle === 'short_fade') {
    hairSVG = `<path d="M 85 140 C 85 85, 235 85, 235 140 C 240 100, 220 70, 160 70 C 100 70, 80 100, 85 140 Z" fill="${config.hairColor}"/>`;
  } else if (config.hairStyle === 'classic_bun') {
    hairSVG = `
      <circle cx="160" cy="55" r="32" fill="${config.hairColor}"/>
      <path d="M 75 145 C 75 80, 245 80, 245 145 C 250 95, 225 65, 160 65 C 95 65, 70 95, 75 145 Z" fill="${config.hairColor}"/>
    `;
  } else if (config.hairStyle === 'wavy_long') {
    hairSVG = `
      <path d="M 70 140 C 65 80, 255 80, 250 140 C 265 190, 260 240, 245 270 C 235 240, 245 170, 235 130 C 215 80, 105 80, 85 130 C 75 170, 85 240, 75 270 C 60 240, 55 190, 70 140 Z" fill="${config.hairColor}"/>
    `;
  } else if (config.hairStyle === 'bob_cut') {
    hairSVG = `
      <path d="M 78 140 C 78 75, 242 75, 242 140 C 248 195, 235 210, 225 210 C 235 170, 230 110, 160 100 C 90 110, 85 170, 95 210 C 85 210, 72 195, 78 140 Z" fill="${config.hairColor}"/>
    `;
  } else if (config.hairStyle === 'silver_crew') {
    hairSVG = `<path d="M 85 135 C 85 85, 235 85, 235 135 C 240 95, 215 75, 160 75 C 105 75, 80 95, 85 135 Z" fill="${config.hairColor}"/>`;
  } else {
    // Sharp crop default
    hairSVG = `<path d="M 82 135 C 82 80, 238 80, 238 135 C 245 90, 215 65, 160 65 C 105 65, 75 90, 82 135 Z" fill="${config.hairColor}"/>`;
  }

  // Accessories
  let accessorySVG = '';
  if (config.accessory === 'spectacles' || config.accessory === 'glasses') {
    accessorySVG = `
      <g stroke="#E2E8F0" stroke-width="3" fill="none" opacity="0.9">
        <rect x="95" y="132" width="46" height="26" rx="6"/>
        <rect x="179" y="132" width="46" height="26" rx="6"/>
        <line x1="141" y1="145" x2="179" y2="145"/>
        <line x1="95" y1="145" x2="80" y2="140"/>
        <line x1="225" y1="145" x2="240" y2="140"/>
      </g>
    `;
  } else if (config.accessory === 'stethoscope') {
    accessorySVG = `
      <path d="M 125 245 C 125 285, 195 285, 195 245" stroke="#94A3B8" stroke-width="4" fill="none"/>
      <circle cx="160" cy="285" r="7" fill="#64748B" stroke="#E2E8F0" stroke-width="2"/>
    `;
  } else if (config.accessory === 'earring') {
    accessorySVG = `
      <circle cx="79" cy="162" r="3.5" fill="#F59E0B"/>
      <circle cx="241" cy="162" r="3.5" fill="#F59E0B"/>
    `;
  } else if (config.accessory === 'tie') {
    accessorySVG = `
      <polygon points="160,240 152,246 156,290 160,298 164,290 168,246" fill="#4338CA"/>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
      <defs>
        <radialGradient id="bgGlow_${personaId}_${emotion}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${config.accentTheme}" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="${config.accentTheme}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#0B0F19" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="skinShade" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background Atmosphere Glow -->
      <circle cx="160" cy="160" r="150" fill="url(#bgGlow_${personaId}_${emotion})"/>
      <circle cx="160" cy="160" r="130" fill="${ambientMoodGlow}" filter="url(#softGlow)"/>

      <!-- Head & Body Group with Subtle Emotion Tilt -->
      <g transform="rotate(${headTilt} 160 160)">
        <!-- Shoulders / Torso -->
        <path d="M 60 320 C 60 250, 100 235, 160 235 C 220 235, 260 250, 260 320 Z" fill="${config.clothingColor}"/>
        <!-- Collar / Neckline -->
        <path d="M 130 235 C 130 260, 190 260, 190 235 Z" fill="${config.skinTone}"/>
        <path d="M 130 235 C 130 260, 190 260, 190 235 Z" fill="url(#skinShade)"/>

        <!-- Neck -->
        <rect x="140" y="195" width="40" height="45" rx="10" fill="${config.skinTone}"/>
        <rect x="140" y="195" width="40" height="45" rx="10" fill="url(#skinShade)"/>

        <!-- Ears -->
        <circle cx="80" cy="155" r="16" fill="${config.skinTone}"/>
        <circle cx="240" cy="155" r="16" fill="${config.skinTone}"/>

        <!-- Head Oval -->
        <ellipse cx="160" cy="150" rx="72" ry="82" fill="${config.skinTone}"/>
        <ellipse cx="160" cy="150" rx="72" ry="82" fill="url(#skinShade)"/>

        <!-- Rosy Cheeks -->
        <circle cx="112" cy="168" r="14" fill="#F43F5E" opacity="${cheekGlowOpacity}"/>
        <circle cx="208" cy="168" r="14" fill="#F43F5E" opacity="${cheekGlowOpacity}"/>

        <!-- Hair Base -->
        ${hairSVG}

        <!-- Eyebrows with Emotion Angle -->
        <g stroke="${config.hairColor}" stroke-width="4.5" stroke-linecap="round">
          <line x1="102" y1="${leftBrowY}" x2="136" y2="${leftBrowY + leftBrowAngle}"/>
          <line x1="184" y1="${rightBrowY - rightBrowAngle}" x2="218" y2="${rightBrowY}"/>
        </g>

        <!-- Eyes -->
        <g fill="#FFFFFF">
          <ellipse cx="118" cy="${leftEyeY}" rx="15" ry="${eyeHeight}"/>
          <ellipse cx="202" cy="${rightEyeY}" rx="15" ry="${eyeHeight}"/>
        </g>
        <!-- Irises & Pupils -->
        <g fill="#1F2937">
          <circle cx="118" cy="${leftEyeY}" r="${pupilRadius}"/>
          <circle cx="202" cy="${rightEyeY}" r="${pupilRadius}"/>
          <!-- Eye Catchlights -->
          <circle cx="116" cy="${leftEyeY - 2}" r="2" fill="#FFFFFF"/>
          <circle cx="200" cy="${rightEyeY - 2}" r="2" fill="#FFFFFF"/>
        </g>

        <!-- Nose -->
        <path d="M 160 148 Q 163 172 155 174 Q 160 177 165 174" stroke="#8D5B3A" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Mouth with Dynamic Shape -->
        <path d="${mouthPath}" stroke="#8D3535" stroke-width="3.5" fill="${mouthFill}" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Accessories -->
        ${accessorySVG}
      </g>
    </svg>
  `;

  // Return base64 data URL
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

/**
 * Preload all expressions into Memory Cache & browser Image objects
 */
const preloadedImageStore = new Map<string, HTMLImageElement>();

export function getPersonaExpressions(personaId: string, personaName: string): PersonaExpressions {
  return {
    neutral: generatePersonaExpressionSVG(personaId, personaName, 'neutral'),
    serious: generatePersonaExpressionSVG(personaId, personaName, 'serious'),
    joyful: generatePersonaExpressionSVG(personaId, personaName, 'joyful'),
  };
}

export function preloadPersonaExpressions(personaId: string, personaName: string): void {
  const expressions = getPersonaExpressions(personaId, personaName);
  Object.entries(expressions).forEach(([emotionKey, dataUrl]) => {
    const cacheKey = `${personaId}_${emotionKey}`;
    if (!preloadedImageStore.has(cacheKey) && typeof window !== 'undefined') {
      const img = new Image();
      img.src = dataUrl;
      preloadedImageStore.set(cacheKey, img);
    }
  });
}

/**
 * Pre-cache all persona sprite images on initial application load
 * Pre-warms the browser image cache for all personas & emotional states (Neutral, Empathetic, Reassuring)
 * to guarantee instant, zero-latency state switching during live sessions.
 */
export function preCacheAllPersonaSprites(personas?: Array<{ id: string; name: string }>): void {
  if (typeof window === 'undefined') return;

  const targetList = personas && personas.length > 0 
    ? personas 
    : Object.keys(PERSONA_STYLES).map((id) => ({
        id,
        name: id.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      }));

  targetList.forEach((p) => {
    preloadPersonaExpressions(p.id, p.name);
  });
}

// Aliases for developer convenience
export const preloadAllPersonaSprites = preCacheAllPersonaSprites;
export const precachePersonaSprites = preCacheAllPersonaSprites;

