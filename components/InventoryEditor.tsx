import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Shirt, 
  Scissors, 
  Footprints, 
  Glasses, 
  Watch, 
  RotateCcw,
  Sparkles,
  X,
  Save,
  Archive,
  Trash2,
  Cpu,
  Image as ImageIcon,
  User,
  Layers,
  Wand2,
  Split,
  Palette,
  Scan,
  MousePointer2,
  Feather,
  CheckCircle2,
  Download,
  ZoomIn,
  ZoomOut,
  Move,
  Expand,
  Smile,
  UserPlus,
  Monitor,
  Smartphone,
  Square,
  Loader2,
  Briefcase
} from 'lucide-react';
import { Button } from './Button';
import { SavedLook } from '../types';

interface InventoryItem {
  id: string;
  name: string;
  icon: string; // Keep emoji as fallback/icon
  thumbnail: string; // URL for the real image
  prompt: string;
  type?: 'environment' | 'pose' | 'gear' | 'style' | 'custom' | 'hair_color' | 'hair_style' | 'texture' | 'body_type' | 'makeup' | 'batch_outfit';
  suggestedPoseIds?: string[]; // For scenes to suggest poses
}

interface InventorySlot {
  id: string;
  label: string;
  icon: React.ElementType;
  items: InventoryItem[];
}

