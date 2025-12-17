export default defineAppConfig({
  ui: {
    colors: {
	    accent: 'accent',
    },
    button: {
      compoundVariants: [{
        color: 'accent',
        variant: 'solid',
        class: '-text-inverted'
      }],
      defaultVariants: {
        color: 'accent',
        variant: 'solid',
        size: 'md',
      }
    },
    navigationMenu: {
      defaultVariants: {
        color: 'neutral',
        variant: 'pill',
        highlight: 'soft',
        highlightColor: 'neutral',
      }
    },
    pageCTA: {
      slots: {
        container: 'flex flex-col lg:grid px-6 py-12 sm:px-12 lg:px-16 gap-8 sm:gap-16',
      },
    },
  },
})
