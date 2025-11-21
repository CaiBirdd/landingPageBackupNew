import posthog from 'posthog-js'

export function usePostHog() {
  posthog.init('phc_FrYqhNKgW7LuRGnIZEnOdoFMIAtMlXtyEtVa8BmChym', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2025-05-24',
  })
  
  return { posthog }
}