interface InventoryEditorProps {
  imageSrc: string;
  onGenerate: (prompt: string, aspectRatio?: string) => Promise<void>;
  onGenerateOptions: (prompt: string | string[], aspectRatio?: string) => Promise<string[]>; // Updated for batch support
  isProcessing: boolean;
  onReset: () => void;
  onComplete: () => void;
  savedItems: SavedLook[];
  onSaveLook: (look: SavedLook) => void;
  onApplyLook: (imageSrc: string) => void;
  onDeleteLook: (lookId: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

// Helper to generate consistent thumbnail URLs
const getThumb = (prompt: string) => 
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=256&height=256&nologo=true&seed=42&model=flux`;

// --- LEFT COLUMN SLOTS (Attributes, Environment) ---
const LEFT_SLOTS: InventorySlot[] = [
  {
    id: 'hair_style',
    label: 'Hair Style',
    icon: Scissors,
    items: [
      { id: 'hs_bob', name: 'Bob Cut', icon: '👩', thumbnail: getThumb('white mannequin head with chic short bob haircut, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a chic short bob haircut', type: 'hair_style' },
      { id: 'hs_long', name: 'Long Layers', icon: '👩‍🦱', thumbnail: getThumb('white mannequin head with long layered flowing hair, front view, studio lighting, white background, minimalist 3d render'), prompt: 'long layered flowing hair', type: 'hair_style' },
      { id: 'hs_pixie', name: 'Pixie Cut', icon: '💇‍♀️', thumbnail: getThumb('white mannequin head with short stylish pixie cut, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a short stylish pixie cut', type: 'hair_style' },
      { id: 'hs_braids', name: 'Box Braids', icon: '🧶', thumbnail: getThumb('white mannequin head with long stylish box braids, front view, studio lighting, white background, minimalist 3d render'), prompt: 'long stylish box braids', type: 'hair_style' },
      { id: 'hs_afro', name: 'Natural Afro', icon: '🌳', thumbnail: getThumb('white mannequin head with natural voluminous afro hairstyle, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a natural voluminous afro hairstyle', type: 'hair_style' },
      { id: 'hs_ponytail', name: 'Ponytail', icon: '👱‍♀️', thumbnail: getThumb('white mannequin head with hair tied back in a high ponytail, front view, studio lighting, white background, minimalist 3d render'), prompt: 'hair tied back in a high ponytail', type: 'hair_style' },
      { id: 'hs_bun', name: 'Messy Bun', icon: '🥯', thumbnail: getThumb('white mannequin head with hair up in a casual messy bun, front view, studio lighting, white background, minimalist 3d render'), prompt: 'hair up in a casual messy bun', type: 'hair_style' },
      { id: 'hs_bald', name: 'Buzz/Bald', icon: '🧑‍🦲', thumbnail: getThumb('white mannequin head with buzz cut bald, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a buzz cut or bald head', type: 'hair_style' },
      { id: 'hs_mohawk', name: 'Mohawk', icon: '🤘', thumbnail: getThumb('white mannequin head with punk style mohawk, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a punk style mohawk', type: 'hair_style' },
      { id: 'hs_undercut', name: 'Undercut', icon: '💈', thumbnail: getThumb('white mannequin head with modern undercut hairstyle, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a modern undercut hairstyle', type: 'hair_style' },
    ]
  },
  {
    id: 'hair_color',
    label: 'Hair Color',
    icon: Palette,
    items: [
      { id: 'hc_blonde', name: 'Platinum', icon: '👱‍♀️', thumbnail: getThumb('texture swatch of platinum blonde hair, close up, high quality'), prompt: 'platinum blonde', type: 'hair_color' },
      { id: 'hc_red', name: 'Vibrant Red', icon: '👩‍🦰', thumbnail: getThumb('texture swatch of vibrant red hair, close up, high quality'), prompt: 'vibrant red', type: 'hair_color' },
      { id: 'hc_blue', name: 'Electric Blue', icon: '💙', thumbnail: getThumb('texture swatch of electric blue hair, close up, high quality'), prompt: 'electric blue', type: 'hair_color' },
      { id: 'hc_pink', name: 'Pastel Pink', icon: '🌸', thumbnail: getThumb('texture swatch of pastel pink hair, close up, high quality'), prompt: 'pastel pink', type: 'hair_color' },
      { id: 'hc_brown', name: 'Chestnut', icon: '👩🏽', thumbnail: getThumb('texture swatch of dark chestnut brown hair, close up, high quality'), prompt: 'dark chestnut brown', type: 'hair_color' },
      { id: 'hc_black', name: 'Jet Black', icon: '🖤', thumbnail: getThumb('texture swatch of jet black hair, close up, high quality'), prompt: 'jet black', type: 'hair_color' },
      { id: 'hc_silver', name: 'Silver', icon: '👵', thumbnail: getThumb('texture swatch of metallic silver hair, close up, high quality'), prompt: 'metallic silver', type: 'hair_color' },
      { id: 'hc_rainbow', name: 'Rainbow', icon: '🌈', thumbnail: getThumb('texture swatch of multicolored rainbow hair, close up, high quality'), prompt: 'multicolored rainbow', type: 'hair_color' },
      { id: 'hc_green', name: 'Neon Green', icon: '💚', thumbnail: getThumb('texture swatch of neon green hair, close up, high quality'), prompt: 'neon green', type: 'hair_color' },
    ]
  },
  {
    id: 'makeup',
    label: 'Makeup',
    icon: Smile,
    items: [
      { id: 'mu_none', name: 'No Makeup', icon: '🧼', thumbnail: getThumb('close up female face fresh natural skin no makeup, studio lighting, photorealistic'), prompt: 'fresh face, no makeup, natural skin', type: 'makeup' },
      { id: 'mu_natural', name: 'Natural Glam', icon: '✨', thumbnail: getThumb('close up female face soft natural glam makeup, studio lighting, photorealistic'), prompt: 'soft natural glam makeup', type: 'makeup' },
      { id: 'mu_redlip', name: 'Classic Red', icon: '💋', thumbnail: getThumb('close up female face classic red lipstick and winged eyeliner, studio lighting, photorealistic'), prompt: 'classic red lipstick and winged eyeliner', type: 'makeup' },
      { id: 'mu_smokey', name: 'Smokey Eye', icon: '👁️', thumbnail: getThumb('close up female face intense dark smokey eye makeup, studio lighting, photorealistic'), prompt: 'intense dark smokey eye makeup', type: 'makeup' },
      { id: 'mu_goth', name: 'Goth', icon: '🦇', thumbnail: getThumb('close up female face dark goth style makeup with black lipstick, studio lighting, photorealistic'), prompt: 'dark goth style makeup with black lipstick', type: 'makeup' },
      { id: 'mu_euphoria', name: 'Glitter', icon: '🎇', thumbnail: getThumb('close up female face euphoria style glitter and rhinestone makeup, studio lighting, photorealistic'), prompt: 'euphoria-style glitter and rhinestone makeup', type: 'makeup' },
      { id: 'mu_cyber', name: 'Cyberpunk', icon: '🦾', thumbnail: getThumb('close up female face futuristic cyberpunk face markings and metallic makeup, studio lighting, photorealistic'), prompt: 'futuristic cyberpunk face markings and metallic makeup', type: 'makeup' },
      { id: 'mu_war', name: 'War Paint', icon: '⚔️', thumbnail: getThumb('close up female face tribal warrior face paint, studio lighting, photorealistic'), prompt: 'tribal warrior face paint', type: 'makeup' },
    ]
  },
  {
    id: 'body_type',
    label: 'Body Type',
    icon: UserPlus,
    items: [
      { id: 'bt_athletic', name: 'Athletic', icon: '🏃', thumbnail: getThumb('full body white mannequin athletic toned body type, front view, studio lighting, white background, minimalist 3d render'), prompt: 'an athletic, toned body type', type: 'body_type' },
      { id: 'bt_slender', name: 'Slender', icon: '🎋', thumbnail: getThumb('full body white mannequin slender fashion model body type, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a tall, slender fashion model body type', type: 'body_type' },
      { id: 'bt_curvy', name: 'Curvy', icon: '⏳', thumbnail: getThumb('full body white mannequin curvy full figured body type, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a curvy, full-figured body type', type: 'body_type' },
      { id: 'bt_muscular', name: 'Muscular', icon: '💪', thumbnail: getThumb('full body white mannequin heavily muscular bodybuilder body type, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a heavily muscular bodybuilder body type', type: 'body_type' },
      { id: 'bt_cyborg', name: 'Cyborg', icon: '🤖', thumbnail: getThumb('full body white mannequin half human half robot cyborg body type, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a half-human half-robot cyborg body', type: 'body_type' },
      { id: 'bt_ethereal', name: 'Ethereal', icon: '👻', thumbnail: getThumb('full body white mannequin glowing semi-transparent ethereal spirit form, front view, studio lighting, white background, minimalist 3d render'), prompt: 'a glowing, semi-transparent ethereal spirit form', type: 'body_type' },
    ]
  },
  {
    id: 'scene',
    label: 'Scene',
    icon: ImageIcon,
    items: [
      { id: 's_studio', name: 'Studio', icon: '📸', thumbnail: getThumb('professional photo studio with a solid color backdrop, empty room, photography background'), prompt: 'in a professional photo studio with a solid color backdrop', type: 'environment', suggestedPoseIds: ['p_crossed', 'p_hands_pocket'] },
      { id: 's_cyber', name: 'Cyber City', icon: '🌃', thumbnail: getThumb('futuristic cyberpunk city street with neon lights and rain, scenery, background'), prompt: 'in a futuristic cyberpunk city street with neon lights and rain', type: 'environment', suggestedPoseIds: ['p_walking', 'p_looking_back'] },
      { id: 's_cafe', name: 'Coffee Shop', icon: '☕', thumbnail: getThumb('interior of a cozy warm-lit coffee shop, blurred background, photography'), prompt: 'inside a cozy warm-lit coffee shop', type: 'environment', suggestedPoseIds: ['p_sitting', 'p_drinking'] },
      { id: 's_beach', name: 'Beach Sunset', icon: '🌅', thumbnail: getThumb('tropical beach during golden hour sunset, beautiful scenery, photography'), prompt: 'on a tropical beach during golden hour sunset', type: 'environment', suggestedPoseIds: ['p_relaxing', 'p_running'] },
      { id: 's_office', name: 'Modern Office', icon: '🏢', thumbnail: getThumb('sleek modern corporate office with glass walls, interior design, background'), prompt: 'in a sleek modern corporate office with glass walls', type: 'environment', suggestedPoseIds: ['p_crossed', 'p_sitting'] },
      { id: 's_forest', name: 'Misty Forest', icon: '🌲', thumbnail: getThumb('deep misty magical pine forest path, nature photography, background'), prompt: 'deep in a misty, magical pine forest', type: 'environment', suggestedPoseIds: ['p_walking', 'p_looking_back'] },
      { id: 's_space', name: 'Space Station', icon: '🚀', thumbnail: getThumb('interior of high-tech sci-fi space station with view of earth from window, background'), prompt: 'inside a high-tech sci-fi space station with view of earth', type: 'environment', suggestedPoseIds: ['p_floating'] },
      { id: 's_dojo', name: 'Dojo', icon: '🥋', thumbnail: getThumb('interior of traditional japanese dojo, wood floor, rice paper screens, background'), prompt: 'inside a traditional japanese dojo', type: 'environment', suggestedPoseIds: ['p_martial_arts'] },
      { id: 's_redcarpet', name: 'Red Carpet', icon: '📸', thumbnail: getThumb('red carpet event background with paparazzi camera flashes, luxury event'), prompt: 'on a red carpet event with paparazzi flashes', type: 'environment', suggestedPoseIds: ['p_wave', 'p_pose'] },
      { id: 's_underwater', name: 'Underwater', icon: '🐠', thumbnail: getThumb('underwater coral reef scene, clear blue water, sunlight beams, background'), prompt: 'underwater in a coral reef (magically breathing)', type: 'environment', suggestedPoseIds: ['p_floating'] },
    ]
  },
  {
    id: 'pose',
    label: 'Pose',
    icon: User,
    items: [
      { id: 'p_crossed', name: 'Arms Crossed', icon: '🙅', thumbnail: getThumb('white mannequin standing confidently with arms crossed, full body, white background'), prompt: 'standing confidently with arms crossed', type: 'pose' },
      { id: 'p_hands_pocket', name: 'Hands in Pocket', icon: '👖', thumbnail: getThumb('white mannequin standing casually with hands in pockets, full body, white background'), prompt: 'standing casually with hands in pockets', type: 'pose' },
      { id: 'p_sitting', name: 'Sitting Down', icon: '🪑', thumbnail: getThumb('white mannequin sitting down on a cube, full body, white background'), prompt: 'sitting down comfortably', type: 'pose' },
      { id: 'p_wave', name: 'Waving', icon: '👋', thumbnail: getThumb('white mannequin waving hello, full body, white background'), prompt: 'waving a friendly hello', type: 'pose' },
      { id: 'p_peace', name: 'Peace Sign', icon: '✌️', thumbnail: getThumb('white mannequin making a peace sign gesture, full body, white background'), prompt: 'making a peace sign gesture', type: 'pose' },
      { id: 'p_walking', name: 'Walking', icon: '🚶', thumbnail: getThumb('white mannequin walking forward side view, full body, white background'), prompt: 'walking forward with purpose', type: 'pose' },
      { id: 'p_running', name: 'Running', icon: '🏃', thumbnail: getThumb('white mannequin running dynamically, full body, white background'), prompt: 'running dynamically', type: 'pose' },
      { id: 'p_drinking', name: 'Sipping Coffee', icon: '☕', thumbnail: getThumb('white mannequin holding a coffee cup and drinking, full body, white background'), prompt: 'holding and sipping from a cup', type: 'pose' },
      { id: 'p_looking_back', name: 'Looking Back', icon: '👀', thumbnail: getThumb('white mannequin standing turned away looking back over shoulder, full body, white background'), prompt: 'standing turned away but looking back over shoulder', type: 'pose' },
      { id: 'p_floating', name: 'Floating', icon: '🧚', thumbnail: getThumb('white mannequin floating in the air, defying gravity, full body, white background'), prompt: 'floating in the air defying gravity', type: 'pose' },
      { id: 'p_martial_arts', name: 'Combat Stance', icon: '🤺', thumbnail: getThumb('white mannequin in a martial arts combat stance, full body, white background'), prompt: 'in a martial arts combat stance', type: 'pose' },
      { id: 'p_pose', name: 'Fashion Pose', icon: '💃', thumbnail: getThumb('white mannequin doing a high fashion model pose, full body, white background'), prompt: 'doing a high-fashion model pose', type: 'pose' },
    ]
  },
];

// --- RIGHT COLUMN SLOTS (Gear, Accessories, Edit) ---
const RIGHT_SLOTS: InventorySlot[] = [
  {
    id: 'headgear',
    label: 'Headgear',
    icon: Crown,
    items: [
      { id: 'hg_none', name: 'No Headgear', icon: '🚫', thumbnail: getThumb('symbol for prohibited or none, minimal icon style'), prompt: 'wearing no hat or headgear', type: 'gear' },
      { id: 'hg_cap', name: 'Baseball Cap', icon: '🧢', thumbnail: getThumb('baseball cap isolated on white background, product photography'), prompt: 'wearing a baseball cap', type: 'gear' },
      { id: 'hg_beanie', name: 'Beanie', icon: '🧶', thumbnail: getThumb('knit beanie hat isolated on white background, product photography'), prompt: 'wearing a knitted beanie', type: 'gear' },
      { id: 'hg_fedora', name: 'Fedora', icon: '🎩', thumbnail: getThumb('fedora hat isolated on white background, product photography'), prompt: 'wearing a fedora hat', type: 'gear' },
      { id: 'hg_crown', name: 'Gold Crown', icon: '👑', thumbnail: getThumb('gold royal crown isolated on white background, product photography'), prompt: 'wearing a royal golden crown', type: 'gear' },
      { id: 'hg_tiara', name: 'Tiara', icon: '👸', thumbnail: getThumb('diamond tiara isolated on white background, product photography'), prompt: 'wearing a sparkling diamond tiara', type: 'gear' },
      { id: 'hg_headphones', name: 'Headphones', icon: '🎧', thumbnail: getThumb('over-ear headphones isolated on white background, product photography'), prompt: 'wearing large over-ear headphones', type: 'gear' },
      { id: 'hg_helmet', name: 'Sci-Fi Helmet', icon: '⛑️', thumbnail: getThumb('futuristic sci-fi helmet isolated on white background, product photography'), prompt: 'wearing a futuristic sci-fi helmet (visor open)', type: 'gear' },
      { id: 'hg_flowers', name: 'Flower Crown', icon: '🌸', thumbnail: getThumb('flower crown headpiece isolated on white background, product photography'), prompt: 'wearing a crown of fresh flowers', type: 'gear' },
      { id: 'hg_cowboy', name: 'Cowboy Hat', icon: '🤠', thumbnail: getThumb('leather cowboy hat isolated on white background, product photography'), prompt: 'wearing a leather cowboy hat', type: 'gear' },
    ]
  },
  {
    id: 'outfit',
    label: 'Full Outfit',
    icon: Briefcase,
    items: [
      { id: 'o_batch', name: 'Auto-Generate Wardrobe (8 Styles)', icon: '✨', thumbnail: getThumb('collection of colorful diverse fashion outfits floating, magical 3d render'), prompt: 'BATCH_GENERATE', type: 'batch_outfit' },
      { id: 'o_suit', name: 'Business Suit', icon: '👔', thumbnail: getThumb('charcoal grey business suit on ghost mannequin, white background'), prompt: 'wearing a tailored charcoal grey business suit', type: 'gear' },
      { id: 'o_dress', name: 'Evening Gown', icon: '💃', thumbnail: getThumb('red elegant evening gown on ghost mannequin, white background'), prompt: 'wearing an elegant red evening gown', type: 'gear' },
      { id: 'o_tux', name: 'Tuxedo', icon: '🤵', thumbnail: getThumb('black tuxedo with bow tie on ghost mannequin, white background'), prompt: 'wearing a classic black tuxedo', type: 'gear' },
      { id: 'o_jumpsuit', name: 'Jumpsuit', icon: '👖', thumbnail: getThumb('fashionable jumpsuit on ghost mannequin, white background'), prompt: 'wearing a stylish fashionable jumpsuit', type: 'gear' },
      { id: 'o_kimono', name: 'Kimono', icon: '👘', thumbnail: getThumb('traditional japanese kimono flowery pattern, white background'), prompt: 'wearing a beautiful traditional japanese kimono', type: 'gear' },
      { id: 'o_tracksuit', name: 'Tracksuit', icon: '👟', thumbnail: getThumb('matching athletic tracksuit on ghost mannequin, white background'), prompt: 'wearing a matching athletic tracksuit', type: 'gear' },
      { id: 'o_cyber', name: 'Cyberpunk Suit', icon: '🦾', thumbnail: getThumb('futuristic cyberpunk body suit, neon lights, white background'), prompt: 'wearing a futuristic high-tech cyberpunk suit', type: 'gear' },
    ]
  },
  {
    id: 'top',
    label: 'Tops',
    icon: Shirt,
    items: [
      { id: 't_white', name: 'White Tee', icon: '👕', thumbnail: getThumb('clean white t-shirt on ghost mannequin, white background, product photography'), prompt: 'wearing a clean white t-shirt', type: 'gear' },
      { id: 't_hoodie', name: 'Hoodie', icon: '🧖', thumbnail: getThumb('grey hoodie on ghost mannequin, white background, product photography'), prompt: 'wearing a comfortable hoodie', type: 'gear' },
      { id: 't_suit', name: 'Suit Jacket', icon: '👔', thumbnail: getThumb('navy blue suit jacket on ghost mannequin, white background, product photography'), prompt: 'wearing a formal business suit jacket', type: 'gear' },
      { id: 't_leather', name: 'Leather Jacket', icon: '🧥', thumbnail: getThumb('black leather biker jacket on ghost mannequin, white background, product photography'), prompt: 'wearing a black leather biker jacket', type: 'gear' },
      { id: 't_denim', name: 'Denim Jacket', icon: '👖', thumbnail: getThumb('blue denim jacket on ghost mannequin, white background, product photography'), prompt: 'wearing a blue denim jacket', type: 'gear' },
      { id: 't_tank', name: 'Tank Top', icon: '🎽', thumbnail: getThumb('white tank top on ghost mannequin, white background, product photography'), prompt: 'wearing a tank top', type: 'gear' },
      { id: 't_flannel', name: 'Flannel', icon: '🪵', thumbnail: getThumb('plaid flannel shirt on ghost mannequin, white background, product photography'), prompt: 'wearing a plaid flannel shirt', type: 'gear' },
      { id: 't_sweater', name: 'Knit Sweater', icon: '🧶', thumbnail: getThumb('cozy knit sweater on ghost mannequin, white background, product photography'), prompt: 'wearing a cozy knit sweater', type: 'gear' },
      { id: 't_corset', name: 'Corset', icon: '⏳', thumbnail: getThumb('victorian corset on ghost mannequin, white background, product photography'), prompt: 'wearing a victorian style corset', type: 'gear' },
      { id: 't_crop', name: 'Crop Top', icon: '👚', thumbnail: getThumb('stylish crop top on ghost mannequin, white background, product photography'), prompt: 'wearing a stylish crop top', type: 'gear' },
      { id: 't_armor', name: 'Plate Armor', icon: '🛡️', thumbnail: getThumb('medieval chest plate armor on ghost mannequin, white background, product photography'), prompt: 'wearing shining medieval plate armor', type: 'gear' },
      { id: 't_trench', name: 'Trench Coat', icon: '🧥', thumbnail: getThumb('beige trench coat on ghost mannequin, white background, product photography'), prompt: 'wearing a long beige trench coat', type: 'gear' },
    ]
  },
  {
    id: 'bottom',
    label: 'Bottoms',
    icon: Scissors,
    items: [
      { id: 'b_jeans', name: 'Blue Jeans', icon: '👖', thumbnail: getThumb('blue denim jeans isolated on white background, product photography'), prompt: 'wearing blue denim jeans', type: 'gear' },
      { id: 'b_cargo', name: 'Cargo Pants', icon: '📦', thumbnail: getThumb('utility cargo pants isolated on white background, product photography'), prompt: 'wearing utility cargo pants', type: 'gear' },
      { id: 'b_shorts', name: 'Shorts', icon: '🩳', thumbnail: getThumb('casual shorts isolated on white background, product photography'), prompt: 'wearing casual shorts', type: 'gear' },
      { id: 'b_slacks', name: 'Dress Slacks', icon: '🕴️', thumbnail: getThumb('formal dress slacks isolated on white background, product photography'), prompt: 'wearing formal dress slacks', type: 'gear' },
      { id: 'b_skirt_mini', name: 'Mini Skirt', icon: '👗', thumbnail: getThumb('short mini skirt isolated on white background, product photography'), prompt: 'wearing a short mini skirt', type: 'gear' },
      { id: 'b_skirt_long', name: 'Maxi Skirt', icon: '💃', thumbnail: getThumb('long flowing maxi skirt isolated on white background, product photography'), prompt: 'wearing a flowing long maxi skirt', type: 'gear' },
      { id: 'b_leggings', name: 'Leggings', icon: '🧘', thumbnail: getThumb('athletic leggings isolated on white background, product photography'), prompt: 'wearing athletic leggings', type: 'gear' },
      { id: 'b_chinos', name: 'Chinos', icon: '🥯', thumbnail: getThumb('beige chino pants isolated on white background, product photography'), prompt: 'wearing beige chino pants', type: 'gear' },
      { id: 'b_kilt', name: 'Kilt', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', thumbnail: getThumb('traditional tartan kilt isolated on white background, product photography'), prompt: 'wearing a traditional tartan kilt', type: 'gear' },
      { id: 'b_leather', name: 'Leather Pants', icon: '🎸', thumbnail: getThumb('black leather pants isolated on white background, product photography'), prompt: 'wearing tight black leather pants', type: 'gear' },
      { id: 'b_sweats', name: 'Sweatpants', icon: '🛌', thumbnail: getThumb('grey sweatpants isolated on white background, product photography'), prompt: 'wearing comfortable grey sweatpants', type: 'gear' },
    ]
  },
  {
    id: 'texture',
    label: 'Fabric & Color',
    icon: Palette,
    items: [
       { id: 'tx_sheer_50', name: 'Ultra Sheer', icon: '🌫️', thumbnail: getThumb('fabric texture swatch semi-transparent sheer silk chiffon 50% opacity, white background'), prompt: 'made of ultra-thin 50% sheer semi-transparent fabric', type: 'texture' },
       { id: 'tx_velvet', name: 'Velvet', icon: '🧶', thumbnail: getThumb('fabric texture swatch crushed velvet, white background'), prompt: 'made of soft crushed velvet fabric', type: 'texture' },
       { id: 'tx_denim', name: 'Denim', icon: '👖', thumbnail: getThumb('fabric texture swatch blue denim, white background'), prompt: 'made of sturdy blue denim fabric', type: 'texture' },
       { id: 'tx_leather', name: 'Leather', icon: '🧥', thumbnail: getThumb('fabric texture swatch black leather, white background'), prompt: 'made of sleek black leather', type: 'texture' },
       { id: 'tx_latex', name: 'Latex', icon: '🧤', thumbnail: getThumb('fabric texture swatch shiny black latex, white background'), prompt: 'made of shiny tight latex', type: 'texture' },
       { id: 'tx_satin', name: 'Satin', icon: '🎀', thumbnail: getThumb('fabric texture swatch silky smooth satin, white background'), prompt: 'made of smooth silky satin', type: 'texture' },
       { id: 'tx_cotton', name: 'Cotton', icon: '👕', thumbnail: getThumb('fabric texture swatch plain cotton, white background'), prompt: 'made of simple soft cotton fabric', type: 'texture' },
       { id: 'tx_wool', name: 'Wool', icon: '🐑', thumbnail: getThumb('fabric texture swatch knitted wool, white background'), prompt: 'made of thick knitted wool', type: 'texture' },
       { id: 'tx_red', name: 'Red Dye', icon: '🔴', thumbnail: getThumb('color swatch vibrant red fabric texture, white background'), prompt: 'dyed vibrant red', type: 'texture' },
       { id: 'tx_blue', name: 'Blue Dye', icon: '🔵', thumbnail: getThumb('color swatch vibrant blue fabric texture, white background'), prompt: 'dyed deep blue', type: 'texture' },
       { id: 'tx_black', name: 'Black Dye', icon: '⚫', thumbnail: getThumb('color swatch jet black fabric texture, white background'), prompt: 'dyed jet black', type: 'texture' },
       { id: 'tx_white', name: 'White Dye', icon: '⚪', thumbnail: getThumb('color swatch pure white fabric texture, white background'), prompt: 'dyed pure white', type: 'texture' },
    ]
  },
  {
    id: 'acc',
    label: 'Accessories',
    icon: Watch,
    items: [
      { id: 'a_none', name: 'Remove Acc', icon: '🚫', thumbnail: getThumb('symbol for prohibited or none, minimal icon style'), prompt: 'wearing no accessories, jewelry, or bags', type: 'gear' },
      { id: 'a_chain', name: 'Gold Chain', icon: '⛓️', thumbnail: getThumb('gold chain necklace isolated on white background, product photography'), prompt: 'wearing a thick gold chain necklace', type: 'gear' },
      { id: 'a_glasses', name: 'Sunglasses', icon: '🕶️', thumbnail: getThumb('sunglasses isolated on white background, product photography'), prompt: 'wearing stylish sunglasses', type: 'gear' },
      { id: 'a_specs', name: 'Glasses', icon: '👓', thumbnail: getThumb('prescription glasses frames isolated on white background, product photography'), prompt: 'wearing prescription glasses', type: 'gear' },
      { id: 'a_scarf', name: 'Scarf', icon: '🧣', thumbnail: getThumb('winter scarf isolated on white background, product photography'), prompt: 'wearing a warm scarf', type: 'gear' },
      { id: 'a_backpack', name: 'Backpack', icon: '🎒', thumbnail: getThumb('backpack isolated on white background, product photography'), prompt: 'wearing a backpack', type: 'gear' },
      { id: 'a_watch', name: 'Rolex', icon: '⌚', thumbnail: getThumb('luxury wristwatch isolated on white background, product photography'), prompt: 'wearing a luxury wristwatch', type: 'gear' },
      { id: 'a_wings', name: 'Angel Wings', icon: '👼', thumbnail: getThumb('white feathered angel wings isolated on white background, product photography'), prompt: 'with large white feathered angel wings on back', type: 'gear' },
      { id: 'a_guitar', name: 'Guitar', icon: '🎸', thumbnail: getThumb('electric guitar isolated on white background, product photography'), prompt: 'with an electric guitar slung over shoulder', type: 'gear' },
      { id: 'a_sword', name: 'Katana', icon: '⚔️', thumbnail: getThumb('katana sword isolated on white background, product photography'), prompt: 'with a katana sword on back', type: 'gear' },
      { id: 'a_tatoo', name: 'Arm Tattoo', icon: '🐉', thumbnail: getThumb('arm tattoo design isolated on white background, illustration'), prompt: 'with visible intricate tattoos on arms', type: 'gear' },
      { id: 'a_pet', name: 'Shoulder Pet', icon: '🦜', thumbnail: getThumb('colorful parrot isolated on white background, product photography'), prompt: 'with a small cute parrot sitting on the shoulder', type: 'gear' },
    ]
  },
  {
    id: 'custom',
    label: 'Magic Edit',
    icon: Wand2,
    items: [] // Handled specially
  }
];

const ItemThumbnail: React.FC<{ item: InventoryItem, isRecommended: boolean }> = ({ item, isRecommended }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
      {/* Skeleton / Loading State */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      )}

      {/* Real Image */}
      {imageStatus !== 'error' && (
        <img 
          src={item.thumbnail} 
          alt={item.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
        />
      )}

      {/* Error Fallback */}
      {imageStatus === 'error' && (
         <div className="w-full h-full flex items-center justify-center bg-slate-800/50 absolute inset-0 z-10">
            <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform">{item.icon}</span>
         </div>
      )}

      {/* Overlays (Gradient, Badges) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />
      
      {isRecommended && (
          <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md">
              SUGGESTED
          </span>
      )}
      {item.id.includes('none') && (
          <span className="absolute top-2 right-2 text-[10px] bg-red-500/90 text-white px-1.5 rounded font-bold z-20">REMOVE</span>
      )}
      {/* Small Icon Overlay when image IS loaded (to help ID it) */}
      {imageStatus === 'loaded' && (
          <span className="absolute bottom-2 right-2 text-xl drop-shadow-md z-20 transform scale-75 origin-bottom-right opacity-80">{item.icon}</span>
      )}
    </div>
  );
};

export const InventoryEditor: React.FC<InventoryEditorProps> = ({
  imageSrc,
  onGenerate,
  onGenerateOptions,
  isProcessing,
  onReset,
  savedItems,
  onSaveLook,
  onApplyLook,
  onDeleteLook,
  onUndo,
  canUndo
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'wardrobe'>('create');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisText, setAnalysisText] = useState("Initializing System...");

  // Custom prompt state
  const [customPrompt, setCustomPrompt] = useState('');
  
  // State for Review Mode (Selection Options)
  const [generatedOptions, setGeneratedOptions] = useState<string[] | null>(null);

  // State for Texture Target Selection
  const [pendingTextureItem, setPendingTextureItem] = useState<InventoryItem | null>(null);
  
  // State for saving flow
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveSlotId, setSaveSlotId] = useState<string>('top'); 
  const [lastEditedSlot, setLastEditedSlot] = useState<string | null>(null);

  // Expand / Aspect Ratio State
  const [showExpandModal, setShowExpandModal] = useState(false);

  // Contextual Awareness
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const isDragGestureRef = useRef(false);

  // Reset zoom on image change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageSrc]);

  // Analysis Effect
  useEffect(() => {
    const sequence = [
      { text: "Scanning Biometrics...", time: 800 },
      { text: "Identifying Outfit Layers...", time: 1600 },
      { text: "Mapping Skeleton...", time: 2400 },
      { text: "Analysis Complete.", time: 3000 }
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach(({ text, time }) => {
      const t = setTimeout(() => {
        setAnalysisText(text);
        if (time === 3000) setIsAnalyzing(false);
      }, time);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleItemClick = async (slotLabel: string, slotId: string, item: InventoryItem) => {
    if (item.type === 'texture') {
        setPendingTextureItem(item);
        setSelectedSlot(null); // Close main selection
        return;
    }

    if (item.type === 'batch_outfit') {
      const batchPrompts = [
        "Change the character's entire outfit to a sophisticated modern business suit, charcoal grey, tailored fit. Maintain facial identity.",
        "Change the character's entire outfit to a trendy oversized streetwear outfit with hoodie and cargo pants. Maintain facial identity.",
        "Change the character's entire outfit to an elegant evening gown or tuxedo, midnight blue, red carpet style. Maintain facial identity.",
        "Change the character's entire outfit to a futuristic cyberpunk outfit with neon accents and techwear. Maintain facial identity.",
        "Change the character's entire outfit to a vintage 90s retro casual outfit with denim jacket and vibrant colors. Maintain facial identity.",
        "Change the character's entire outfit to a bohemian chic outfit with flowy fabrics and earth tones. Maintain facial identity.",
        "Change the character's entire outfit to an avant-garde high fashion sculptural outfit. Maintain facial identity.",
        "Change the character's entire outfit to a minimalist monochrome outfit, clean lines, all white or beige. Maintain facial identity."
      ];
      triggerGeneration(batchPrompts, slotId);
      return;
    }

    // Update context if scene selected
    if (item.type === 'environment') {
        setCurrentSceneId(item.id);
    }

    let prompt = "";
    
    if (item.type === 'environment') {
        prompt = `Place the character ${item.prompt}. IMPORTANT: Adjust the character's pose and lighting to naturally fit this environment (e.g., if sitting is natural for the scene, sit). Maintain the current outfit details and facial identity exactly. Photorealistic.`;
    } else if (item.type === 'pose') {
        prompt = `Change the character's pose to be ${item.prompt}. Keep the current outfit and facial identity exactly the same. Photorealistic.`;
    } else if (item.type === 'hair_color') {
        prompt = `Change the hair color to ${item.prompt}. CRITICAL: Maintain the exact current hairstyle, length, volume, and texture. Do not cut or restyle the hair, only change the pigment to ${item.prompt}. Photorealistic.`;
    } else if (item.type === 'hair_style') {
        prompt = `Change the character's hairstyle to ${item.prompt}. Maintain the current hair color if possible, and facial identity exactly. Photorealistic.`;
    } else if (item.type === 'makeup') {
        prompt = `Change the character's makeup to ${item.prompt}. Maintain facial identity and realistic skin texture. Photorealistic.`;
    } else if (item.type === 'body_type') {
        prompt = `Change the character's body structure to be ${item.prompt}. CRITICAL: Keep the facial identity, head, and current outfit style/colors exactly the same, just adjust the fit to the new body shape. Photorealistic.`;
    } else {
        // Gear/Clothing
        prompt = `Change the person's ${slotLabel.toLowerCase()} to ${item.prompt}. Maintain facial identity, pose, and other clothing details exactly as they are. Photorealistic, high quality.`;
    }

