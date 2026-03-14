import { describe, it, expect, vi } from 'vitest'

describe('useAutoSave', () => {
  it.todo('debounces save calls by 800ms')
  it.todo('sends PATCH with only changed fields')
  it.todo('sets status to saving while request is in flight')
  it.todo('sets status to saved on success')
  it.todo('sets status to error on failure')
  it.todo('resets status to idle after 2 seconds')
  it.todo('clears timer on unmount')
  it.todo('uses latest data from ref, not stale closure')
})
