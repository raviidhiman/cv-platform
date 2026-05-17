export const FONTS = {
  garamond: { label: 'EB Garamond', css: "'EB Garamond', Georgia, serif", category: 'serif' },
  garamond_classic: { label: 'Garamond', css: "Garamond, 'Times New Roman', serif", category: 'serif' },
  times: { label: 'Times New Roman', css: "'Times New Roman', Times, serif", category: 'serif' },
  calibri: { label: 'Calibri', css: "Calibri, 'Gill Sans', sans-serif", category: 'sans' },
  arial: { label: 'Arial', css: "Arial, Helvetica, sans-serif", category: 'sans' },
  playfair: { label: 'Playfair Display', css: "'Playfair Display', Georgia, serif", category: 'serif' },
  lora: { label: 'Lora', css: "'Lora', Georgia, serif", category: 'serif' },
  montserrat: { label: 'Montserrat', css: "'Montserrat', sans-serif", category: 'sans' },
  roboto: { label: 'Roboto', css: "'Roboto', sans-serif", category: 'sans' },
  inter: { label: 'Inter', css: "'Inter', sans-serif", category: 'sans' },
}

export const TEMPLATES = [
  { id: 'classic', label: 'Classic', desc: 'LaTeX academic style — minimal black & white' },
  { id: 'modern', label: 'Modern', desc: 'Two-column with subtle accents' },
  { id: 'creative', label: 'Creative', desc: 'Bold sidebar with timeline' },
  { id: 'minimal', label: 'Minimal', desc: 'Ultra clean with generous whitespace' },
  { id: 'executive', label: 'Executive', desc: 'Professional header banner layout' },
]

export const getFontCSS = (fontKey) => FONTS[fontKey]?.css || FONTS.garamond.css
export const getFontSize = (size) => ({ small: '11px', medium: '12px', large: '14px' }[size] || '12px')