    triggerGeneration(prompt, slotId);
  };

  const handleTextureApply = (item: InventoryItem, target: string) => {
    let prompt = "";
    if (target === 'outfit') {
      prompt = `Change the person's entire outfit to be ${item.prompt}. Maintain facial identity, pose, and garment cut/style exactly. Do NOT add any accessories.`;
    } else {
      prompt = `Change the person's ${target} to be ${item.prompt}. Maintain facial identity, pose, and style of the garment exactly. Do NOT add any accessories.`;
    }
    triggerGeneration(prompt, 'texture');
    setPendingTextureItem(null);
  };

  const handleExpandClick = () => {
    setShowExpandModal(true);
  };

  const handleConfirmExpand = (ratio: string) => {
    const prompt = "Extend the image boundaries to fill the selected aspect ratio (outpainting). Generate new background content seamlessly. IMPORTANT: Keep the main character at the same scale and size; do not zoom out or shrink the character. Just add more environment around them.";
    triggerGeneration(prompt, 'expand', ratio);
    setShowExpandModal(false);
  };

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) return;
    const prompt = `Edit this photo: ${customPrompt}. Maintain facial identity and realistic quality.`;
    triggerGeneration(prompt, 'custom');
  };

  const triggerGeneration = async (prompt: string | string[], slotId: string, aspectRatio?: string) => {
    setSelectedSlot(null);
    setLastEditedSlot(slotId);
    setCustomPrompt(''); 
    
    const results = await onGenerateOptions(prompt, aspectRatio);
    if (results.length > 0) {
      setGeneratedOptions(results);
    }
  };

  const handleOptionSelect = (selectedImage: string) => {
    onApplyLook(selectedImage);
    setGeneratedOptions(null);
  };

  const handleOptionCancel = () => {
    setGeneratedOptions(null);
  };

  const handleStartSave = () => {
    setIsSaving(true);
    setSaveSlotId(lastEditedSlot || 'top'); 
    setSaveName('');
  };

  const handleConfirmSave = () => {
    if (!saveName.trim()) return;
    const newLook: SavedLook = {
      id: Date.now().toString(),
      name: saveName,
      slotId: saveSlotId,
      imageSrc: imageSrc,
      timestamp: Date.now()
    };
    onSaveLook(newLook);
    setIsSaving(false);
  };

  const handleEquipSaved = (look: SavedLook) => {
    onApplyLook(look.imageSrc);
    setSelectedSlot(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `style-shift-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Zoom & Pan Handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomSensitivity = 0.001;
    const newZoom = Math.min(Math.max(1, zoom - e.deltaY * zoomSensitivity), 4);
    setZoom(newZoom);
    if (newZoom === 1) setPan({ x: 0, y: 0 }); 
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        isDragGestureRef.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && dragStartRef.current) {
        e.preventDefault();
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        if (Math.abs(newX - pan.x) > 2 || Math.abs(newY - pan.y) > 2) {
             isDragGestureRef.current = true;
        }
        setPan({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 4));
  const handleZoomOut = () => {
      const newZoom = Math.max(1, zoom - 0.5);
      setZoom(newZoom);
      if (newZoom === 1) setPan({ x: 0, y: 0 });
  };
  const handleZoomReset = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
  };

  // Combine slots for lookup
  const ALL_SLOTS = [...LEFT_SLOTS, ...RIGHT_SLOTS];
  const activeSlot = ALL_SLOTS.find(s => s.id === selectedSlot);
  const activeSlotSavedItems = activeSlot ? savedItems.filter(item => item.slotId === activeSlot.id) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto gap-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Palette className="text-indigo-400" /> 
          Studio Editor
        </h2>
        <div className="flex gap-3">
          <button 
             onClick={handleExpandClick}
             disabled={isProcessing}
             className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
             title="Expand boundaries and fill background"
          >
             <Expand className="w-4 h-4" /> AI Expand
          </button>
          <div className="h-8 w-px bg-slate-700 mx-1"></div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Undo last change"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-8 w-px bg-slate-700 mx-1"></div>
          <button 
            onClick={onReset}
            className="text-slate-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 relative min-h-0">
        
        {/* --- LEFT COLUMN (Attributes) --- */}
        <div className="w-24 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {LEFT_SLOTS.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
                setActiveTab('create');
              }}
              className={`relative group flex flex-col items-center justify-center h-20 w-full shrink-0 rounded-xl border-2 transition-all duration-200
                ${selectedSlot === slot.id 
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                }
              `}
            >
              <slot.icon className={`w-6 h-6 mb-1 ${selectedSlot === slot.id ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 text-center leading-tight px-1">{slot.label}</span>
              {/* Connector */}
              <div className={`absolute -right-3 top-1/2 w-3 h-0.5 transition-colors ${selectedSlot === slot.id ? 'bg-indigo-500' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>

        {/* --- CENTER (Canvas) --- */}
        <div 
            className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 relative flex items-center justify-center overflow-hidden shadow-2xl group select-none cursor-default"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Grid Background Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            
            {/* Image Wrapper */}
            <div 
                className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center"
                style={{ 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
            >
                <img 
                  src={imageSrc} 
                  alt="Character" 
                  className="relative max-w-full max-h-full object-contain z-10 drop-shadow-2xl transition-all duration-500 pointer-events-none"
                  style={{ filter: isProcessing ? 'blur(2px) grayscale(0.5)' : 'none' }}
                  draggable={false}
                />
            </div>

            {/* Quick Save */}
            {!isProcessing && !isSaving && !generatedOptions && !isAnalyzing && (
              <button
                onClick={handleStartSave}
                className="absolute top-4 right-4 z-30 bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-lg border border-slate-600 shadow-lg flex items-center gap-2 hover:bg-indigo-600 hover:border-indigo-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
              >
                <Save className="w-4 h-4" />
                Save Look
              </button>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                <button onClick={handleZoomOut} disabled={zoom <= 1} className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-sm border border-slate-600 disabled:opacity-50">
                    <ZoomOut className="w-5 h-5" />
                </button>
                <div className="bg-slate-800/80 text-white px-3 py-2 rounded-full backdrop-blur-sm border border-slate-600 text-xs font-mono font-bold flex items-center min-w-[3rem] justify-center">
                    {Math.round(zoom * 100)}%
                </div>
                <button onClick={handleZoomIn} disabled={zoom >= 4} className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-sm border border-slate-600 disabled:opacity-50">
                    <ZoomIn className="w-5 h-5" />
                </button>
                {zoom > 1 && (
                     <button onClick={handleZoomReset} className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-sm border border-slate-600 ml-2">
                        <Move className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Analysis Overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center font-mono pointer-events-none">
                    <div className="relative w-64 h-64 border-2 border-indigo-500/30 rounded-lg flex items-center justify-center overflow-hidden">
                         <div className="absolute top-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-scan" />
                         <Scan className="w-16 h-16 text-indigo-400 opacity-50 animate-pulse" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-indigo-300 text-sm tracking-widest uppercase">
                        <Cpu className="w-4 h-4 animate-spin-slow" />
                        {analysisText}
                    </div>
                </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <>
                <div className="absolute inset-0 bg-slate-900/60 z-20 backdrop-blur-sm" />
                <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] z-30 animate-scan" />
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse-ring opacity-75"></div>
                    <div className="relative bg-slate-900 p-4 rounded-full border border-indigo-500/50 shadow-2xl shadow-indigo-500/20">
                      <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-1 text-center">
                    <h3 className="text-xl font-bold text-white tracking-widest uppercase">Processing</h3>
                    <p className="text-indigo-300 text-xs font-mono">Generating High-Fidelity Output</p>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* --- RIGHT COLUMN (Gear) --- */}
        <div className="w-24 flex flex-col gap-2 overflow-y-auto custom-scrollbar pl-2">
          {RIGHT_SLOTS.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
                setActiveTab('create');
              }}
              className={`relative group flex flex-col items-center justify-center h-20 w-full shrink-0 rounded-xl border-2 transition-all duration-200
                ${selectedSlot === slot.id 
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                }
              `}
            >
              <div className={`absolute -left-3 top-1/2 w-3 h-0.5 transition-colors ${selectedSlot === slot.id ? 'bg-indigo-500' : 'bg-transparent'}`} />
              <slot.icon className={`w-6 h-6 mb-1 ${selectedSlot === slot.id ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 text-center leading-tight px-1">{slot.label}</span>
            </button>
          ))}
        </div>

        {/* --- MODALS & OVERLAYS --- */}

        {/* Expand Options Modal */}
        {showExpandModal && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-600 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Expand className="text-indigo-400" /> Expand & Resize
                    </h3>
                    <button onClick={() => setShowExpandModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-slate-400 mb-6">
                    Choose a new aspect ratio. The AI will zoom out and generate new content to fill the frame based on the current scene.
                </p>

                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => handleConfirmExpand('1:1')} className="flex flex-col items-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all group">
                        <Square className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-2" />
                        <span className="font-bold text-white">Square</span>
                        <span className="text-xs text-slate-500">1:1</span>
                    </button>
                    <button onClick={() => handleConfirmExpand('16:9')} className="flex flex-col items-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all group">
                        <Monitor className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-2" />
                        <span className="font-bold text-white">Wide</span>
                        <span className="text-xs text-slate-500">16:9</span>
                    </button>
                    <button onClick={() => handleConfirmExpand('9:16')} className="flex flex-col items-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all group">
                        <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-2" />
                        <span className="font-bold text-white">Portrait</span>
                        <span className="text-xs text-slate-500">9:16</span>
                    </button>
                    <button onClick={() => handleConfirmExpand('4:3')} className="flex flex-col items-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all group">
                        <div className="w-8 h-6 border-2 border-current rounded-sm text-slate-400 group-hover:text-indigo-400 mb-2" />
                        <span className="font-bold text-white">Classic</span>
                        <span className="text-xs text-slate-500">4:3</span>
                    </button>
                    <button onClick={() => handleConfirmExpand('3:4')} className="flex flex-col items-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all group">
                        <div className="w-6 h-8 border-2 border-current rounded-sm text-slate-400 group-hover:text-indigo-400 mb-2" />
                        <span className="font-bold text-white">Tall</span>
                        <span className="text-xs text-slate-500">3:4</span>
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Review Options Overlay */}
        {generatedOptions && (
            <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in">
                <div className="w-full max-w-6xl flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Split className="text-teal-400" /> Select Variant
                        </h2>
                        <Button variant="ghost" onClick={handleOptionCancel}>Cancel</Button>
                    </div>
                    {/* Dynamic Grid: 4 columns if more than 2 items (like batch 8), else 2 columns */}
                    <div className={`flex-1 grid gap-4 items-center justify-center overflow-y-auto custom-scrollbar p-2 ${generatedOptions.length > 2 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                        {generatedOptions.map((opt, idx) => (
                            <div key={idx} className="flex flex-col h-full min-h-[200px]">
                                <div className="relative flex-1 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-teal-500 group transition-all cursor-pointer shadow-xl"
                                     onClick={() => handleOptionSelect(opt)}
                                >
                                    <img src={opt} alt={`Option ${idx + 1}`} className="w-full h-full object-contain bg-slate-900" />
                                    <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-teal-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                            Select This Look
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-white border border-slate-600">
                                        OPTION {idx + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Texture Target Selection Modal */}
        {pendingTextureItem && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Apply {pendingTextureItem.name}</h3>
                <p className="text-slate-400 mb-6 text-sm">Where should this fabric/texture be applied?</p>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => handleTextureApply(pendingTextureItem, 'top')} className="p-3 bg-slate-800 hover:bg-indigo-600 border border-slate-700 rounded-xl transition-all flex flex-col items-center gap-2">
                      <Shirt className="w-6 h-6" /> <span className="text-sm font-bold">Top</span>
                   </button>
                   <button onClick={() => handleTextureApply(pendingTextureItem, 'bottom')} className="p-3 bg-slate-800 hover:bg-indigo-600 border border-slate-700 rounded-xl transition-all flex flex-col items-center gap-2">
                      <Scissors className="w-6 h-6" /> <span className="text-sm font-bold">Bottoms</span>
                   </button>
                   <button onClick={() => handleTextureApply(pendingTextureItem, 'outfit')} className="p-3 bg-slate-800 hover:bg-indigo-600 border border-slate-700 rounded-xl transition-all flex flex-col items-center gap-2">
                      <User className="w-6 h-6" /> <span className="text-sm font-bold">Full Outfit</span>
                   </button>
                   <button onClick={() => handleTextureApply(pendingTextureItem, 'headgear')} className="p-3 bg-slate-800 hover:bg-indigo-600 border border-slate-700 rounded-xl transition-all flex flex-col items-center gap-2">
                      <Crown className="w-6 h-6" /> <span className="text-sm font-bold">Headgear</span>
                   </button>
                </div>
                <button onClick={() => setPendingTextureItem(null)} className="w-full mt-4 py-2 text-slate-400 hover:text-white">Cancel</button>
             </div>
          </div>
        )}

        {/* Item Selection Panel */}
        {activeSlot && !generatedOptions && !pendingTextureItem && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
             <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/20 rounded-lg">
                   <activeSlot.icon className="w-6 h-6 text-indigo-400" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">{activeSlot.id === 'custom' ? 'Custom Prompt' : `Select ${activeSlot.label}`}</h3>
                   <p className="text-xs text-slate-400">
                     {activeSlot.id === 'custom' ? 'Describe anything' : 'Choose or equip items'}
                   </p>
                 </div>
               </div>
               <button 
                 onClick={() => setSelectedSlot(null)}
                 className="p-1 hover:bg-slate-700 rounded-full transition-colors"
               >
                 <X className="w-5 h-5 text-slate-400" />
               </button>
             </div>

             {/* Custom Slot */}
             {activeSlot.id === 'custom' ? (
                <div className="flex flex-col gap-4">
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g. Change hair to pink, add a tattoo on arm, make them hold a coffee cup..."
                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    autoFocus
                  />
                  <Button onClick={handleCustomGenerate} disabled={!customPrompt.trim() || isProcessing}>
                     <Wand2 className="w-4 h-4 mr-2" /> Magic Edit
                  </Button>
                </div>
             ) : (
                 <>
                     {/* Tabs */}
                     <div className="flex gap-2 mb-4 bg-slate-800/50 p-1 rounded-lg">
                       <button 
                         onClick={() => setActiveTab('create')}
                         className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                       >
                         <span className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Generate</span>
                       </button>
                       <button 
                         onClick={() => setActiveTab('wardrobe')}
                         className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'wardrobe' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                       >
                         <span className="flex items-center justify-center gap-2"><Archive className="w-4 h-4" /> My Wardrobe ({activeSlotSavedItems.length})</span>
                       </button>
                     </div>

                     {/* Content */}
                     <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                       {activeTab === 'create' && (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                           {activeSlot.items.map((item) => {
                             // Check if this item is a suggested pose based on current scene
                             const currentScene = LEFT_SLOTS.find(s => s.id === 'scene')?.items.find(i => i.id === currentSceneId);
                             const isRecommended = item.type === 'pose' && currentScene && currentScene.suggestedPoseIds?.includes(item.id);
                             const isSpecialBatch = item.type === 'batch_outfit';

                             return (
                               <button
                                 key={item.id}
                                 disabled={isProcessing}
                                 onClick={() => handleItemClick(activeSlot.label, activeSlot.id, item)}
                                 className={`group flex flex-col items-center overflow-hidden bg-slate-800 border rounded-xl transition-all active:scale-95 disabled:opacity-50 relative
                                    ${isRecommended ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}
                                    ${isSpecialBatch ? 'border-teal-500 bg-teal-900/20 hover:bg-teal-900/40 col-span-2' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-750'}
                                 `}
                               >
                                  <ItemThumbnail item={item} isRecommended={!!isRecommended} />
                                 
                                 <div className="w-full p-3 bg-slate-800 group-hover:bg-slate-750 transition-colors border-t border-slate-700">
                                     <span className={`text-xs font-medium text-center leading-tight block truncate ${isSpecialBatch ? 'text-teal-300 font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                                         {item.name}
                                     </span>
                                 </div>
                               </button>
                             );
                           })}
                         </div>
                       )}

                       {activeTab === 'wardrobe' && (
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {activeSlotSavedItems.length === 0 ? (
                              <div className="col-span-full text-center py-8 text-slate-500">
                                <p>No saved items yet.</p>
                              </div>
                            ) : (
                                activeSlotSavedItems.map((look) => (
                                  <div key={look.id} className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-teal-500">
                                     <button onClick={() => handleEquipSaved(look)} className="w-full text-left">
                                        <img src={look.imageSrc} alt={look.name} className="w-full aspect-square object-cover object-top opacity-80 group-hover:opacity-100" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2">
                                          <p className="text-white text-xs font-medium truncate">{look.name}</p>
                                        </div>
                                     </button>
                                     <button 
                                          onClick={(e) => { e.stopPropagation(); onDeleteLook(look.id); }}
                                          className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                     </button>
                                  </div>
                                ))
                            )}
                         </div>
                       )}
                     </div>
                 </>
             )}
          </div>
        )}

        {/* Save Dialog */}
        {isSaving && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-slate-900 border border-slate-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-4">Save to Wardrobe</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Item Name (e.g. Red Hoodie)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                  />
                  <select 
                      value={saveSlotId}
                      onChange={(e) => setSaveSlotId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {ALL_SLOTS.map(slot => (
                        <option key={slot.id} value={slot.id}>{slot.label}</option>
                      ))}
                    </select>
                  <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsSaving(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleConfirmSave} disabled={!saveName.trim()} className="flex-1">Save</Button>
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>
      <p className="text-center text-slate-500 text-[10px] md:text-xs">
         Scroll to Zoom • Drag to Pan • Use "AI Expand" to zoom out
      </p>
    </div>
  );
};