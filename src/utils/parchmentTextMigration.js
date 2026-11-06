// Golden Parchment's default text colour changed from near-black to walnut in v1.4.9.
// Slides saved before that keep the old value; this recolours only slides still on the old
// default, so any colour the user picked by hand is left alone.
export const OLD_PARCHMENT_TEXT = '#2b1a08'
export const WALNUT_TEXT = '#3b2410'

export function walnutifyParchmentSlides(slides) {
  return slides?.map((s) =>
    s.smartMediaId === 'golden-parchment' && s.textColor?.toLowerCase() === OLD_PARCHMENT_TEXT
      ? { ...s, textColor: WALNUT_TEXT }
      : s
  )
}
