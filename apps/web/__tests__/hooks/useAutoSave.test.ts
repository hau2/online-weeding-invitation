import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAutoSave } from '@/app/(app)/thep-cuoi/[id]/useAutoSave'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockApiFetch.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces save calls by 800ms', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'A' })
    })

    // Before 800ms -- should not have called apiFetch yet
    expect(mockApiFetch).not.toHaveBeenCalled()

    // Advance 800ms
    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('sends PATCH with only changed fields', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ brideName: 'Minh' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/invitations/inv-001',
      expect.objectContaining({
        method: 'PATCH',
        body: { brideName: 'Minh' },
        credentials: 'include',
      }),
    )
  })

  it('sets status to saving while request is in flight', async () => {
    let resolvePromise: (value: { data: object; error: null }) => void
    mockApiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'Thao' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(result.current.status).toBe('saving')

    await act(async () => {
      resolvePromise!({ data: {}, error: null })
    })
  })

  it('sets status to saved on success', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'Thao' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(result.current.status).toBe('saved')
  })

  it('sets status to error on failure', async () => {
    mockApiFetch.mockResolvedValue({ data: null, error: 'Server error' })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'Thao' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(result.current.status).toBe('error')
    expect(toast.error).toHaveBeenCalledWith('Server error')
  })

  it('resets status to idle after 2 seconds', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'Thao' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    expect(result.current.status).toBe('saved')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.status).toBe('idle')
  })

  it('clears timer on unmount', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result, unmount } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'Thao' })
    })

    unmount()

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    // Should not have called apiFetch since we unmounted before the debounce fired
    expect(mockApiFetch).not.toHaveBeenCalled()
  })

  it('uses latest data from ref, not stale closure', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAutoSave('inv-001'))

    act(() => {
      result.current.save({ groomName: 'A' })
    })

    // Call save again within the debounce window with different data
    act(() => {
      result.current.save({ groomName: 'B' })
    })

    await act(async () => {
      vi.advanceTimersByTime(800)
    })

    // Should only have called once with the merged latest data
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/invitations/inv-001',
      expect.objectContaining({
        body: { groomName: 'B' },
      }),
    )
  })
})
