export function supportsViewTransitions() {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

export function withViewTransition(callback: () => void | Promise<void>) {
  // Check if View Transitions API is supported
  if (!supportsViewTransitions()) {
    callback()
    return
  }

  // Use the View Transitions API
  const doc = document as any
  if (doc.startViewTransition) {
    doc.startViewTransition(callback)
  } else {
    callback()
  }
}
