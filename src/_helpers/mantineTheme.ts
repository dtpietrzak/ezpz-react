import { MantineTheme, Progress, Accordion } from '@mantine/core';

// mantine theme object
export const theme: Partial<MantineTheme> = {
  respectReducedMotion: false,
  components: {
    Progress: Progress.extend({
      styles: {
        root: {
          border: '1px solid rgb(150,150,150)',
          borderRadius: '0.5rem',
          marginBottom: '0.25rem',
        },
      }
    }),
    Accordion: Accordion.extend({
      classNames: {
        // root: 'bg-red-800',
      }
    })
  }
}

export default theme;