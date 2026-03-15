import { describe, it } from 'vitest'

describe('MusicPicker', () => {
  // EDIT-06a: Track list
  it.todo('fetches and renders system music tracks on mount')
  it.todo('displays track title, artist, and formatted duration')

  // EDIT-06b: Selection
  it.todo('highlights the currently selected track with a visual indicator')
  it.todo('calls onSelect with track ID when clicking an unselected track')
  it.todo('calls onSelect with null when clicking the already-selected track')

  // Preview (manual verify -- stubs for structure only)
  it.todo('creates Howl instance and plays on preview button click')
  it.todo('stops previous preview when starting a new one')
  it.todo('cleans up Howl instance on unmount')
})
