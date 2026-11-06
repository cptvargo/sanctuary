import { describe, it, expect } from 'vitest'
import { walnutifyParchmentSlides } from '../utils/parchmentTextMigration'

describe('walnutifyParchmentSlides', () => {
  it('recolours parchment slides still on the old default', () => {
    const [s] = walnutifyParchmentSlides([{ id: 1, smartMediaId: 'golden-parchment', textColor: '#2B1A08' }])
    expect(s.textColor).toBe('#3b2410')
  })

  it('keeps a colour the user chose by hand', () => {
    const [s] = walnutifyParchmentSlides([{ id: 1, smartMediaId: 'golden-parchment', textColor: '#112233' }])
    expect(s.textColor).toBe('#112233')
  })

  it('leaves other backgrounds alone, even with the same colour', () => {
    const [s] = walnutifyParchmentSlides([{ id: 1, smartMediaId: 'night-sky', textColor: '#2b1a08' }])
    expect(s.textColor).toBe('#2b1a08')
  })

  it('handles songs with no slides', () => {
    expect(walnutifyParchmentSlides(undefined)).toBeUndefined()
  })
})
