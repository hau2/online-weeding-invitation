import { describe, it } from 'vitest'

describe('PhotoGallery', () => {
  // EDIT-04a: Upload
  it.todo('renders a drop zone with "Tha anh vao day" text when dragging files over')
  it.todo('calls apiUpload with FormData containing selected files on file input change')
  it.todo('calls onChange with updated photoUrls array on successful upload')
  it.todo('shows toast error on upload failure')
  it.todo('disables add button and shows message when 10 photos reached')

  // EDIT-04b: Rendering
  it.todo('renders thumbnails in a 3-column grid matching photoUrls order')
  it.todo('renders drag handle and delete button on each thumbnail')
  it.todo('renders "+" add button as last grid item when under 10 photos')

  // EDIT-04c: Reorder
  it.todo('calls onChange with reordered array after drag-end')

  // EDIT-04d: Delete
  it.todo('calls apiFetch DELETE for the photo at the given index')
  it.todo('calls onChange with updated photoUrls on successful delete')
})
